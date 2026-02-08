/**
 * Vector Search for Cortex Memories
 *
 * Provides semantic search capabilities for the memories table using:
 * - OpenAI text-embedding-3-small for embeddings (1536 dimensions)
 * - Convex vector indexes for similarity search
 * - Hybrid search combining vector similarity, full-text search, and metadata
 *
 * @see schema.ts for memories table and by_embedding vector index
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { ANONYMOUS_USER } from "../lib/constants";

// =============================================================================
// User Lookup Helper
// =============================================================================

/**
 * Get user by email or ID
 * Inlined from cortex.ts pattern to avoid circular dependencies
 */
async function getUserByEmail(
  ctx: any,
  email: string | undefined
) {
  if (!email || email === ANONYMOUS_USER) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", email))
    .first();
}

// =============================================================================
// Types
// =============================================================================

/**
 * Memory search result with similarity scores
 */
export interface MemorySearchResult {
  memoryId: string;
  content: string;
  contentType: string;
  sourceType: string;
  importance: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  // Scoring
  vectorSimilarity: number;
  textMatchScore?: number;
  recencyScore: number;
  finalScore: number;
  // Optional refs
  conversationRef?: {
    conversationId: string;
    messageIds: string[];
  };
  metadata?: Record<string, unknown>;
}

/**
 * Search options for memory queries
 */
interface SearchOptions {
  limit?: number;
  vectorWeight?: number;
  textWeight?: number;
  recencyWeight?: number;
  importanceWeight?: number;
  minSimilarity?: number;
  tags?: string[];
  sourceType?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  limit: 10,
  vectorWeight: 0.5,
  textWeight: 0.2,
  recencyWeight: 0.15,
  importanceWeight: 0.15,
  minSimilarity: 0.7,
  tags: [],
  sourceType: "",
};

// Decay constant for recency scoring (memories older than 30 days score ~0.5)
const RECENCY_DECAY_DAYS = 30;
const RECENCY_DECAY_MS = RECENCY_DECAY_DAYS * 24 * 60 * 60 * 1000;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate embedding vector for text using OpenAI
 *
 * Uses text-embedding-3-small for optimal cost/quality ratio
 * Returns 1536-dimensional vector matching the schema definition
 *
 * @param text - The text to embed
 * @returns Array of 1536 floats
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embed({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    value: text,
  });

  return result.embedding;
}

/**
 * Calculate cosine similarity between two vectors
 *
 * Convex vector search uses cosine similarity internally,
 * but this is useful for client-side scoring or combining results
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between -1 and 1
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimension mismatch: ${a.length} vs ${b.length}`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Calculate recency score using exponential decay
 *
 * Recent memories get higher scores, decaying exponentially over time.
 * A memory from 30 days ago scores ~0.5, 60 days ago ~0.25, etc.
 *
 * @param timestamp - Memory creation/update timestamp
 * @returns Score between 0 and 1
 */
export function calculateRecencyScore(timestamp: number): number {
  const ageMs = Date.now() - timestamp;
  const score = Math.exp(-ageMs / RECENCY_DECAY_MS);
  return Math.max(0, Math.min(1, score));
}

/**
 * Normalize importance score to 0-1 range
 *
 * Memories have importance 0-100, normalize for scoring
 *
 * @param importance - Raw importance (0-100)
 * @returns Normalized score (0-1)
 */
export function normalizeImportance(importance: number): number {
  return Math.max(0, Math.min(1, importance / 100));
}

/**
 * Calculate final hybrid score combining multiple signals
 *
 * Formula:
 *   final = (vectorSim * vectorWeight) +
 *           (textMatch * textWeight) +
 *           (recency * recencyWeight) +
 *           (importance * importanceWeight)
 *
 * @param scores - Individual component scores
 * @param weights - Weights for each component
 * @returns Final weighted score
 */
export function calculateHybridScore(
  scores: {
    vectorSimilarity: number;
    textMatchScore: number;
    recencyScore: number;
    importanceScore: number;
  },
  weights: {
    vectorWeight: number;
    textWeight: number;
    recencyWeight: number;
    importanceWeight: number;
  }
): number {
  const {
    vectorSimilarity,
    textMatchScore,
    recencyScore,
    importanceScore,
  } = scores;
  const { vectorWeight, textWeight, recencyWeight, importanceWeight } = weights;

  // Normalize weights to ensure they sum to 1
  const totalWeight = vectorWeight + textWeight + recencyWeight + importanceWeight;
  const normVectorWeight = vectorWeight / totalWeight;
  const normTextWeight = textWeight / totalWeight;
  const normRecencyWeight = recencyWeight / totalWeight;
  const normImportanceWeight = importanceWeight / totalWeight;

  return (
    vectorSimilarity * normVectorWeight +
    textMatchScore * normTextWeight +
    recencyScore * normRecencyWeight +
    importanceScore * normImportanceWeight
  );
}

