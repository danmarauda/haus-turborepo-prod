/**
 * HAUS + Cortex Integration
 *
 * Convex functions that use the Cortex SDK for voice agent memory.
 * These are called by the HAUS voice agent (LiveKit, ElevenLabs, etc.)
 *
 * Usage:
 * - Remember voice searches and user preferences
 * - Recall relevant context for property searches
 * - Track property interactions
 */

import { v } from "convex/values";
import { ANONYMOUS_USER } from "../lib/constants";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { RateLimits, assertRateLimit } from "./rateLimit";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Remember a voice search interaction
 *
 * This stores the conversation in Cortex and triggers:
 * - Automatic fact extraction (user preferences)
 * - Embedding generation (semantic search)
 * - Graph sync (Neo4j knowledge graph)
 *
 * @param userId - User ID from auth
 * @param userQuery - What the user said/asked
 * @param agentResponse - What the agent responded
 * @param propertyContext - Optional property details (id, suburb, price, etc.)
 * Rate limit: 200 requests/minute per user (memory operations)
 */
export const rememberVoiceSearch = mutation({
  args: {
    userId: v.string(),
    userQuery: v.string(),
    agentResponse: v.string(),
    propertyId: v.optional(v.string()),
    propertyContext: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, userQuery, agentResponse, propertyId, propertyContext } = args;

    // Apply rate limiting
    const identifier = userId !== ANONYMOUS_USER ? `user:${userId}` : `anon:${ctx.runId}`;
    await assertRateLimit(
      ctx,
      identifier,
      RateLimits.MEMORY_OPERATIONS.keyPrefix,
      RateLimits.MEMORY_OPERATIONS.maxRequests,
      RateLimits.MEMORY_OPERATIONS.windowMs
    );

    // Get or create user's memory space
    let user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // If user doesn't have a memory space, create one
    let memorySpaceId: string | undefined = user.memorySpaceId;
    if (!memorySpaceId) {
      const spaceId = `user-${userId}-personal`;
      await ctx.db.insert("memorySpaces", {
        memorySpaceId: spaceId,
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
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user with memory space (use user._id, not the string memorySpaceId)
      await ctx.db.patch(user._id, {
        memorySpaceId: spaceId,
      });

      memorySpaceId = spaceId;
    }

    // Create conversation
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await ctx.db.insert("conversations", {
      conversationId,
      memorySpaceId,
      type: "user-agent",
      participants: {
        userId,
        agentId: "haus-voice-agent",
      },
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          role: "user",
          content: userQuery,
          timestamp: Date.now(),
        },
        {
          id: `msg-${Date.now()}-2`,
          role: "agent",
          content: agentResponse,
          timestamp: Date.now() + 1,
        },
      ],
      messageCount: 2,
      metadata: propertyContext,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Store memory (for semantic search)
    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await ctx.db.insert("memories", {
      memoryId,
      memorySpaceId,
      content: `User: ${userQuery}\nAgent: ${agentResponse}`,
      contentType: "raw",
      sourceType: "conversation",
      sourceUserId: userId,
      sourceUserName: userId,
      sourceTimestamp: Date.now(),
      messageRole: "user",
      userId,
      agentId: "haus-voice-agent",
      conversationRef: {
        conversationId,
        messageIds: [`msg-${Date.now()}-1`],
      },
      importance: 50, // Default importance
      tags: ["voice-search", propertyId ? "property" : "general"].filter(Boolean),
      version: 1,
      previousVersions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessCount: 0,
    });

    // If property context provided, track property interaction
    if (propertyId && propertyContext) {
      await ctx.db.insert("immutable", {
        type: "property-interaction",
        id: `prop-int-${userId}-${propertyId}-${Date.now()}`,
        data: {
          userId,
          propertyId,
          propertyContext,
          interactionType: "voice_query",
          queryText: userQuery,
          timestamp: Date.now(),
        },
        userId,
        tenantId: undefined,
        version: 1,
        previousVersions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      conversationId,
      memoryId,
      memorySpaceId,
    };
  },
});

/**
 * Recall relevant memories for a voice query
 *
 * Returns past conversations, facts, and graph entities related to the query
 *
 * @param userId - User ID from auth
 * @param query - The search query (e.g., "show me houses in Bondi under $2m")
 */
export const recallForQuery = query({
  args: {
    userId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, query, limit = 20 } = args;

    // Get user's memory space
    const user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user || !user.memorySpaceId) {
      return {
        memories: [],
        facts: [],
        graphEntities: [],
      };
    }

    const memorySpaceId = user.memorySpaceId;

    // Get recent memories from this memory space
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_memorySpace_created", memorySpaceId)
      .take(limit)
      .collect();

    // Get facts from this memory space
    const facts = await ctx.db
      .query("facts")
      .withIndex("by_memorySpace", memorySpaceId)
      .take(limit)
      .collect();

    // Get property interactions
    const propertyInteractions = await ctx.db
      .query("immutable")
      .withIndex("by_type_id", ["property-interaction", userId])
      .take(limit)
      .collect();

    // Get suburb preferences
    const suburbPrefs = await ctx.db
      .query("suburbPreferences")
      .withIndex("by_userId", userId)
      .collect();

    return {
      memories: memories.map((m) => ({
        content: m.content,
        relevance: m.importance,
        timestamp: m.createdAt,
      })),
      facts: facts.map((f) => ({
        fact: f.fact,
        confidence: f.confidence,
        category: f.factType,
        subject: f.subject,
        object: f.object,
      })),
      propertyInteractions: propertyInteractions.map((p) => {
        const data = p.data as {
          propertyId: string;
          propertyContext: Record<string, unknown>;
          interactionType: string;
          queryText?: string;
          timestamp: number;
        };
        return data;
      }),
      suburbPreferences: suburbPrefs
        .filter((p) => p.preferenceScore > 30) // Only positive preferences
        .sort((a, b) => b.preferenceScore - a.preferenceScore)
        .slice(0, 10)
        .map((p) => ({
          suburbName: p.suburbName,
          state: p.state,
          preferenceScore: p.preferenceScore,
          reasons: p.reasons,
        })),
    };
  },
});

/**
 * Get or create user's memory space
 *
 * @param userId - User ID from auth
 * @returns memorySpaceId - The user's memory space ID
 * Rate limit: 200 requests/minute per user (memory operations)
 */
export const ensureMemorySpace = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Apply rate limiting
    const identifier = userId !== ANONYMOUS_USER ? `user:${userId}` : `anon:${ctx.runId}`;
    await assertRateLimit(
      ctx,
      identifier,
      RateLimits.MEMORY_OPERATIONS.keyPrefix,
      RateLimits.MEMORY_OPERATIONS.maxRequests,
      RateLimits.MEMORY_OPERATIONS.windowMs
    );

    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a memory space, return it
    if (user.memorySpaceId) {
      return { memorySpaceId: user.memorySpaceId };
    }

    // Create new memory space
    const memorySpaceId = `user-${userId}-personal`;
    await ctx.db.insert("memorySpaces", {
      memorySpaceId,
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
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user with memory space
    await ctx.db.patch(user._id, {
      memorySpaceId,
    });

    return { memorySpaceId };
  },
});

