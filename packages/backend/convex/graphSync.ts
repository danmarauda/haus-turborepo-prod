/**
 * Neo4j Graph Sync Pipeline
 *
 * Synchronizes Convex entities to Neo4j knowledge graph for advanced
 * relationship queries and graph-based recommendations.
 *
 * Synced entities:
 * - Users → (:User {id, email, name})
 * - PropertyListings → (:Property {id, address, suburb, state, price, bedrooms, bathrooms})
 * - SuburbPreferences → (:Suburb {name, state}) + (:User)-[:PREFERS {score}]->(:Suburb)
 * - PropertyMemories → (:User)-[:VIEWED|LIKED|SEARCHED]->(:Property)
 *
 * @module convex/graph-sync
 */

"use node";

import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Import neo4j-driver dynamically (Node.js only)
import neo4j, { type Driver, type Session } from "neo4j-driver";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Environment Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NEO4J_URI = process.env.NEO4J_URI || "";
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || "";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors?: string[];
}

export interface GraphEntity {
  table: string;
  entityId: string;
  entity: Record<string, unknown>;
}

type SyncOperation = "insert" | "update" | "delete";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Neo4j Client (Lazy Initialization)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let driver: Driver | null = null;

function getNeo4jDriver(): Driver | null {
  if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
    return null;
  }

  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
  }

  return driver;
}