// =============================================================================
// Convex Actions
// =============================================================================

/**
 * Search memories by vector similarity
 *
 * Generates an embedding from the text query and performs a vector search
 * against the memories table. Results are filtered by memorySpaceId (user scope)
 * and ranked by similarity score.
 *
 * @param textQuery - The search query text
 * @param userId - User ID for access control
 * @param limit - Maximum number of results (default: 10)
 * @param minSimilarity - Minimum similarity threshold (default: 0.7)
 * @param tags - Optional filter by tags
 * @returns Ranked memory results with similarity scores
 *
 * @example
 * ```typescript
 * const results = await ctx.runAction(api.vectorSearch.searchMemoriesByVector, {
 *   textQuery: "houses with pools in Bondi",
 *   userId: "user-123",
 *   limit: 20
 * });
 * ```
 */
export const searchMemoriesByVector = action({
  args: {
    textQuery: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
    minSimilarity: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<MemorySearchResult[]> => {
    const {
      textQuery,
      userId,
      limit = DEFAULT_SEARCH_OPTIONS.limit,
      minSimilarity = DEFAULT_SEARCH_OPTIONS.minSimilarity,
      tags = [],
    } = args;

    // Get user's memory space
    const userRecord = await getUserByEmail(
      ctx,
      userId === ANONYMOUS_USER ? undefined : userId
    );

    if (!userRecord || !userRecord.memorySpaceId) {
      return [];
    }

    const memorySpaceId = userRecord.memorySpaceId;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(textQuery);

    // Perform vector search using the by_embedding index
    // This uses Convex's built-in vector similarity search
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_embedding", (q) =>
        q
          .eq("memorySpaceId", memorySpaceId)
          .searchVector("embedding", queryEmbedding)
      )
      .take(limit * 2); // Fetch extra for filtering

    // Calculate scores and filter by minimum similarity
    const results: MemorySearchResult[] = [];

    for (const memory of memories) {
      // Skip if memory has no embedding
      if (!memory.embedding || memory.embedding.length === 0) continue;

      // Calculate vector similarity (Convex returns roughly cosine similarity)
      const vectorSimilarity = calculateCosineSimilarity(
        queryEmbedding,
        memory.embedding
      );

      // Skip if below threshold
      if (vectorSimilarity < minSimilarity) continue;

      // Filter by tags if specified
      if (tags.length > 0 && !tags.some((t) => memory.tags.includes(t))) {
        continue;
      }

      // Calculate recency and importance scores
      const recencyScore = calculateRecencyScore(memory.updatedAt || memory.createdAt);
      const importanceScore = normalizeImportance(memory.importance);

      // Final score combines vector similarity with recency and importance
      const finalScore = calculateHybridScore(
        {
          vectorSimilarity,
          textMatchScore: 0, // Not used in pure vector search
          recencyScore,
          importanceScore,
        },
        {
          vectorWeight: 0.7,
          textWeight: 0,
          recencyWeight: 0.15,
          importanceWeight: 0.15,
        }
      );

      results.push({
        memoryId: memory.memoryId,
        content: memory.content,
        contentType: memory.contentType,
        sourceType: memory.sourceType,
        importance: memory.importance,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
        tags: memory.tags,
        vectorSimilarity,
        recencyScore,
        finalScore,
        conversationRef: memory.conversationRef,
        metadata: memory.metadata as Record<string, unknown> | undefined,
      });
    }

    // Sort by final score descending
    results.sort((a, b) => b.finalScore - a.finalScore);

    // Return top results
    return results.slice(0, limit);
  },
});