/**
 * Store a user preference (suburb, price range, property type, etc.)
 *
 * @param userId - User ID from auth
 * @param category - Preference category (suburb, price, propertyType, etc.)
 * @param preference - The preference value
 * @param confidence - Confidence score (0-100)
 * Rate limit: 200 requests/minute per user (memory operations)
 */
export const storePreference = mutation({
  args: {
    userId: v.string(),
    category: v.string(),
    preference: v.string(),
    confidence: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, category, preference, confidence, metadata } = args;

    // Apply rate limiting
    const identifier = userId !== ANONYMOUS_USER ? `user:${userId}` : `anon:${ctx.runId}`;
    await assertRateLimit(
      ctx,
      identifier,
      RateLimits.MEMORY_OPERATIONS.keyPrefix,
      RateLimits.MEMORY_OPERATIONS.maxRequests,
      RateLimits.MEMORY_OPERATIONS.windowMs
    );

    // Get user's memory space
    const user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user || !user.memorySpaceId) {
      throw new Error("User memory space not found");
    }

    // Handle suburb preferences specially (store in suburbPreferences table)
    if (category === "suburb" && metadata) {
      const suburbData = metadata as {
        suburbName: string;
        state: string;
        reason?: string;
        mentionedInQuery?: string;
      };

      // Check if preference already exists
      const existing = await ctx.db
        .query("suburbPreferences")
        .withIndex("by_user_suburb", [userId, suburbData.suburbName, suburbData.state])
        .first();

      if (existing) {
        // Update existing preference
        await ctx.db.patch(existing._id, {
          preferenceScore: confidence > 50 ? confidence : -confidence, // Positive or negative
          interactionCount: existing.interactionCount + 1,
          reasons: [...(existing.reasons || []), suburbData.reason || ""].filter(Boolean),
          mentionedInQueries: [
            ...(existing.mentionedInQueries || []),
            suburbData.mentionedInQuery || "",
          ].filter(Boolean),
          updatedAt: Date.now(),
        });
      } else {
        // Create new preference
        await ctx.db.insert("suburbPreferences", {
          userId,
          memorySpaceId: user.memorySpaceId,
          suburbName: suburbData.suburbName,
          state: suburbData.state,
          preferenceScore: confidence > 50 ? confidence : -confidence,
          interactionCount: 1,
          reasons: suburbData.reason ? [suburbData.reason] : [],
          mentionedInQueries: suburbData.mentionedInQuery ? [suburbData.mentionedInQuery] : [],
          factIds: [],
          firstMentionedAt: Date.now(),
          lastMentionedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // Store as fact in Cortex
    const factId = `pref-${userId}-${category}-${Date.now()}`;
    await ctx.db.insert("facts", {
      factId,
      memorySpaceId: user.memorySpaceId,
      userId,
      fact: `User ${confidence > 50 ? "prefers" : "dislikes"} ${preference}`,
      factType: "preference",
      subject: userId,
      predicate: confidence > 50 ? "prefers" : "dislikes",
      object: preference,
      confidence,
      sourceType: "conversation",
      category,
      metadata: metadata || {},
      tags: ["preference", category],
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      factId,
    };
  },
});

/**
 * Get user's preferences
 *
 * @param userId - User ID from auth
 * @param category - Optional category filter
 */
export const getPreferences = query({
  args: {
    userId: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, category } = args;

    // Get user's memory space
    const user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user || !user.memorySpaceId) {
      return {
        facts: [],
        suburbPreferences: [],
      };
    }

    // Get facts
    let factsQuery = ctx.db
      .query("facts")
      .withIndex("by_memorySpace", user.memorySpaceId);

    const facts = await factsQuery.collect();

    // Get suburb preferences
    const suburbPrefs = await ctx.db
      .query("suburbPreferences")
      .withIndex("by_userId", userId)
      .collect();

    return {
      facts: facts
        .filter((f) => f.factType === "preference" && (!category || f.category === category))
        .map((f) => ({
          factId: f.factId,
          fact: f.fact,
          category: f.category,
          confidence: f.confidence,
          subject: f.subject,
          object: f.object,
        })),
      suburbPreferences: suburbPrefs.map((p) => ({
        suburbName: p.suburbName,
        state: p.state,
        preferenceScore: p.preferenceScore,
        interactionCount: p.interactionCount,
        reasons: p.reasons,
      })),
    };
  },
});

/**
 * Get user's property interaction history
 *
 * @param userId - User ID from auth
 * @param propertyId - Optional property filter
 */
export const getPropertyHistory = query({
  args: {
    userId: v.string(),
    propertyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, propertyId } = args;

    // Get user's memory space
    const user = await ctx.db
      .query("users")
      .withIndex("email", userId === ANONYMOUS_USER ? undefined : userId)
      .first();

    if (!user || !user.memorySpaceId) {
      return { interactions: [] };
    }

    // Get property interactions from immutable store
    const interactions = await ctx.db
      .query("immutable")
      .withIndex("by_type_id", ["property-interaction", userId])
      .collect();

    const filtered = interactions.filter((i) => {
      const data = i.data as { propertyId?: string };
      return !propertyId || data.propertyId === propertyId;
    });

    return {
      interactions: filtered.map((i) => {
        const data = i.data as {
          propertyId: string;
          propertyContext?: Record<string, unknown>;
          interactionType: string;
          queryText?: string;
          timestamp: number;
        };
        return data;
      }),
    };
  },
});