async function withSession<T>(callback: (session: Session) => Promise<T>): Promise<T> {
  const d = getNeo4jDriver();
  if (!d) {
    throw new Error("Neo4j not configured. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.");
  }

  const session = d.session();
  try {
    return await callback(session);
  } finally {
    await session.close();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Queue Management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Queue an entity for Neo4j sync
 *
 * Called automatically by triggers when entities change.
 * Also can be called manually to force a re-sync.
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.graphSync.queueForSync, {
 *   table: "users",
 *   entityId: userId,
 *   operation: "insert"
 * });
 * ```
 */
export const queueForSync = action({
  args: {
    table: v.string(),
    entityId: v.string(),
    operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
    entity: v.optional(v.any()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { table, entityId, operation, entity, priority } = args;

    // Check if already queued (avoid duplicates)
    const existing = await ctx.db
      .query("graphSyncQueue")
      .withIndex("by_table_entity", (q) => q.eq("table", table).eq("entityId", entityId))
      .filter((q) => q.eq(q.field("synced"), false))
      .first();

    if (existing) {
      // Update the existing queue item
      await ctx.db.patch(existing._id, {
        operation,
        entity: entity ?? existing.entity,
        priority: priority ?? existing.priority,
      });
      return { success: true, id: existing._id, action: "updated" };
    }

    // Create new queue item
    const id = await ctx.db.insert("graphSyncQueue", {
      table,
      entityId,
      operation,
      entity,
      synced: false,
      failedAttempts: 0,
      priority: priority ?? "normal",
      createdAt: Date.now(),
    });

    return { success: true, id, action: "queued" };
  },
});

/**
 * Internal mutation to find existing queue item
 */
const findExistingQueueItem = internalAction({
  args: {
    table: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("graphSyncQueue")
      .withIndex("by_table_entity", (q) =>
        q.eq("table", args.table).eq("entityId", args.entityId),
      )
      .filter((q) => q.eq(q.field("synced"), false))
      .first();
  },
});

/**
 * Internal mutation to update queue item
 */
const updateQueueItem = internalAction({
  args: {
    id: v.id("graphSyncQueue"),
    operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
    entity: v.optional(v.any()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      operation: args.operation,
      entity: args.entity,
      priority: args.priority,
    });
  },
});

/**
 * Internal mutation to insert queue item
 */
const insertQueueItem = internalAction({
  args: {
    table: v.string(),
    entityId: v.string(),
    operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
    entity: v.optional(v.any()),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("graphSyncQueue", {
      table: args.table,
      entityId: args.entityId,
      operation: args.operation,
      entity: args.entity,
      synced: false,
      failedAttempts: 0,
      priority: args.priority,
      createdAt: Date.now(),
    });
  },
});

/**
 * Batch queue multiple entities for sync
 *
 * Useful for initial data migration or bulk updates.
 */
export const batchQueueForSync = action({
  args: {
    items: v.array(
      v.object({
        table: v.string(),
        entityId: v.string(),
        operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
        entity: v.optional(v.any()),
        priority: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = { queued: 0, updated: 0, failed: 0 };

    for (const item of args.items) {
      try {
        const existing = await ctx.runAction(internal.graphSync.findExistingQueueItem, {
          table: item.table,
          entityId: item.entityId,
        });

        if (existing) {
          await ctx.runAction(internal.graphSync.updateQueueItem, {
            id: existing._id,
            operation: item.operation,
            entity: item.entity ?? existing.entity,
            priority: item.priority ?? existing.priority,
          });
          results.updated++;
        } else {
          await ctx.runAction(internal.graphSync.insertQueueItem, {
            table: item.table,
            entityId: item.entityId,
            operation: item.operation,
            entity: item.entity,
            priority: item.priority ?? "normal",
          });
          results.queued++;
        }
      } catch (error) {
        console.error("[GraphSync] Failed to queue item:", item, error);
        results.failed++;
      }
    }

    return { success: true, ...results };
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sync Processing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Process pending sync queue items
 *
 * This action processes a batch of pending sync items.
 * It can be triggered by:
 * - Scheduled function (cron)
 - HTTP webhook
 * - Manual trigger
 *
 * @example
 * ```typescript
 * // Process up to 100 items
 * await ctx.runAction(api.graphSync.processSyncQueue, { batchSize: 100 });
 * ```
 */
export const processSyncQueue = action({
  args: {
    batchSize: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 50;
    const maxRetries = args.maxRetries ?? 3;

    // Get pending items (prioritize high priority)
    const pendingItems = await ctx.runAction(internal.graphSync.getPendingItems, {
      limit: batchSize,
      maxRetries,
    });

    if (pendingItems.length === 0) {
      return { success: true, processed: 0, message: "No pending items" };
    }

    const results: { id: Id<"graphSyncQueue">; success: boolean; error?: string }[] = [];

    // Process each item
    for (const item of pendingItems) {
      try {
        // Sync to Neo4j
        await ctx.runAction(internal.graphSync.syncToNeo4j, {
          table: item.table,
          entityId: item.entityId,
          operation: item.operation,
          entity: item.entity,
        });

        // Mark as synced
        await ctx.runAction(internal.graphSync.markAsSynced, {
          id: item._id,
        });

        results.push({ id: item._id, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Mark as failed
        await ctx.runAction(internal.graphSync.markAsFailed, {
          id: item._id,
          error: errorMessage,
        });

        results.push({ id: item._id, success: false, error: errorMessage });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return {
      success: failCount === 0,
      processed: results.length,
      succeeded: successCount,
      failed: failCount,
      results,
    };
  },
});

/**
 * Internal mutation to get pending items
 */
export const getPendingItems = internalAction({
  args: {
    limit: v.number(),
    maxRetries: v.number(),
  },
  handler: async (ctx, args) => {
    // Get high priority items first, then normal
    const highPriority = await ctx.db
      .query("graphSyncQueue")
      .withIndex("by_priority", (q) => q.eq("priority", "high").eq("synced", false))
      .filter((q) => q.lt(q.field("failedAttempts") ?? 0, args.maxRetries))
      .take(args.limit);

    if (highPriority.length >= args.limit) {
      return highPriority;
    }

    // Fill remaining with normal priority
    const remaining = args.limit - highPriority.length;
    const normalPriority = await ctx.db
      .query("graphSyncQueue")
      .withIndex("by_priority", (q) => q.eq("priority", "normal").eq("synced", false))
      .filter((q) => q.lt(q.field("failedAttempts") ?? 0, args.maxRetries))
      .take(remaining);

    return [...highPriority, ...normalPriority];
  },
});

/**
 * Mark queue item as synced
 */
export const markAsSynced = internalAction({
  args: {
    id: v.id("graphSyncQueue"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      synced: true,
      syncedAt: Date.now(),
    });
  },
});

/**
 * Mark queue item as failed
 */
export const markAsFailed = internalAction({
  args: {
    id: v.id("graphSyncQueue"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;

    const failedAttempts = (item.failedAttempts ?? 0) + 1;

    await ctx.db.patch(args.id, {
      failedAttempts,
      lastError: args.error,
      // If max retries exceeded, mark as synced to remove from queue
      synced: failedAttempts >= 3,
    });
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Neo4j Sync Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Internal action to sync entity to Neo4j
 *
 * This handles the actual Neo4j write operations.
 */
export const syncToNeo4j = internalAction({
  args: {
    table: v.string(),
    entityId: v.string(),
    operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
    entity: v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const { table, entityId, operation, entity } = args;

    // Skip if Neo4j is not configured
    if (!getNeo4jDriver()) {
      console.warn("[GraphSync] Neo4j not configured, skipping sync");
      return { success: false, skipped: true, reason: "Neo4j not configured" };
    }

    try {
      switch (table) {
        case "users":
          await syncUser(entityId, entity, operation);
          break;
        case "propertyListings":
          await syncProperty(entityId, entity, operation);
          break;
        case "suburbPreferences":
          await syncSuburbPreference(entityId, entity, operation);
          break;
        case "propertyMemories":
          await syncPropertyMemory(entityId, entity, operation);
          break;
        default:
          console.warn(`[GraphSync] Unknown table: ${table}`);
          return { success: false, error: `Unknown table: ${table}` };
      }

      return { success: true, table, entityId, operation };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[GraphSync] Failed to sync ${table}/${entityId}:`, errorMessage);
      throw error;
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Entity Sync Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function syncUser(
  userId: string,
  entity: Record<string, unknown> | undefined,
  operation: SyncOperation,
): Promise<void> {
  if (operation === "delete") {
    await withSession(async (session) => {
      await session.run(
        `
        MATCH (u:User {id: $userId})
        DETACH DELETE u
      `,
        { userId },
      );
    });
    return;
  }

  if (!entity) {
    throw new Error("Entity required for insert/update");
  }

  const user = entity as {
    email?: string;
    name?: string;
    username?: string;
  };

  await withSession(async (session) => {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      SET u.email = $email,
          u.name = $name,
          u.updatedAt = datetime()
      RETURN u
    `,
      {
        userId,
        email: user.email ?? null,
        name: user.name ?? user.username ?? null,
      },
    );
  });
}

async function syncProperty(
  listingId: string,
  entity: Record<string, unknown> | undefined,
  operation: SyncOperation,
): Promise<void> {
  if (operation === "delete") {
    await withSession(async (session) => {
      await session.run(
        `
        MATCH (p:Property {id: $listingId})
        DETACH DELETE p
      `,
        { listingId },
      );
    });
    return;
  }

  if (!entity) {
    throw new Error("Entity required for insert/update");
  }

  const property = entity as {
    address?: string;
    suburb?: string;
    state?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    status?: string;
  };

  await withSession(async (session) => {
    // Create/update Property node
    await session.run(
      `
      MERGE (p:Property {id: $listingId})
      SET p.address = $address,
          p.suburb = $suburb,
          p.state = $state,
          p.price = $price,
          p.bedrooms = $bedrooms,
          p.bathrooms = $bathrooms,
          p.propertyType = $propertyType,
          p.status = $status,
          p.updatedAt = datetime()
      RETURN p
    `,
      {
        listingId,
        address: property.address ?? null,
        suburb: property.suburb ?? null,
        state: property.state ?? null,
        price: property.price ?? null,
        bedrooms: property.bedrooms ?? null,
        bathrooms: property.bathrooms ?? null,
        propertyType: property.propertyType ?? null,
        status: property.status ?? null,
      },
    );

    // Create Suburb node and link Property to Suburb
    if (property.suburb && property.state) {
      await session.run(
        `
        MERGE (s:Suburb {name: $suburb, state: $state})
        WITH s
        MATCH (p:Property {id: $listingId})
        MERGE (p)-[:LOCATED_IN]->(s)
      `,
        {
          listingId,
          suburb: property.suburb,
          state: property.state,
        },
      );
    }
  });
}

async function syncSuburbPreference(
  docId: string,
  entity: Record<string, unknown> | undefined,
  operation: SyncOperation,
): Promise<void> {
  if (operation === "delete") {
    await withSession(async (session) => {
      await session.run(
        `
        MATCH (u:User)-[r:PREFERS]->(s:Suburb)
        WHERE r.docId = $docId
        DELETE r
      `,
        { docId },
      );
    });
    return;
  }

  if (!entity) {
    throw new Error("Entity required for insert/update");
  }

  const pref = entity as {
    userId?: string;
    suburbName?: string;
    state?: string;
    preferenceScore?: number;
  };

  if (!pref.userId || !pref.suburbName || !pref.state) {
    throw new Error("Missing required fields for suburb preference");
  }

  await withSession(async (session) => {
    // Create User and Suburb nodes if they don't exist, then create preference relationship
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (s:Suburb {name: $suburbName, state: $state})
      MERGE (u)-[r:PREFERS]->(s)
      SET r.score = $score,
          r.docId = $docId,
          r.updatedAt = datetime()
      RETURN u, r, s
    `,
      {
        userId: pref.userId,
        suburbName: pref.suburbName,
        state: pref.state,
        score: pref.preferenceScore ?? 0,
        docId,
      },
    );
  });
}

