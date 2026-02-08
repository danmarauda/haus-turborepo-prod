/**
 * HAUS + Cortex Hybrid Schema
 *
 * Combines HAUS authentication with Cortex memory system
 * - Keep HAUS users table for auth (via @convex-dev/auth)
 * - Add complete Cortex memory layer for AI agent features
 *
 * Architecture:
 * - HAUS users table (auth) → links to Cortex via userId
 * - Cortex memory spaces (per-user isolation)
 * - Cortex conversations, memories, facts (voice search memory)
 * - Cortex knowledge graph (Neo4j sync for property relationships)
 */

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HAUS Authentication (via @convex-dev/auth)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ...authTables,

  // HAUS users table extends auth with custom fields
  users: defineTable({
    // Convex Auth fields (inherited from authTables)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // HAUS-specific fields
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),

    // Link to Cortex memory space (auto-created on first voice interaction)
    memorySpaceId: v.optional(v.string()), // Points to Cortex memorySpaces.memorySpaceId

    // HAUS user preferences
    preferences: v.optional(v.object({
      // Voice search preferences
      voiceEnabled: v.optional(v.boolean()),
      voiceLanguage: v.optional(v.string()), // e.g., "en-AU"
      voiceSpeed: v.optional(v.number()), // 0.5 - 2.0

      // Property search preferences
      searchRadius: v.optional(v.number()), // km
      priceMin: v.optional(v.number()),
      priceMax: v.optional(v.number()),
      propertyTypes: v.optional(v.array(v.string())), // ["house", "apartment"]
      suburbs: v.optional(v.array(v.string())),

      // Notification preferences
      emailAlerts: v.optional(v.boolean()),
      pushAlerts: v.optional(v.boolean()),
    })),

    // RevenueCat subscription sync (for mobile app premium features)
    revenueCatId: v.optional(v.string()), // RevenueCat originalAppUserId
    isPremium: v.optional(v.boolean()), // Premium subscription status
    premiumExpiresAt: v.optional(v.number()), // Subscription expiration timestamp
    premiumEntitlements: v.optional(v.record(v.string(), v.any())), // Active entitlements
    premiumSubscriptions: v.optional(v.record(v.string(), v.any())), // Subscription details
    premiumUpdatedAt: v.optional(v.number()), // Last sync timestamp

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stripe Payment Integration
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    stripeCustomerId: v.optional(v.string()), // Stripe customer ID
    stripeSubscriptionId: v.optional(v.string()), // Active Stripe subscription ID
    subscriptionTier: v.optional(v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("agency")
    )), // Current subscription tier
    subscriptionStatus: v.optional(v.string()), // Stripe subscription status (active, trialing, past_due, etc.)
    subscriptionPeriodEnd: v.optional(v.number()), // Current period end timestamp
    subscriptionCancelAtPeriodEnd: v.optional(v.boolean()), // True if subscription will cancel at period end

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Unified Subscription Tracking
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    subscriptionSource: v.optional(v.union(
      v.literal("stripe"),
      v.literal("revenuecat"),
      v.literal("polar"),
      v.literal("none")
    )), // Source of current subscription (for unified tracking)
    subscriptionSyncedAt: v.optional(v.number()), // Last unified sync timestamp
  })
    .index("email", ["email"])
    .index("memorySpaceId", ["memorySpaceId"])
    .index("revenueCatId", ["revenueCatId"])
    .index("isPremium", ["isPremium"])
    .index("stripeCustomerId", ["stripeCustomerId"])
    .index("subscriptionTier", ["subscriptionTier"])
    .index("subscriptionSource", ["subscriptionSource"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CORTEX MEMORY LAYER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Layer 1a: Conversations (ACID, Immutable)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  conversations: defineTable({
    // Identity
    conversationId: v.string(),

    // Memory Space (fundamental isolation boundary)
    memorySpaceId: v.string(),
    participantId: v.optional(v.string()),

    // Multi-tenancy
    tenantId: v.optional(v.string()),

    // Type: user-agent (user ↔ voice agent) or agent-agent
    type: v.union(v.literal("user-agent"), v.literal("agent-agent")),

    // Participants
    participants: v.object({
      userId: v.optional(v.string()), // The primary human user
      agentId: v.optional(v.string()), // The voice agent
      userIds: v.optional(v.array(v.string())),
      memorySpaceIds: v.optional(v.array(v.string())),
    }),

    // Collaborative settings
    collaborativeSettings: v.optional(
      v.object({
        requireApproval: v.boolean(),
        ownerUserId: v.optional(v.string()),
        approvedParticipants: v.optional(v.array(v.string())),
      }),
    ),

    // Messages (append-only, immutable)
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(
          v.literal("user"),
          v.literal("agent"),
          v.literal("system"),
        ),
        content: v.string(),
        timestamp: v.number(),
        participantId: v.optional(v.string()),
        metadata: v.optional(v.any()),
        attachmentIds: v.optional(v.array(v.string())),
        approvalStatus: v.optional(
          v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected"),
          ),
        ),
        approvedBy: v.optional(v.string()),
        approvedAt: v.optional(v.number()),
      }),
    ),

    messageCount: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),

    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("space"),
        v.literal("public"),
      ),
    ),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_tenant_space", ["tenantId", "memorySpaceId"])
    .index("by_type", ["type"])
    .index("by_user", ["participants.userId"])
    .index("by_agent", ["participants.agentId"])
    .index("by_memorySpace_user", ["memorySpaceId", "participants.userId"])
    .index("by_memorySpace_agent", ["memorySpaceId", "participants.agentId"])
    .index("by_created", ["createdAt"])
    .index("by_visibility", ["visibility"])
    .index("by_memorySpace_visibility", ["memorySpaceId", "visibility"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Layer 1b: Immutable Store (Versioned, Shared)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  immutable: defineTable({
    type: v.string(), // Entity type: 'kb-article', 'policy', 'audit-log', etc.
    id: v.string(), // Type-specific logical ID
    data: v.any(),
    userId: v.optional(v.string()), // GDPR support
    tenantId: v.optional(v.string()),
    version: v.number(),
    previousVersions: v.array(
      v.object({
        version: v.number(),
        data: v.any(),
        timestamp: v.number(),
        metadata: v.optional(v.any()),
      }),
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type_id", ["type", "id"])
    .index("by_type", ["type"])
    .index("by_tenantId", ["tenantId"])
    .index("by_userId", ["userId"])
    .index("by_created", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Layer 1c: Mutable Store (No Versioning, Shared)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  mutable: defineTable({
    namespace: v.string(),
    key: v.string(),
    value: v.any(),
    userId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_namespace_key", ["namespace", "key"])
    .index("by_namespace", ["namespace"])
    .index("by_tenantId", ["tenantId"])
    .index("by_userId", ["userId"])
    .index("by_updated", ["updatedAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Layer 2: Vector Memory (Searchable, Versioned)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  memories: defineTable({
    memoryId: v.string(),
    memorySpaceId: v.string(),
    participantId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    content: v.string(),
    contentType: v.union(
      v.literal("raw"),
      v.literal("summarized"),
      v.literal("fact"),
    ),
    embedding: v.optional(v.array(v.float64())),
    sourceType: v.union(
      v.literal("conversation"),
      v.literal("system"),
      v.literal("tool"),
      v.literal("a2a"),
      v.literal("fact-extraction"),
    ),
    sourceUserId: v.optional(v.string()),
    sourceUserName: v.optional(v.string()),
    sourceTimestamp: v.number(),
    messageRole: v.optional(
      v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
    ),
    userId: v.optional(v.string()),
    agentId: v.optional(v.string()),
    conversationRef: v.optional(
      v.object({
        conversationId: v.string(),
        messageIds: v.array(v.string()),
      }),
    ),
    immutableRef: v.optional(
      v.object({
        type: v.string(),
        id: v.string(),
        version: v.optional(v.number()),
      }),
    ),
    mutableRef: v.optional(
      v.object({
        namespace: v.string(),
        key: v.string(),
        snapshotValue: v.any(),
        snapshotAt: v.number(),
      }),
    ),
    factsRef: v.optional(
      v.object({
        factId: v.string(),
        version: v.optional(v.number()),
      }),
    ),
    importance: v.number(),
    tags: v.array(v.string()),
    enrichedContent: v.optional(v.string()),
    factCategory: v.optional(v.string()),
    metadata: v.optional(v.any()),
    version: v.number(),
    previousVersions: v.array(
      v.object({
        version: v.number(),
        content: v.string(),
        embedding: v.optional(v.array(v.float64())),
        timestamp: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastAccessed: v.optional(v.number()),
    accessCount: v.number(),
    isPartial: v.optional(v.boolean()),
    partialMetadata: v.optional(v.any()),
  })
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_memoryId", ["memoryId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_tenant_space", ["tenantId", "memorySpaceId"])
    .index("by_userId", ["userId"])
    .index("by_agentId", ["agentId"])
    .index("by_memorySpace_created", ["memorySpaceId", "createdAt"])
    .index("by_memorySpace_userId", ["memorySpaceId", "userId"])
    .index("by_participantId", ["participantId"])
    .searchIndex("by_content", {
      searchField: "content",
      filterFields: [
        "memorySpaceId",
        "tenantId",
        "sourceType",
        "userId",
        "agentId",
      ],
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: [
        "memorySpaceId",
        "tenantId",
        "userId",
        "agentId",
      ],
    }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Layer 3: Facts Store (LLM-extracted, Versioned)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  facts: defineTable({
    factId: v.string(),
    memorySpaceId: v.string(),
    participantId: v.optional(v.string()),
    userId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    fact: v.string(),
    factType: v.union(
      v.literal("preference"),
      v.literal("identity"),
      v.literal("knowledge"),
      v.literal("relationship"),
      v.literal("event"),
      v.literal("observation"),
      v.literal("custom"),
    ),
    subject: v.optional(v.string()),
    predicate: v.optional(v.string()),
    object: v.optional(v.string()),
    confidence: v.number(),
    sourceType: v.union(
      v.literal("conversation"),
      v.literal("system"),
      v.literal("tool"),
      v.literal("manual"),
      v.literal("a2a"),
      v.literal("fact-extraction"),
    ),
    sourceRef: v.optional(
      v.object({
        conversationId: v.optional(v.string()),
        messageIds: v.optional(v.array(v.string())),
        memoryId: v.optional(v.string()),
      }),
    ),
    metadata: v.optional(v.any()),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    searchAliases: v.optional(v.array(v.string())),
    semanticContext: v.optional(v.string()),
    entities: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          fullValue: v.optional(v.string()),
        }),
      ),
    ),
    relations: v.optional(
      v.array(
        v.object({
          subject: v.string(),
          predicate: v.string(),
          object: v.string(),
        }),
      ),
    ),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    version: v.number(),
    supersededBy: v.optional(v.string()),
    supersedes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_factId", ["factId"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_tenant_space", ["tenantId", "memorySpaceId"])
    .index("by_memorySpace_subject", ["memorySpaceId", "subject"])
    .index("by_participantId", ["participantId"])
    .index("by_userId", ["userId"])
    .searchIndex("by_content", {
      searchField: "fact",
      filterFields: ["memorySpaceId", "tenantId", "factType"],
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["memorySpaceId", "tenantId"],
    }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Fact History (Belief Revision Audit Trail)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  factHistory: defineTable({
    eventId: v.string(),
    factId: v.string(),
    memorySpaceId: v.string(),
    action: v.union(
      v.literal("CREATE"),
      v.literal("UPDATE"),
      v.literal("SUPERSEDE"),
      v.literal("DELETE"),
    ),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    supersededBy: v.optional(v.string()),
    supersedes: v.optional(v.string()),
    reason: v.optional(v.string()),
    confidence: v.optional(v.number()),
    pipeline: v.optional(
      v.object({
        slotMatching: v.optional(v.boolean()),
        semanticMatching: v.optional(v.boolean()),
        llmResolution: v.optional(v.boolean()),
      }),
    ),
    userId: v.optional(v.string()),
    participantId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_factId", ["factId"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_memorySpace_timestamp", ["memorySpaceId", "timestamp"])
    .index("by_action", ["action"])
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Memory Spaces Registry (Hive/Collaboration Mode)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  memorySpaces: defineTable({
    memorySpaceId: v.string(),
    name: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    type: v.union(
      v.literal("personal"),
      v.literal("team"),
      v.literal("project"),
      v.literal("custom"),
    ),
    participants: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        joinedAt: v.number(),
      }),
    ),
    metadata: v.any(),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_memorySpaceId", ["memorySpaceId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_tenant_memorySpaceId", ["tenantId", "memorySpaceId"])
    .index("by_tenant_status", ["tenantId", "status"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Contexts (Hierarchical Coordination)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contexts: defineTable({
    contextId: v.string(),
    memorySpaceId: v.string(),
    tenantId: v.optional(v.string()),
    purpose: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()),
    rootId: v.optional(v.string()),
    depth: v.number(),
    childIds: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("blocked"),
    ),
    conversationRef: v.optional(
      v.object({
        conversationId: v.string(),
        messageIds: v.optional(v.array(v.string())),
      }),
    ),
    userId: v.optional(v.string()),
    participants: v.array(v.string()),
    grantedAccess: v.optional(
      v.array(
        v.object({
          memorySpaceId: v.string(),
          scope: v.string(),
          grantedAt: v.number(),
        }),
      ),
    ),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
    version: v.number(),
    previousVersions: v.array(
      v.object({
        version: v.number(),
        status: v.string(),
        data: v.optional(v.any()),
        timestamp: v.number(),
        updatedBy: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_contextId", ["contextId"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_parentId", ["parentId"])
    .index("by_rootId", ["rootId"])
    .index("by_status", ["status"])
    .index("by_userId", ["userId"])
    .index("by_created", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HAUS-specific: Property Memory (Voice Search Context)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  propertyMemories: defineTable({
    // Identity
    propertyMemoryId: v.string(),
    userId: v.string(), // User who searched/viewed this property
    memorySpaceId: v.string(), // Link to Cortex memory space

    // Property reference
    propertyId: v.string(), // External property ID (Domain.com.au, etc.)
    propertyUrl: v.optional(v.string()), // Original listing URL

    // Interaction data
    interactionType: v.union(
      v.literal("searched"),
      v.literal("viewed"),
      v.literal("saved"),
      v.literal("inquired"),
      v.literal("voice_query"),
    ),
    queryText: v.optional(v.string()), // What user said/asked
    queryIntent: v.optional(v.string()), // Parsed intent (e.g., "price_inquiry")

    // Property details (cached for context)
    propertyName: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    propertyPrice: v.optional(v.number()),
    propertyType: v.optional(v.string()), // house, apartment, etc.
    propertySuburb: v.optional(v.string()),
    propertyState: v.optional(v.string()), // NSW, VIC, etc.

    // User sentiment
    sentiment: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative"),
    )),
    notes: v.optional(v.string()), // User notes about this property

    // Timestamps
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
    viewCount: v.number(),

    // Link to Cortex
    conversationId: v.optional(v.string()),
    memoryId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_user_property", ["userId", "propertyId"])
    .index("by_user_suburb", ["userId", "propertySuburb"])
    .index("by_interactionType", ["interactionType"])
    .index("by_lastSeen", ["lastSeenAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HAUS-specific: Suburb Preferences (Learned from Voice)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  suburbPreferences: defineTable({
    userId: v.string(),
    memorySpaceId: v.string(),
    suburbName: v.string(),
    state: v.string(),

    // Learned preferences (from voice interactions)
    preferenceScore: v.number(), // -100 (avoid) to +100 (love)
    interactionCount: v.number(), // How many times mentioned

    // Context
    reasons: v.array(v.string()), // Why user likes/dislikes
    mentionedInQueries: v.array(v.string()), // Sample queries

    // Derived from facts
    factIds: v.array(v.string()), // Links to Cortex facts

    // Timestamps
    firstMentionedAt: v.number(),
    lastMentionedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_suburb", ["suburbName", "state"])
    .index("by_user_suburb", ["userId", "suburbName", "state"])
    .index("by_score", ["preferenceScore"])
    .index("by_lastMentioned", ["lastMentionedAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Agents Registry (Optional Metadata Layer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  agents: defineTable({
    agentId: v.string(),
    tenantId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    config: v.optional(v.any()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived"),
    ),
    registeredAt: v.number(),
    updatedAt: v.number(),
    lastActive: v.optional(v.number()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_status", ["status"])
    .index("by_registered", ["registeredAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Sessions (Native Session Management)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  sessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    tenantId: v.optional(v.string()),
    memorySpaceId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("idle"), v.literal("ended")),
    startedAt: v.number(),
    lastActiveAt: v.number(),
    endedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    messageCount: v.number(),
    memoryCount: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_tenantId", ["tenantId"])
    .index("by_status", ["status"])
    .index("by_memorySpace", ["memorySpaceId"])
    .index("by_lastActive", ["lastActiveAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Graph Sync Queue (Real-time Neo4j Synchronization)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  graphSyncQueue: defineTable({
    table: v.string(),
    entityId: v.string(),
    operation: v.union(
      v.literal("insert"),
      v.literal("update"),
      v.literal("delete"),
    ),
    entity: v.optional(v.any()),
    synced: v.boolean(),
    syncedAt: v.optional(v.number()),
    failedAttempts: v.optional(v.number()),
    lastError: v.optional(v.string()),
    priority: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_synced", ["synced"])
    .index("by_table", ["table"])
    .index("by_table_entity", ["table", "entityId"])
    .index("by_priority", ["priority", "synced"])
    .index("by_created", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Property Listings (from tRPC/Hono backend)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  propertyListings: defineTable({
    // Identity
    listingId: v.string(), // External listing ID (e.g., from Domain.com.au)
    externalId: v.optional(v.string()), // Original ID from source platform
    source: v.optional(v.string()), // "domain", "realestate.com.au", "manual"

    // Basic property info
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),

    // Property details
    propertyType: v.union(
      v.literal("house"),
      v.literal("apartment"),
      v.literal("townhouse"),
      v.literal("unit"),
      v.literal("land"),
      v.literal("studio"),
      v.literal("commercial"),
      v.literal("rural"),
    ),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    carSpaces: v.optional(v.number()),
    landSize: v.optional(v.number()), // in sqm
    buildingSize: v.optional(v.number()), // in sqm

    // Pricing
    price: v.optional(v.number()),
    priceText: v.optional(v.string()), // Display text like "Contact Agent"
    priceRangeMin: v.optional(v.number()),
    priceRangeMax: v.optional(v.number()),

    // Description & Features
    headline: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    indoorFeatures: v.optional(v.array(v.string())),
    outdoorFeatures: v.optional(v.array(v.string())),

    // Media
    images: v.optional(v.array(v.string())), // URLs
    floorplans: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    mainImage: v.optional(v.string()),

    // Agent/Agency
    agentName: v.optional(v.string()),
    agentPhone: v.optional(v.string()),
    agentEmail: v.optional(v.string()),
    agencyName: v.optional(v.string()),
    agencyLogo: v.optional(v.string()),

    // Location data
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),

    // Status & Dates
    status: v.union(
      v.literal("active"),
      v.literal("sold"),
      v.literal("leased"),
      v.literal("withdrawn"),
      v.literal("off_market"),
    ),
    listingDate: v.optional(v.number()),
    soldDate: v.optional(v.number()),
    soldPrice: v.optional(v.number()),

    // Metadata
    metadata: v.optional(v.any()),
    rawData: v.optional(v.any()), // Original source data

    // Timestamps
    fetchedAt: v.number(),
    updatedAt: v.number(),
    lastSyncedAt: v.optional(v.number()),
  })
    .index("by_listingId", ["listingId"])
    .index("by_source", ["source"])
    .index("by_externalId", ["externalId"])
    .index("by_suburb", ["suburb"])
    .index("by_suburb_status", ["suburb", "status"])
    .index("by_suburb_state", ["suburb", "state"])
    .index("by_status", ["status"])
    .index("by_price", ["price"])
    .index("by_propertyType", ["propertyType"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_bathrooms", ["bathrooms"])
    .index("by_listingDate", ["listingDate"])
    .index("by_fetchedAt", ["fetchedAt"])
    // Compound indexes for efficient filtering
    .index("by_status_price", ["status", "price"])
    .index("by_status_propertyType", ["status", "propertyType"])
    .index("by_status_bedrooms", ["status", "bedrooms"])
    .index("by_suburb_status_price", ["suburb", "status", "price"])
    .index("by_propertyType_status_price", ["propertyType", "status", "price"])
    .index("by_state_suburb_status", ["state", "suburb", "status"])
    // Search index for full-text search
    .searchIndex("search_properties", {
      searchField: "address",
      filterFields: ["suburb", "state", "propertyType", "status", "bedrooms", "bathrooms", "price"],
    }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Collaborative Rooms (merged from source rooms)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  collaborativeRooms: defineTable({
    // Identity
    roomId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),

    // Ownership
    ownerId: v.string(), // User ID of the room creator
    ownerType: v.optional(v.union(v.literal("user"), v.literal("team"))),

    // Type & Purpose
    type: v.union(
      v.literal("property_search"),
      v.literal("property_analysis"),
      v.literal("market_research"),
      v.literal("team_collaboration"),
      v.literal("client_consultation"),
    ),

    // Settings
    settings: v.optional(
      v.object({
        isPublic: v.boolean(),
        allowGuests: v.boolean(),
        requireApproval: v.boolean(),
        maxParticipants: v.optional(v.number()),
        aiEnabled: v.boolean(),
        aiModel: v.optional(v.string()),
      }),
    ),

    // Participants
    participants: v.array(
      v.object({
        userId: v.string(),
        role: v.union(
          v.literal("owner"),
          v.literal("admin"),
          v.literal("member"),
          v.literal("viewer"),
          v.literal("guest"),
        ),
        joinedAt: v.number(),
        lastActiveAt: v.optional(v.number()),
        displayName: v.optional(v.string()),
      }),
    ),

    // Linked resources
    linkedProperties: v.optional(v.array(v.string())), // propertyIds
    linkedSearches: v.optional(v.array(v.string())), // search queries
    linkedDocuments: v.optional(v.array(v.string())), // document IDs

    // Cortex integration
    memorySpaceId: v.optional(v.string()), // Links to Cortex memory
    conversationId: v.optional(v.string()), // Active conversation

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("deleted"),
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_status", ["ownerId", "status"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_memorySpaceId", ["memorySpaceId"])
    .index("by_createdAt", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Property Uploads (user-uploaded property data)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  propertyUploads: defineTable({
    // Identity
    uploadId: v.string(),
    userId: v.string(), // Uploader

    // Upload source
    sourceType: v.union(
      v.literal("image"),
      v.literal("document"),
      v.literal("url"),
      v.literal("manual"),
    ),
    sourceUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // Convex storage reference

    // Linked property (if analyzed/linked)
    propertyId: v.optional(v.string()), // Links to propertyListings
    roomId: v.optional(v.string()), // Links to collaborativeRooms

    // Analysis results (from AI)
    analysis: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("processing"),
          v.literal("completed"),
          v.literal("failed"),
        ),
        propertyType: v.optional(v.string()),
        estimatedBedrooms: v.optional(v.number()),
        estimatedBathrooms: v.optional(v.number()),
        condition: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        priceRange: v.optional(
          v.object({
            min: v.number(),
            max: v.number(),
          }),
        ),
        description: v.optional(v.string()),
        confidence: v.optional(v.number()),
        analyzedAt: v.optional(v.number()),
        error: v.optional(v.string()),
      }),
    ),

    // Original data
    filename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),

    // Metadata
    metadata: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),

    // Timestamps
    uploadedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uploadId", ["uploadId"])
    .index("by_userId", ["userId"])
    .index("by_userId_uploaded", ["userId", "uploadedAt"])
    .index("by_propertyId", ["propertyId"])
    .index("by_roomId", ["roomId"])
    .index("by_analysisStatus", ["analysis.status"])
    .index("by_sourceType", ["sourceType"])
    .index("by_uploadedAt", ["uploadedAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Properties (simple property table from source)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Note: This is a simplified table for backward compatibility.
  // New code should use propertyListings for comprehensive property data.
  properties: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    location: v.string(),
    imageUrl: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_location", ["location"])
    .index("by_price", ["price"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Request Intros (property inquiry requests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  requestIntros: defineTable({
    propertyId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("pending"), v.literal("contacted"), v.literal("completed")),
    createdAt: v.number(),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: User Preferences (favorites and search filters)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Note: User preferences also exist in the users table. This table
  // provides structured access to favorites and search filters.
  userPreferences: defineTable({
    userId: v.string(),
    favoriteProperties: v.optional(v.array(v.string())),
    searchFilters: v.optional(v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      location: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATED: Room Presence (realtime collaboration tracking)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Note: Links to collaborativeRooms table for presence tracking
  roomPresence: defineTable({
    roomId: v.string(), // References collaborativeRooms.roomId
    userId: v.string(),
    userName: v.string(),
    lastSeen: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_userId", ["userId"])
    .index("by_lastSeen", ["lastSeen"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MIGRATION: HAUS Platform Tables (from source repository)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // DUD Reports (Trust/Safety Database)
  dudReports: defineTable({
    reportNumber: v.optional(v.number()),
    name: v.string(),
    slug: v.string(),
    category: v.string(),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    location: v.string(),
    rating: v.number(),
    reviewCount: v.number(),
    headline: v.optional(v.string()),
    riskScore: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
    issues: v.array(v.string()),
    lastReported: v.string(),
    status: v.string(),
    regulatorRefs: v.optional(
      v.array(v.object({ name: v.string(), url: v.optional(v.string()) }))
    ),
    nextSteps: v.optional(
      v.array(v.object({ title: v.string(), description: v.string() }))
    ),
    evidence: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          dateLabel: v.string(),
          title: v.string(),
          description: v.string(),
          sourceLabel: v.string(),
          confidence: v.string(),
        })
      )
    ),
    redFlags: v.optional(
      v.array(
        v.object({ label: v.string(), severity: v.string(), icon: v.string() })
      )
    ),
    providerIds: v.optional(v.array(v.id("providers"))),
    highProfile: v.optional(v.boolean()),
    caseStudy: v.optional(
      v.object({
        title: v.string(),
        damages: v.string(),
        inspector: v.string(),
        videoViews: v.string(),
        defects: v.number(),
      })
    ),
    blueKeyProperties: v.optional(
      v.array(
        v.object({
          projectName: v.string(),
          location: v.string(),
          issues: v.array(v.string()),
          rating: v.number(),
        })
      )
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_report_number", ["reportNumber"])
    .index("by_country", ["country"])
    .index("by_region", ["region"])
    .index("by_category", ["category"])
    .index("by_category_country", ["category", "country"])
    .index("by_high_profile", ["highProfile"]),

  // Providers (Marketplace Service Providers)
  providers: defineTable({
    businessName: v.string(),
    slug: v.string(),
    category: v.string(),
    description: v.string(),
    shortDescription: v.string(),
    country: v.optional(v.string()),
    regions: v.optional(v.array(v.string())),
    rating: v.number(),
    reviewCount: v.number(),
    completedJobs: v.number(),
    responseTime: v.string(),
    pricing: v.optional(
      v.object({
        type: v.string(),
        startingFrom: v.number(),
        currency: v.string(),
      })
    ),
    verificationLevel: v.string(),
    badges: v.array(v.string()),
    featured: v.optional(v.boolean()),
    teamSize: v.number(),
    availableForUrgent: v.optional(v.boolean()),
    services: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_country", ["country"])
    .index("by_category_country", ["category", "country"])
    .index("by_verification", ["verificationLevel"])
    .index("by_featured", ["featured"]),

  // Compass Listings (Map-based Property Search)
  compassListings: defineTable({
    title: v.string(),
    address: v.string(),
    suburb: v.string(),
    postcode: v.string(),
    state: v.string(),
    coordinates: v.object({ lat: v.number(), lng: v.number() }),
    price: v.number(),
    priceLabel: v.string(),
    listingMode: v.string(),
    propertyType: v.string(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    parkingSpaces: v.number(),
    landSize: v.optional(v.number()),
    images: v.array(v.string()),
    features: v.array(v.string()),
    agent: v.object({
      name: v.string(),
      agency: v.string(),
      avatar: v.string(),
      phone: v.string(),
    }),
    isFavorite: v.boolean(),
    isNew: v.boolean(),
    isPremium: v.boolean(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    daysOnMarket: v.number(),
    inspectionTimes: v.optional(v.array(v.string())),
    auctionDate: v.optional(v.string()),
  })
    .index("by_listingMode", ["listingMode"])
    .index("by_propertyType", ["propertyType"])
    .index("by_suburb", ["suburb"])
    .index("by_price", ["price"]),

  // Market Categories
  marketCategories: defineTable({
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.string(),
    stats: v.optional(
      v.object({
        providers: v.number(),
        avgRating: v.number(),
        completedJobs: v.number(),
      })
    ),
  }).index("by_slug", ["slug"]),

  // User Progress (Gamification)
  userProgress: defineTable({
    userId: v.string(),
    xp: v.number(),
    level: v.number(),
    streak: v.number(),
    lastActiveDate: v.string(),
    completedLessons: v.array(v.string()),
    completedAchievements: v.array(v.string()),
    stats: v.optional(
      v.object({
        propertiesViewed: v.number(),
        searchesMade: v.number(),
        reportsGenerated: v.number(),
        documentsUploaded: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Achievements
  achievements: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    xpReward: v.number(),
    category: v.string(),
    requirement: v.object({
      type: v.string(),
      target: v.number(),
      metric: v.optional(v.string()),
    }),
  }).index("by_category", ["category"]),

  // Lessons (Academy Content)
  lessons: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    duration: v.number(),
    xpReward: v.number(),
    order: v.number(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    courseId: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_order", ["order"]),

  // Tenders (Document Management)
  tenders: defineTable({
    name: v.string(),
    clientName: v.string(),
    deadline: v.float64(),
    value: v.optional(v.float64()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_clientName", ["clientName"])
    .index("by_deadline", ["deadline"]),

  // Tender Documents
  tenderDocuments: defineTable({
    name: v.string(),
    tenderId: v.id("tenders"),
    type: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    uploadedAt: v.number(),
  })
    .index("by_tenderId", ["tenderId"])
    .index("by_type", ["type"]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rate Limiting
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  rateLimits: defineTable({
    // User ID or IP address
    identifier: v.string(),
    // Endpoint or action being rate limited (e.g., "ai:chat", "voice:token")
    endpoint: v.string(),
    // Request count in current window
    count: v.number(),
    // Window start timestamp (ms)
    windowStart: v.number(),
    // Window duration (ms)
    windowMs: v.number(),
    // When this record was created
    createdAt: v.number(),
    // When this record was last updated
    updatedAt: v.number(),
  })
    .index("by_identifier_endpoint", ["identifier", "endpoint"])
    .index("by_identifier_endpoint_window", ["identifier", "endpoint", "windowStart"])
    .index("by_windowStart", ["windowStart"]),
});
