"""
HAUS Voice Agent - LiveKit Agent Worker

A voice AI agent for HAUS property search using LiveKit Agents framework.
Integrates with Cortex memory system for personalized property recommendations.

Architecture:
- STT: AssemblyAI Universal Streaming (multilingual)
- LLM: OpenAI GPT-4o-mini
- TTS: Cartesia Sonic-3 (expressive voice)
- Memory: Cortex (Convex) for user preferences and conversation history

Environment Variables Required:
    LIVEKIT_API_KEY         - LiveKit Cloud API key
    LIVEKIT_API_SECRET      - LiveKit Cloud API secret
    LIVEKIT_URL             - LiveKit Cloud WebSocket URL
    CONVEX_URL              - Convex deployment URL
    OPENAI_API_KEY          - OpenAI API key (for LLM)
    ELEVENLABS_API_KEY       - ElevenLabs API key (optional, for alternative TTS)
"""

import asyncio
import json
import os
from dataclasses import dataclass
from typing import Any

import httpx
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import (
    Agent,
    AgentSession,
    AgentServer,
    ChatContext,
    ChatMessage,
    RunContext,
    function_tool,
    room_io,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()


# =============================================================================
# Configuration
# =============================================================================

@dataclass
class HausConfig:
    """HAUS Voice Agent Configuration"""

    # LiveKit
    livekit_api_key: str
    livekit_api_secret: str
    livekit_url: str

    # Convex Backend
    convex_url: str

    # AI Models
    openai_api_key: str
    elevenlabs_api_key: str | None = None

    # Agent Settings
    stt: str = "assemblyai/universal-streaming:en"
    llm: str = "openai/gpt-4o-mini"
    tts: str = "cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
    tts_voice: str = "coral"

    @classmethod
    def from_env(cls) -> "HausConfig":
        """Load configuration from environment variables"""
        return cls(
            livekit_api_key=os.getenv("LIVEKIT_API_KEY", ""),
            livekit_api_secret=os.getenv("LIVEKIT_API_SECRET", ""),
            livekit_url=os.getenv("LIVEKIT_URL", ""),
            convex_url=os.getenv("CONVEX_URL", os.getenv("NEXT_PUBLIC_CONVEX_URL", "")),
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY", ""),
        )


# =============================================================================
# Convex/Cortex Client
# =============================================================================

class ConvexClient:
    """Client for calling Convex Cortex functions from the agent"""

    def __init__(self, config: HausConfig):
        self.config = config
        self.base_url = config.convex_url.rstrip("/")
        self.http_client = httpx.AsyncClient(timeout=30.0)

    async def ensure_memory_space(self, user_id: str) -> str | None:
        """Ensure user has a memory space, return the ID"""
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/cortex/ensure-memory-space",
                json={"userId": user_id},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("memorySpaceId")
        except Exception as e:
            print(f"[ConvexClient] Failed to ensure memory space: {e}")
            return None

    async def recall_context(
        self, user_id: str, query: str, limit: int = 10
    ) -> dict[str, Any]:
        """Recall relevant context from Cortex memory"""
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/cortex/recall",
                json={
                    "userId": user_id,
                    "query": query,
                    "limit": limit,
                },
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[ConvexClient] Failed to recall context: {e}")
            return {
                "memories": [],
                "facts": [],
                "propertyInteractions": [],
                "suburbPreferences": [],
            }

    async def remember_conversation(
        self,
        user_id: str,
        user_query: str,
        agent_response: str,
        property_id: str | None = None,
        property_context: dict[str, Any] | None = None,
    ) -> bool:
        """Store conversation in Cortex memory"""
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/cortex/remember",
                json={
                    "userId": user_id,
                    "userQuery": user_query,
                    "agentResponse": agent_response,
                    "propertyId": property_id,
                    "propertyContext": property_context,
                },
            )
            response.raise_for_status()
            return response.json().get("success", False)
        except Exception as e:
            print(f"[ConvexClient] Failed to remember conversation: {e}")
            return False

    async def store_preference(
        self,
        user_id: str,
        category: str,
        preference: str,
        confidence: int,
        metadata: dict[str, Any] | None = None,
    ) -> bool:
        """Store a user preference in Cortex"""
        try:
            response = await self.http_client.post(
                f"{self.base_url}/api/cortex/store-preference",
                json={
                    "userId": user_id,
                    "category": category,
                    "preference": preference,
                    "confidence": confidence,
                    "metadata": metadata,
                },
            )
            response.raise_for_status()
            return response.json().get("success", False)
        except Exception as e:
            print(f"[ConvexClient] Failed to store preference: {e}")
            return False

    async def close(self):
        """Close the HTTP client"""
        await self.http_client.aclose()