/**
 * Hybrid search combining vector similarity, full-text search, and metadata
 *
 * This is the primary search function for Cortex memories. It combines:
 * 1. Vector similarity (semantic meaning)
 * 2. Full-text search (keyword matching via Convex search index)
 * 3. Recency weighting (favor recent memories)
 * 4. Importance weighting (favor important memories)
 *
 * The hybrid approach provides better results than vector search alone,
 * especially for queries with specific keywords or recent context.
 *
 * @param textQuery - The search query text
 * @param userId - User ID for access control
 * @param options - Search configuration options
 * @returns Ranked memory results with detailed scores
 *
 * @example
 * ```typescript
 * const results = await ctx.runAction(api.vectorSearch.searchMemoriesHybrid, {
 *   textQuery: "show me beach houses I liked",
 *   userId: "user-123",
 *   options: {
 *     limit: 15,
 *     vectorWeight: 0.5,
 *     textWeight: 0.25,
 *     recencyWeight: 0.15,
 *     importanceWeight: 0.1
 *   }
 * });
 * ```
 */
export const searchMemoriesHybrid = action({
  args: {
    textQuery: v.string(),
    userId: v.string(),
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        vectorWeight: v.optional(v.number()),
        textWeight: v.optional(v.number()),
        recencyWeight: v.optional(v.number()),
        importanceWeight: v.optional(v.number()),
        minSimilarity: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
        sourceType: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<MemorySearchResult[]> => {
    const { textQuery, userId, options = {} } = args;

    // Merge options with defaults
    const config: Required<SearchOptions> = {
      ...DEFAULT_SEARCH_OPTIONS,
      ...options,
    };

    // Get user's memory space
    const userRecord = await getUserByEmail(
      ctx,
      userId === ANONYMOUS_USER ? undefined : userId
    );

    if (!userRecord || !userRecord.memorySpaceId) {
      return [];
    }

    const memorySpaceId = userRecord.memorySpaceId;

    // Generate embedding for vector search
    const queryEmbedding = await generateEmbedding(textQuery);

    // Run both vector search and full-text search in parallel
    const [vectorResults, textResults] = await Promise.all([
      // Vector search
      ctx.db
        .query("memories")
        .withIndex("by_embedding", (q) =>
          q
            .eq("memorySpaceId", memorySpaceId)
            .searchVector("embedding", queryEmbedding)
        )
        .take(config.limit * 3),

      // Full-text search using Convex search index
      ctx.db
        .query("memories")
        .withSearchIndex("by_content", (q) =>
          q
            .search("content", textQuery)
            .eq("memorySpaceId", memorySpaceId)
        )
        .take(config.limit * 3),
    ]);

    // Create a map to deduplicate and merge results
    const memoryMap = new Map<string, MemorySearchResult>();

    // Process vector search results
    for (const memory of vectorResults) {
      // Skip if no embedding
      if (!memory.embedding || memory.embedding.length === 0) continue;

      // Filter by sourceType if specified
      if (config.sourceType && memory.sourceType !== config.sourceType) {
        continue;
      }

      // Filter by tags if specified
      if (
        config.tags.length > 0 &&
        !config.tags.some((t) => memory.tags.includes(t))
      ) {
        continue;
      }

      const vectorSimilarity = calculateCosineSimilarity(
        queryEmbedding,
        memory.embedding
      );

      // Skip if below minimum similarity
      if (vectorSimilarity < config.minSimilarity) continue;

      const recencyScore = calculateRecencyScore(memory.updatedAt || memory.createdAt);
      const importanceScore = normalizeImportance(memory.importance);

      memoryMap.set(memory.memoryId, {
        memoryId: memory.memoryId,
        content: memory.content,
        contentType: memory.contentType,
        sourceType: memory.sourceType,
        importance: memory.importance,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
        tags: memory.tags,
        vectorSimilarity,
        textMatchScore: 0, // Will be updated if found in text results
        recencyScore,
        finalScore: 0, // Will be calculated after merging
        conversationRef: memory.conversationRef,
        metadata: memory.metadata as Record<string, unknown> | undefined,
      });
    }

    // Process full-text search results and merge
    for (const memory of textResults) {
      // Filter by sourceType if specified
      if (config.sourceType && memory.sourceType !== config.sourceType) {
        continue;
      }

      // Filter by tags if specified
      if (
        config.tags.length > 0 &&
        !config.tags.some((t) => memory.tags.includes(t))
      ) {
        continue;
      }

      const existing = memoryMap.get(memory.memoryId);

      // Calculate text match score based on search ranking (1.0 for first result, decreasing)
      const textRank = textResults.indexOf(memory);
      const textMatchScore = Math.max(0, 1 - textRank / textResults.length);

      if (existing) {
        // Update with text match score
        existing.textMatchScore = textMatchScore;
      } else {
        // Add new result from text search
        const recencyScore = calculateRecencyScore(memory.updatedAt || memory.createdAt);
        const importanceScore = normalizeImportance(memory.importance);

        memoryMap.set(memory.memoryId, {
          memoryId: memory.memoryId,
          content: memory.content,
          contentType: memory.contentType,
          sourceType: memory.sourceType,
          importance: memory.importance,
          createdAt: memory.createdAt,
          updatedAt: memory.updatedAt,
          tags: memory.tags,
          vectorSimilarity: 0, // Not from vector search
          textMatchScore,
          recencyScore,
          finalScore: 0,
          conversationRef: memory.conversationRef,
          metadata: memory.metadata as Record<string, unknown> | undefined,
        });
      }
    }

    // Calculate final scores for all results
    const results: MemorySearchResult[] = [];

    for (const result of memoryMap.values()) {
      // Ensure textMatchScore has a value
      const textMatchScore = result.textMatchScore ?? 0;

      const finalScore = calculateHybridScore(
        {
          vectorSimilarity: result.vectorSimilarity,
          textMatchScore,
          recencyScore: result.recencyScore,
          importanceScore: normalizeImportance(result.importance),
        },
        {
          vectorWeight: config.vectorWeight,
          textWeight: config.textWeight,
          recencyWeight: config.recencyWeight,
          importanceWeight: config.importanceWeight,
        }
      );

      results.push({
        ...result,
        textMatchScore,
        finalScore,
      });
    }

    // Sort by final score descending
    results.sort((a, b) => b.finalScore - a.finalScore);

    // Return top results
    return results.slice(0, config.limit);
  },
});

// =============================================================================
// Query Helpers (for direct DB access without embedding generation)
// =============================================================================

/**
 * Search memories by pre-computed embedding vector
 *
 * Use this when you already have an embedding (e.g., from cache)
 * and don't need to generate one. This is a query (not action)
 * since it doesn't make external API calls.
 *
 * @param embedding - Pre-computed embedding vector (1536 dims)
 * @param memorySpaceId - The memory space to search
 * @param limit - Maximum results
 * @returns Memories ranked by vector similarity
 */
export const searchByEmbeddingVector = query({
  args: {
    embedding: v.array(v.float64()),
    memorySpaceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { embedding, memorySpaceId, limit = 10 } = args;

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_embedding", (q) =>
        q.eq("memorySpaceId", memorySpaceId).searchVector("embedding", embedding)
      )
      .take(limit);

    return memories.map((memory) => ({
      memoryId: memory.memoryId,
      content: memory.content,
      contentType: memory.contentType,
      sourceType: memory.sourceType,
      importance: memory.importance,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      tags: memory.tags,
      conversationRef: memory.conversationRef,
    }));
  },
});

