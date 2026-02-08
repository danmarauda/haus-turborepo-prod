/**
 * HAUS + Cortex Integration
 *
 * Proper integration using Cortex SDK pattern:
 * - SDK connects directly to Convex (no wrapper API needed)
 * - Use server-side in API routes or voice agent
 *
 * @see https://github.com/SaintNick1214/Project-Cortex
 */

import { Cortex, createAuthContext } from "@cortexmemory/sdk";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface HausCortexConfig {
  convexUrl: string;
  openaiApiKey?: string;
  neo4jUri?: string;
  neo4jUsername?: string;
  neo4jPassword?: string;
  userId?: string;
  tenantId?: string;
}

export interface VoiceSearchParams {
  memorySpaceId: string;
  userId: string;
  userQuery: string;
  agentResponse: string;
  propertyId?: string;
  propertyContext?: Record<string, unknown>;
}

export interface RecallParams {
  memorySpaceId: string;
  query: string;
  limit?: number;
}

// -----------------------------------------------------------------------------
// Singleton Cortex Client
// -----------------------------------------------------------------------------

let cortexInstance: Cortex | null = null;

/**
 * Get or create the Cortex singleton instance
 */
export async function getCortex(config: HausCortexConfig): Promise<Cortex> {
  if (cortexInstance) {
    return cortexInstance;
  }

  // Build Cortex configuration
  const cortexConfig: Record<string, unknown> = {
    convexUrl: config.convexUrl,
  };

  // Add embeddings if OpenAI API key provided
  if (config.openaiApiKey) {
    cortexConfig.embedding = {
      provider: "openai",
      apiKey: config.openaiApiKey,
      model: "text-embedding-3-small",
    };
  }

  // Add fact extraction if OpenAI API key provided
  if (config.openaiApiKey) {
    cortexConfig.llm = {
      provider: "openai",
      apiKey: config.openaiApiKey,
      model: "gpt-4o-2024-11-20",
    };
  }

  // Add auth context if userId provided
  if (config.userId || config.tenantId) {
    cortexConfig.auth = createAuthContext({
      userId: config.userId,
      tenantId: config.tenantId,
      sessionId: undefined,
    });
  }

  // Create Cortex instance
  cortexInstance = await Cortex.create(cortexConfig as any);

  console.log("[HAUS Cortex] Initialized");
  return cortexInstance;
}

/**
 * Shutdown the Cortex instance
 */
export async function shutdownCortex(): Promise<void> {
  if (cortexInstance) {
    await cortexInstance.shutdown();
    cortexInstance = null;
  }
}

// -----------------------------------------------------------------------------
// HAUS-specific Memory Operations
// -----------------------------------------------------------------------------

/**
 * Remember a voice search interaction
 *
 * This stores the conversation and triggers:
 * - Automatic fact extraction (if enabled)
 * - Embedding generation (if enabled)
 * - Graph sync (if enabled)
 */
export async function rememberVoiceSearch(
  cortex: Cortex,
  params: VoiceSearchParams
): Promise<void> {
  // Create conversation
  const conversation = await cortex.conversations.create({
    memorySpaceId: params.memorySpaceId,
    type: "user-agent",
    participants: {
      userId: params.userId,
      agentId: "haus-voice-agent",
    },
    messages: [
      {
        id: `msg-${Date.now()}-1`,
        role: "user" as const,
        content: params.userQuery,
        timestamp: Date.now(),
      },
      {
        id: `msg-${Date.now()}-2`,
        role: "agent" as const,
        content: params.agentResponse,
        timestamp: Date.now() + 1,
      },
    ],
    messageCount: 2,
    metadata: params.propertyContext,
  });

  // Remember with orchestration (facts + embeddings + graph)
  await cortex.memory.remember(params.memorySpaceId, {
    conversationId: conversation.conversationId,
    messages: conversation.messages,
  });

  console.log(
    `[HAUS Cortex] Remembered voice search for user: ${params.userId}`
  );
}

/**
 * Recall relevant memories for a query
 *
 * Returns:
 * - Past conversations about similar properties
 * - Facts about user preferences
 * - Graph relationships (if enabled)
 */
export async function recallForQuery(
  cortex: Cortex,
  params: RecallParams
): Promise<{
  memories: Array<{ content: string; relevance: number }>;
  facts: Array<{ fact: string; confidence: number }>;
  graphEntities?: Array<{
    name: string;
    type: string;
    relationships?: string[];
  }>;
}> {
  const results = await cortex.memory.recall(params.memorySpaceId, {
    query: params.query,
    limits: {
      memories: params.limit || 20,
      facts: params.limit || 15,
      graphHops: 2,
    },
  });

  return {
    memories: results.memories.map((m) => ({
      content: m.content,
      relevance: m.importance || 0.5,
    })),
    facts: results.facts.map((f) => ({
      fact: f.fact,
      confidence: f.confidence,
    })),
    graphEntities: results.graphEntities?.map((e) => ({
      name: e.name,
      type: e.type,
      relationships: e.relations?.map((r) => r.predicate),
    })),
  };
}