# =============================================================================
# HAUS Voice Agent
# =============================================================================

class HausAgent(Agent):
    """HAUS Property Search Voice Agent with Cortex Memory"""

    def __init__(
        self,
        config: HausConfig,
        convex: ConvexClient,
        user_id: str,
        initial_ctx: ChatContext | None = None,
    ):
        self.config = config
        self.convex = convex
        self.user_id = user_id

        # Build initial instructions with memory context
        instructions = self._build_instructions()

        super().__init__(
            chat_ctx=initial_ctx or ChatContext(),
            instructions=instructions,
        )

    def _build_instructions(self) -> str:
        """Build agent instructions with HAUS-specific context"""
        return """You are HAUS, an AI voice assistant for Australian real estate.

Your role is to help users find properties that match their needs. You have access to:
- Property search capabilities
- User preference memory (suburbs they like/dislike, price ranges, etc.)
- Past conversation history

Key Guidelines:
1. Be conversational and friendly - use Australian English naturally
2. Ask clarifying questions about their property requirements
3. Remember their preferences for future conversations
4. Suggest properties based on their stated preferences and past interactions
5. When you learn a new preference (e.g., "I like Bondi"), store it using the remember_preference tool
6. Keep responses concise - voice conversations should be brief

Property Search Parameters to Collect:
- Location (suburbs, regions)
- Budget/price range
- Property type (house, apartment, townhouse)
- Bedrooms/bathrooms
- Parking requirements
- Special requirements (pets, pool, etc.)

When you find a property that might interest them, mention the key details clearly.
If you don't have enough information to search, ask for more details."""

    async def on_user_turn_completed(
        self, turn_ctx: ChatContext, new_message: ChatMessage
    ) -> None:
        """Called after user finishes speaking - inject memory context before LLM response"""
        # Recall relevant context from Cortex based on user's query
        context = await self.convex.recall_context(
            user_id=self.user_id,
            query=new_message.text_content or "",
            limit=10,
        )

        # Inject suburb preferences as context
        if context.get("suburbPreferences"):
            prefs = context["suburbPreferences"][:5]  # Top 5
            pref_summary = ", ".join([
                f"{p['suburbName']} (score: {p['preferenceScore']})"
                for p in prefs
            ])
            turn_ctx.add_message(
                role="assistant",
                content=f"User's suburb preferences: {pref_summary}"
            )

        # Inject learned facts
        if context.get("facts"):
            facts = context["facts"][:5]  # Top 5 facts
            for fact in facts:
                turn_ctx.add_message(
                    role="assistant",
                    content=f"Remembered: {fact['fact']} (confidence: {fact['confidence']}%)"
                )

        # Inject recent property interactions
        if context.get("propertyInteractions"):
            interactions = context["propertyInteractions"][:3]
            for interaction in interactions:
                turn_ctx.add_message(
                    role="assistant",
                    content=f"User recently viewed: {interaction['propertyId']} ({interaction['interactionType']})"
                )

    @function_tool()
    async def search_properties(
        self,
        context: RunContext,
        location: str,
        budget_min: int | None = None,
        budget_max: int | None = None,
        bedrooms: int | None = None,
        property_type: str | None = None,
    ) -> str:
        """
        Search for properties matching the user's criteria.

        Args:
            location: Preferred suburb or region (e.g., "Bondi", "Eastern Suburbs")
            budget_min: Minimum budget in AUD
            budget_max: Maximum budget in AUD
            bedrooms: Number of bedrooms required
            property_type: Type of property (house, apartment, townhouse)

        Returns:
            A summary of available properties matching the criteria.
        """
        # In production, this would call the actual property search API
        # For now, return a mock response
        results = [
            {
                "id": "prop-001",
                "address": f"{bedrooms or 3} Bedroom {property_type or 'House'} in {location}",
                "price": budget_max or 1500000,
                "bedrooms": bedrooms or 3,
                "bathrooms": 2,
                "description": "Modern property with great natural light",
            },
            {
                "id": "prop-002",
                "address": f"{bedrooms or 2} Bedroom Apartment in {location}",
                "price": (budget_max or 1000000) - 200000,
                "bedrooms": bedrooms or 2,
                "bathrooms": 1,
                "description": "Recently renovated with new kitchen",
            },
        ]

        # Store this search as a property interaction
        for prop in results:
            await self.convex.remember_conversation(
                user_id=self.user_id,
                user_query=f"Search for properties in {location}",
                agent_response=json.dumps({"results": results}),
                property_id=prop["id"],
                property_context=prop,
            )

        return f"Found {len(results)} properties in {location}. "
        f"The top match is a {results[0]['bedrooms']} bedroom at ${results[0]['price']:,}. "
        f"Would you like more details about any of these?"

    @function_tool()
    async def remember_preference(
        self,
        context: RunContext,
        category: str,
        preference: str,
        is_positive: bool = True,
    ) -> str:
        """
        Remember a user preference for future conversations.

        Args:
            category: Category of preference (suburb, price, property_type, etc.)
            preference: The specific preference value
            is_positive: True if user likes this, False if they dislike it

        Returns:
            Confirmation that the preference was saved.
        """
        confidence = 80 if is_positive else 70  # High confidence for stated preferences

        metadata = {
            "mentionedInQuery": context.session.chat_context[-1].text_content if context.session.chat_context else None,
        }

        if category == "suburb":
            # Parse suburb name and state
            parts = preference.split(", ")
            suburb = parts[0]
            state = parts[1] if len(parts) > 1 else "NSW"
            metadata["suburbName"] = suburb
            metadata["state"] = state
            metadata["reason"] = "User stated this directly"

        success = await self.convex.store_preference(
            user_id=self.user_id,
            category=category,
            preference=preference,
            confidence=confidence,
            metadata=metadata,
        )

        if success:
            sentiment = "love" if is_positive else "prefer to avoid"
            return f"Got it! I'll remember you {sentiment} {preference} for future searches."
        else:
            return "I had trouble saving that preference, but I'll keep it in mind for this conversation."

    @function_tool()
    async def get_property_details(
        self,
        context: RunContext,
        property_id: str,
    ) -> str:
        """
        Get detailed information about a specific property.

        Args:
            property_id: The unique identifier of the property

        Returns:
            Detailed property information including address, price, features, etc.
        """
        # Mock property details - in production, fetch from actual API
        properties = {
            "prop-001": {
                "id": "prop-001",
                "address": "42 Ocean Street, Bondi Beach NSW 2026",
                "price": 1500000,
                "bedrooms": 3,
                "bathrooms": 2,
                "parking": 1,
                "landsize": "450m²",
                "year": 2020,
                "features": ["Ocean views", "Modern kitchen", "Air conditioning", "Close to beach"],
                "description": "Stunning modern home with breathtaking ocean views. Recently renovated with premium finishes throughout.",
            },
            "prop-002": {
                "id": "prop-002",
                "address": "15 Beach Road, Bondi Beach NSW 2026",
                "price": 800000,
                "bedrooms": 2,
                "bathrooms": 1,
                "parking": 1,
                "landsize": "120m²",
                "year": 2019,
                "features": ["New kitchen", "Floorboards", "North facing"],
                "description": "Chic apartment in prime location, moments from the beach.",
            },
        }

        prop = properties.get(property_id)
        if not prop:
            return f"Sorry, I couldn't find details for property {property_id}."

        # Track this property view
        await self.convex.remember_conversation(
            user_id=self.user_id,
            user_query=f"Get details for {property_id}",
            agent_response=json.dumps(prop),
            property_id=property_id,
            property_context=prop,
        )

        details = (
            f"{prop['address']}\n"
            f"Price: ${prop['price']:,}\n"
            f"{prop['bedrooms']} bed, {prop['bathrooms']} bath, {prop['parking']} parking\n"
            f"Built: {prop['year']}\n\n"
            f"Features: {', '.join(prop['features'][:3])}\n\n"
            f"{prop['description']}"
        )
        return details


