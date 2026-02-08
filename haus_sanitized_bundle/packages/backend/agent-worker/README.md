# HAUS Voice Agent - LiveKit Agent Worker

A voice AI agent for HAUS property search, built with LiveKit Agents framework and integrated with Cortex memory system.

## Features

- **Voice Conversation**: Natural voice interaction via LiveKit
- **Property Search**: Search properties by location, budget, bedrooms, etc.
- **Memory System**: Remembers user preferences and conversation history via Cortex
- **Multi-Model Pipeline**:
  - STT: AssemblyAI Universal Streaming
  - LLM: OpenAI GPT-4o-mini
  - TTS: Cartesia Sonic-3 (expressive voice)
- **Turn Detection**: Multilingual turn detection for natural conversations
- **Noise Cancellation**: Background noise suppression

## Setup

### Prerequisites

- Python 3.10+
- LiveKit Cloud account
- Convex deployment
- OpenAI API key

### Installation

```bash
# Using uv (recommended)
pip install uv
uv sync

# Download model files
uv run agent.py download-files
```

### Configuration

Create a `.env` file:

```bash
# LiveKit Cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# Convex Backend
CONVEX_URL=https://your-convex-deployment.convex.cloud

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: ElevenLabs for alternative TTS
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## Running

### Local Development (Console Mode)

Test the agent in your terminal:

```bash
uv run agent.py console
```

### Development Mode

Connect to LiveKit Cloud for testing with mobile/web apps:

```bash
uv run agent.py dev
```

### Production Mode

```bash
uv run agent.py start
```

## Deploy to LiveKit Cloud

```bash
# Install LiveKit CLI
brew install livekit-cli

# Authenticate
lk cloud auth

# Deploy
lk agent create
```

## Agent Tools

The agent has the following function tools:

### `search_properties`
Search for properties matching criteria.
- `location`: Suburb or region
- `budget_min`, `budget_max`: Price range in AUD
- `bedrooms`: Number of bedrooms
- `property_type`: house, apartment, townhouse

### `remember_preference`
Store user preferences for future conversations.
- `category`: suburb, price, property_type
- `preference`: The specific value
- `is_positive`: Whether user likes it

### `get_property_details`
Get detailed information about a specific property.
- `property_id`: Unique property identifier

## Cortex Memory Integration

The agent automatically:
1. **Loads user context** at session start from Cortex memory
2. **Injects preferences** into each conversation turn
3. **Stores conversations** after each interaction
4. **Tracks property views** for recommendation improvement

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile/App │────▶│ LiveKit Room │────▶│ HAUS Agent  │
│  (React     │     │  (SFU)       │     │  (Python)   │
│   Native)   │     │              │     │              │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                   │
                              ┌──────────────────────────────┐
                              │  Cortex Memory (Convex)      │
                              │  - Conversations            │
                              │  - User Preferences          │
                              │  - Property Interactions     │
                              │  - Suburb Preferences        │
                              └──────────────────────────────┘
```

## Testing

Run the agent in console mode for quick testing:

```bash
uv run agent.py console
```

Then speak to test:
- "Show me houses in Bondi under $2 million"
- "I prefer 3 bedrooms"
- "What's the price of prop-001?"
- "I love the Eastern Suburbs"

## Troubleshooting

### Model files not found
```bash
uv run agent.py download-files
```

### Connection refused
Check that LIVEKIT_URL is correct and API keys are valid.

### Memory not working
Verify CONVEX_URL points to your Convex deployment and Cortex functions are deployed.

## Development

To add new function tools:

1. Add a new method to `HausAgent` class
2. Use the `@function_tool()` decorator
3. Add proper docstring with Args/Returns sections
4. Implement the function logic

Example:
```python
@function_tool()
async def my_new_tool(
    self,
    context: RunContext,
    param: str,
) -> str:
    """
    Description of what the tool does.

    Args:
        param: Description of parameter

    Returns:
        Description of return value
    """
    return f"Result: {param}"
```