/**
 * Ensure user has a memory space
 */
export async function ensureMemorySpace(
  cortex: Cortex,
  userId: string
): Promise<string> {
  // Try to find existing memory space for user
  const spaces = await cortex.memorySpaces.list({
    filter: { type: "personal" },
  });

  // Find a space associated with this user
  let memorySpaceId = spaces.find((s) =>
    s.participants?.some((p) => p.id === userId)
  )?.memorySpaceId;

  // Create new space if none exists
  if (!memorySpaceId) {
    const space = await cortex.memorySpaces.create({
      name: `${userId}-personal`,
      type: "personal",
      participants: [
        {
          id: userId,
          type: "human",
          joinedAt: Date.now(),
        },
      ],
      metadata: { userId },
    });
    memorySpaceId = space.memorySpaceId;
  }

  return memorySpaceId;
}

/**
 * Store a fact about user preference
 */
export async function storePreference(
  cortex: Cortex,
  params: {
    memorySpaceId: string;
    userId: string;
    category: string;
    fact: string;
    confidence: number;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await cortex.facts.put(
    {
      factId: `pref-${params.userId}-${params.category}-${Date.now()}`,
      memorySpaceId: params.memorySpaceId,
      userId: params.userId,
      fact: params.fact,
      factType: "preference",
      subject: params.userId,
      predicate: "prefers",
      object: params.category,
      confidence: params.confidence,
      sourceType: "conversation",
      category: params.category,
      metadata: params.metadata,
      tags: ["preference", params.category],
    },
    params.memorySpaceId
  );
}

/**
 * Get user's preferences by category
 */
export async function getPreferences(
  cortex: Cortex,
  params: { memorySpaceId: string; category?: string }
): Promise<
  Array<{
    factId: string;
    fact: string;
    category: string;
    confidence: number;
    metadata?: Record<string, unknown>;
  }>
> {
  const filter: Record<string, unknown> = {};
  if (params.category) {
    filter.category = params.category;
  }

  const facts = await cortex.facts.list(params.memorySpaceId, { filter });

  return facts
    .filter((f) => f.factType === "preference")
    .map((f) => ({
      factId: f.factId,
      fact: f.fact,
      category: f.category || "",
      confidence: f.confidence,
      metadata: f.metadata as Record<string, unknown> | undefined,
    }));
}

/**
 * Store property interaction memory
 */
export async function storePropertyInteraction(
  cortex: Cortex,
  params: {
    memorySpaceId: string;
    userId: string;
    propertyId: string;
    propertyUrl?: string;
    propertyName?: string;
    propertySuburb?: string;
    propertyState?: string;
    interactionType: "searched" | "viewed" | "saved" | "inquired" | "voice_query";
    queryText?: string;
    sentiment?: "positive" | "neutral" | "negative";
    notes?: string;
  }
): Promise<void> {
  // Store as immutable memory (won't change over time)
  await cortex.immutable.put(
    {
      type: "property-interaction",
      id: `${params.userId}-${params.propertyId}-${Date.now()}`,
      data: {
        userId: params.userId,
        propertyId: params.propertyId,
        propertyUrl: params.propertyUrl,
        propertyName: params.propertyName,
        propertySuburb: params.propertySuburb,
        propertyState: params.propertyState,
        interactionType: params.interactionType,
        queryText: params.queryText,
        sentiment: params.sentiment,
        notes: params.notes,
        timestamp: Date.now(),
      },
      userId: params.userId,
    },
    params.memorySpaceId
  );
}

/**
 * Get property interaction history
 */
export async function getPropertyHistory(
  cortex: Cortex,
  params: { memorySpaceId: string; userId: string; propertyId?: string }
): Promise<
  Array<{
    propertyId: string;
    interactionType: string;
    queryText?: string;
    timestamp: number;
  }>
> {
  const memories = await cortex.immutable.list(params.memorySpaceId, {
    filter: { type: "property-interaction" },
  });

  return memories
    .filter((m) => {
      const data = m.data as { userId?: string; propertyId?: string };
      return (
        data.userId === params.userId &&
        (!params.propertyId || data.propertyId === params.propertyId)
      );
    })
    .map((m) => {
      const data = m.data as {
        propertyId: string;
        interactionType: string;
        queryText?: string;
        timestamp: number;
      };
      return data;
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

// -----------------------------------------------------------------------------
// Utility: Get Cortex health metrics
// -----------------------------------------------------------------------------

export function getCortexHealth(cortex: Cortex): {
  isHealthy: boolean;
  metrics: ReturnType<typeof cortex.getResilienceMetrics>;
} {
  return {
    isHealthy: cortex.isHealthy(),
    metrics: cortex.getResilienceMetrics(),
  };
}