/**
 * Simple full-text search for memories
 *
 * Uses Convex's search index for fast text matching.
 * No vector similarity - pure keyword search.
 *
 * @param query - Text query
 * @param memorySpaceId - The memory space to search
 * @param limit - Maximum results
 * @returns Memories matching the text query
 */
export const searchByText = query({
  args: {
    query: v.string(),
    memorySpaceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, memorySpaceId, limit = 10 } = args;

    const memories = await ctx.db
      .query("memories")
      .withSearchIndex("by_content", (q) =>
        q.search("content", query).eq("memorySpaceId", memorySpaceId)
      )
      .take(limit);

    return memories.map((memory) => ({
      memoryId: memory.memoryId,
      content: memory.content,
      contentType: memory.contentType,
      sourceType: memory.sourceType,
      importance: memory.importance,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      tags: memory.tags,
      conversationRef: memory.conversationRef,
    }));
  },
});

// =============================================================================
// Utility Actions
// =============================================================================

/**
 * Get embedding for text (utility for client-side caching)
 *
 * Allows clients to generate embeddings and cache them
 * for subsequent searches without regenerating.
 *
 * @param text - Text to embed
 * @returns The embedding vector
 */
export const getEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (_ctx, args) => {
    const { text } = args;
    const embedding = await generateEmbedding(text);
    return { embedding };
  },
});

/**
 * Batch generate embeddings for multiple texts
 *
 * Efficient for indexing or pre-computing embeddings.
 *
 * @param texts - Array of texts to embed
 * @returns Array of embeddings
 */
export const getEmbeddingsBatch = action({
  args: {
    texts: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const { texts } = args;

    // Generate embeddings sequentially (API limit consideration)
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    }

    return { embeddings };
  },
});