async function syncPropertyMemory(
  docId: string,
  entity: Record<string, unknown> | undefined,
  operation: SyncOperation,
): Promise<void> {
  if (operation === "delete") {
    await withSession(async (session) => {
      await session.run(
        `
        MATCH (u:User)-[r:VIEWED|LIKED|SEARCHED]->(p:Property)
        WHERE r.docId = $docId
        DELETE r
      `,
        { docId },
      );
    });
    return;
  }

  if (!entity) {
    throw new Error("Entity required for insert/update");
  }

  const memory = entity as {
    userId?: string;
    propertyId?: string;
    interactionType?: "viewed" | "saved" | "searched" | "voice_query" | string;
    propertySuburb?: string;
    propertyState?: string;
    firstSeenAt?: number;
    viewCount?: number;
  };

  if (!memory.userId || !memory.propertyId) {
    throw new Error("Missing required fields for property memory");
  }

  // Map interaction type to relationship type
  const relType = mapInteractionType(memory.interactionType ?? "viewed");

  await withSession(async (session) => {
    // Create User and Property nodes if they don't exist, then create relationship
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (p:Property {id: $propertyId})
      SET p.suburb = COALESCE(p.suburb, $suburb),
          p.state = COALESCE(p.state, $state)
      MERGE (u)-[r:${relType}]->(p)
      SET r.docId = $docId,
          r.firstSeen = datetime({epochMillis: $firstSeenAt}),
          r.viewCount = $viewCount,
          r.updatedAt = datetime()
      RETURN u, r, p
    `,
      {
        userId: memory.userId,
        propertyId: memory.propertyId,
        suburb: memory.propertySuburb ?? null,
        state: memory.propertyState ?? null,
        docId,
        firstSeenAt: memory.firstSeenAt ?? Date.now(),
        viewCount: memory.viewCount ?? 1,
      },
    );
  });
}

function mapInteractionType(type: string): string {
  switch (type) {
    case "viewed":
      return "VIEWED";
    case "saved":
    case "liked":
      return "LIKED";
    case "searched":
    case "voice_query":
      return "SEARCHED";
    case "inquired":
      return "INQUIRED";
    default:
      return "INTERACTED";
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Status Queries
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get sync queue status
 *
 * Returns statistics about pending, completed, and failed sync items.
 *
 * @example
 * ```typescript
 * const status = await ctx.runQuery(api.graphSync.getSyncStatus);
 * console.log(status.pending, status.failed);
 * ```
 */
export const getSyncStatus = action({
  args: {},
  handler: async (ctx) => {
    // Get all queue items
    const allItems = await ctx.db.query("graphSyncQueue").collect();

    const pending = allItems.filter((i) => !i.synced);
    const completed = allItems.filter((i) => i.synced && !i.lastError);
    const failed = allItems.filter((i) => i.synced && i.lastError);
    const retryable = allItems.filter((i) => !i.synced && (i.failedAttempts ?? 0) > 0);

    // Count by table
    const byTable: Record<string, { pending: number; completed: number; failed: number }> = {};
    for (const item of allItems) {
      if (!byTable[item.table]) {
        byTable[item.table] = { pending: 0, completed: 0, failed: 0 };
      }
      if (!item.synced) {
        byTable[item.table].pending++;
      } else if (item.lastError) {
        byTable[item.table].failed++;
      } else {
        byTable[item.table].completed++;
      }
    }

    // Get recent failed items
    const recentFailed = failed
      .sort((a, b) => (b.failedAttempts ?? 0) - (a.failedAttempts ?? 0))
      .slice(0, 10)
      .map((i) => ({
        id: i._id,
        table: i.table,
        entityId: i.entityId,
        failedAttempts: i.failedAttempts,
        lastError: i.lastError,
      }));

    return {
      total: allItems.length,
      pending: pending.length,
      completed: completed.length,
      failed: failed.length,
      retryable: retryable.length,
      byTable,
      recentFailed,
      neo4jConfigured: Boolean(NEO4J_URI && NEO4J_USERNAME && NEO4J_PASSWORD),
    };
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Retry Operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Retry failed sync items
 *
 * Resets failed items back to pending state for reprocessing.
 *
 * @example
 * ```typescript
 * // Retry all failed items
 * await ctx.runMutation(api.graphSync.retryFailedSync, {});
 *
 * // Retry specific item
 * await ctx.runMutation(api.graphSync.retryFailedSync, { id: "..." });
 * ```
 */
export const retryFailedSync = action({
  args: {
    id: v.optional(v.id("graphSyncQueue")),
    table: v.optional(v.string()),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let retried = 0;

    if (args.id) {
      // Retry specific item
      const item = await ctx.db.get(args.id);
      if (item && item.synced && item.lastError) {
        await ctx.db.patch(args.id, {
          synced: false,
          failedAttempts: 0,
          lastError: undefined,
        });
        retried = 1;
      }
    } else {
      // Retry all failed items (or by table)
      let failedItems = await ctx.db
        .query("graphSyncQueue")
        .withIndex("by_synced", (q) => q.eq("synced", true))
        .collect();

      // Filter to items with errors
      failedItems = failedItems.filter((i) => i.lastError);

      // Filter by table if specified
      if (args.table) {
        failedItems = failedItems.filter((i) => i.table === args.table);
      }

      // Filter by max retries
      const maxRetries = args.maxRetries ?? 3;
      failedItems = failedItems.filter((i) => (i.failedAttempts ?? 0) < maxRetries);

      for (const item of failedItems) {
        await ctx.db.patch(item._id, {
          synced: false,
          failedAttempts: 0,
          lastError: undefined,
        });
        retried++;
      }
    }

    return { success: true, retried };
  },
});

/**
 * Clear completed sync items
 *
 * Removes successfully synced items older than a specified age.
 * Useful for keeping the queue table size manageable.
 */
export const clearCompletedSync = action({
  args: {
    olderThanMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanMs ?? 7 * 24 * 60 * 60 * 1000); // Default 7 days

    const completedItems = await ctx.db
      .query("graphSyncQueue")
      .withIndex("by_synced", (q) => q.eq("synced", true))
      .filter((q) => q.lt(q.field("syncedAt") ?? 0, cutoff))
      .collect();

    let deleted = 0;
    for (const item of completedItems) {
      await ctx.db.delete(item._id);
      deleted++;
    }

    return { success: true, deleted };
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Manual Sync Operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sync all users to Neo4j
 *
 * Queues all existing users for sync. Useful for initial migration.
 * Note: This processes in batches. Call multiple times for large datasets.
 */
export const syncAllUsers = internalAction({
  args: {
    cursor: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100;

    // Get users
    const users = await ctx.runAction(internal.graphSync.getUsersBatch, {
      cursor: args.cursor,
      limit: batchSize,
    });

    if (users.items.length === 0) {
      return { success: true, queued: 0, total: 0, done: true };
    }

    // Queue for sync
    const items = users.items.map((u) => ({
      table: "users" as const,
      entityId: u.id,
      operation: "insert" as const,
      entity: {
        email: u.email,
        name: u.name,
        username: u.username,
      },
      priority: "normal" as const,
    }));

    const result = await ctx.runAction(internal.graphSync.batchQueueForSync, {
      items,
    });

    return {
      success: true,
      queued: result.queued,
      total: users.items.length,
      nextCursor: users.nextCursor,
      done: !users.nextCursor,
    };
  },
});

/**
 * Internal query to get users batch
 */
export const getUsersBatch = internalAction({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("users");

    // Simple pagination by skipping if cursor provided
    // Note: In production with large datasets, use a more efficient cursor
    const allUsers = await q.collect();
    const startIdx = args.cursor ? parseInt(args.cursor, 10) : 0;
    const users = allUsers.slice(startIdx, startIdx + args.limit);

    const nextCursor = startIdx + users.length < allUsers.length
      ? String(startIdx + users.length)
      : undefined;

    return {
      items: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        username: u.username,
      })),
      nextCursor,
    };
  },
});

/**
 * Sync all properties to Neo4j
 *
 * Queues all existing properties for sync. Useful for initial migration.
 * Note: This processes in batches. Call multiple times for large datasets.
 */
export const syncAllProperties = internalAction({
  args: {
    cursor: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100;

    // Get properties
    const properties = await ctx.runAction(internal.graphSync.getPropertiesBatch, {
      cursor: args.cursor,
      limit: batchSize,
    });

    if (properties.items.length === 0) {
      return { success: true, queued: 0, total: 0, done: true };
    }

    // Queue for sync
    const items = properties.items.map((p) => ({
      table: "propertyListings" as const,
      entityId: p.id,
      operation: "insert" as const,
      entity: {
        address: p.address,
        suburb: p.suburb,
        state: p.state,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        propertyType: p.propertyType,
        status: p.status,
      },
      priority: "normal" as const,
    }));

    const result = await ctx.runAction(internal.graphSync.batchQueueForSync, {
      items,
    });

    return {
      success: true,
      queued: result.queued,
      total: properties.items.length,
      nextCursor: properties.nextCursor,
      done: !properties.nextCursor,
    };
  },
});

/**
 * Internal query to get properties batch
 */
export const getPropertiesBatch = internalAction({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("propertyListings");

    // Simple pagination
    const allProperties = await q.collect();
    const startIdx = args.cursor ? parseInt(args.cursor, 10) : 0;
    const properties = allProperties.slice(startIdx, startIdx + args.limit);

    const nextCursor = startIdx + properties.length < allProperties.length
      ? String(startIdx + properties.length)
      : undefined;

    return {
      items: properties.map((p) => ({
        id: p._id.toString(),
        address: p.address,
        suburb: p.suburb,
        state: p.state,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        propertyType: p.propertyType,
        status: p.status,
      })),
      nextCursor,
    };
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cleanup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Close Neo4j driver connection
 *
 * Call this during application shutdown to properly close connections.
 */
export async function closeNeo4jConnection(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