# =============================================================================
# Agent Server
# =============================================================================

server = AgentServer()

# Global configuration and client (initialized in prewarm)
_config: HausConfig | None = None


@server.prewarm()
async def load_model_files():
    """Download required model files (VAD, turn detector)"""
    from livekit.plugins import silero
    from livekit.plugins.turn_detector.multilingual import MultilingualModel

    print("[HAUS Agent] Loading model files...")
    await silero.VAD.load()
    await MultilingualModel.load()
    print("[HAUS Agent] Model files loaded")


@server.rtc_session()
async def haus_agent(ctx: agents.JobContext):
    """Main entry point for HAUS voice agent"""
    global _config

    if _config is None:
        _config = HausConfig.from_env()

    # Extract user ID from job metadata or participant identity
    job_metadata = json.loads(ctx.job.metadata) if ctx.job.metadata else {}
    user_id = job_metadata.get("userId") or ctx.room.name or "anonymous"

    print(f"[HAUS Agent] Starting session for user: {user_id}")

    # Initialize Convex client
    convex = ConvexClient(_config)

    try:
        # Ensure user has a memory space
        memory_space_id = await convex.ensure_memory_space(user_id)
        if memory_space_id:
            print(f"[HAUS Agent] Using memory space: {memory_space_id}")
        else:
            print("[HAUS Agent] Warning: Could not ensure memory space")

        # Build initial context with memory
        initial_ctx = ChatContext()
        initial_ctx.add_message(
            role="assistant",
            content=f"You are speaking with user {user_id}. "
            f"Greet them warmly and ask how you can help with their property search today.",
        )

        # Create the agent
        agent = HausAgent(
            config=_config,
            convex=convex,
            user_id=user_id,
            initial_ctx=initial_ctx,
        )

        # Configure the voice pipeline
        session = AgentSession(
            stt=_config.stt,
            llm=_config.llm,
            tts=_config.tts,
            vad=silero.VAD.load(),
            turn_detection=MultilingualModel(),
        )

        # Start the session
        await session.start(
            room=ctx.room,
            agent=agent,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    noise_cancellation=lambda params: (
                        noise_cancellation.BVCTelephony()
                        if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                        else noise_cancellation.BVC()
                    )
                ),
            ),
        )

        # Generate initial greeting
        await session.generate_reply(
            instructions="Greet the user warmly, mention you're HAUS their property assistant, "
            "and ask what they're looking for. Keep it brief and conversational."
        )

        print("[HAUS Agent] Session started successfully")

    except Exception as e:
        print(f"[HAUS Agent] Error during session: {e}")
        raise
    finally:
        await convex.close()


if __name__ == "__main__":
    import sys

    # Check required environment variables
    config = HausConfig.from_env()
    missing = []

    if not config.livekit_api_key:
        missing.append("LIVEKIT_API_KEY")
    if not config.livekit_api_secret:
        missing.append("LIVEKIT_API_SECRET")
    if not config.convex_url:
        missing.append("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL")
    if not config.openai_api_key:
        missing.append("OPENAI_API_KEY")

    if missing:
        print(f"[HAUS Agent] Missing required environment variables: {', '.join(missing)}")
        print("[HAUS Agent] Please set these in your .env file or environment")
        sys.exit(1)

    # Run the agent server
    print("[HAUS Agent] Starting HAUS Voice Agent server...")
    agents.cli.run_app(server)
