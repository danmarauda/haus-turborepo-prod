/**
 * Unified Subscription Model
 *
 * Combines multiple subscription sources (Stripe, RevenueCat, Polar)
 * into a single coherent system with unified tier management and feature gating.
 *
 * Subscription Sources:
 * - Stripe: Web subscriptions (payments/stripe.ts)
 * - RevenueCat: Mobile subscriptions (iOS/Android) via webhooks
 * - Polar: Alternative payment provider (subscriptions.ts)
 *
 * Unified Tiers:
 * - free: No active subscription
 * - premium: Has active premium subscription (any source)
 * - agency: Has agency-level subscription
 *
 * Features:
 * - voice_search: Premium+
 * - advanced_filters: Premium+
 * - saved_searches: Free+
 * - property_analytics: Premium+
 * - off_market_access: Agency only
 * - api_access: Agency only
 *
 * @module convex/unified-subscriptions
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  REVENUECAT_CONFIG,
  type PremiumTier,
  ENTITLEMENT_TO_TIER,
} from "../lib/revenuecat";

// =============================================================================
// TYPES & ENUMS
// =============================================================================

/**
 * Subscription sources
 */
export type SubscriptionSource = "stripe" | "revenuecat" | "polar" | "none";

/**
 * Subscription tier
 */
export type SubscriptionTier = "free" | "premium" | "agency";

/**
 * Feature flags for gating functionality
 */
export type FeatureFlag =
  | "voice_search"
  | "advanced_filters"
  | "saved_searches"
  | "property_analytics"
  | "off_market_access"
  | "api_access";

/**
 * Unified subscription status
 */
export interface UnifiedSubscriptionStatus {
  tier: SubscriptionTier;
  source: SubscriptionSource;
  isActive: boolean;
  isPremium: boolean;
  isAgency: boolean;
  expiresAt: number | null;
  willCancelAtPeriodEnd: boolean;
  hasPaymentIssue: boolean;
  sources: {
    stripe: {
      hasSubscription: boolean;
      tier: SubscriptionTier;
      status: string | null;
      expiresAt: number | null;
    };
    revenuecat: {
      hasSubscription: boolean;
      tier: SubscriptionTier;
      entitlements: Record<string, unknown>;
      expiresAt: number | null;
    };
    polar: {
      hasSubscription: boolean;
      tier: SubscriptionTier;
      status: string | null;
    };
  };
}

/**
 * Feature access definition
 */
interface FeatureAccess {
  minTier: SubscriptionTier;
  description: string;
}

// =============================================================================
// FEATURE GATING CONFIGURATION
// =============================================================================

/**
 * Feature access matrix
 * Defines which tier is required for each feature
 */
export const FEATURE_ACCESS: Record<FeatureFlag, FeatureAccess> = {
  voice_search: {
    minTier: "premium",
    description: "Voice-powered property search",
  },
  advanced_filters: {
    minTier: "premium",
    description: "Advanced property filtering options",
  },
  saved_searches: {
    minTier: "free",
    description: "Save and manage search queries",
  },
  property_analytics: {
    minTier: "premium",
    description: "Property market analytics and insights",
  },
  off_market_access: {
    minTier: "agency",
    description: "Access to off-market and pre-market listings",
  },
  api_access: {
    minTier: "agency",
    description: "API access for integrations",
  },
};

/**
 * Tier hierarchy for comparison
 */
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  agency: 2,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Compare two tiers and return the higher one
 */
function getHigherTier(
  tier1: SubscriptionTier,
  tier2: SubscriptionTier
): SubscriptionTier {
  return TIER_HIERARCHY[tier1] >= TIER_HIERARCHY[tier2] ? tier1 : tier2;
}

/**
 * Check if a tier meets the minimum requirement for a feature
 */
function tierMeetsRequirement(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Map RevenueCat entitlements to tier
 */
function mapRevenueCatToTier(
  entitlements: Record<string, unknown> | undefined
): SubscriptionTier {
  if (!entitlements) return "free";

  // Check for agency entitlement first (highest tier)
  if (
    entitlements[REVENUECAT_CONFIG.AGENCY_ENTITLEMENT] ||
    entitlements["haus.agency"] ||
    entitlements["haus.pro"]
  ) {
    return "agency";
  }

  // Check for premium entitlement
  if (
    entitlements[REVENUECAT_CONFIG.PREMIUM_ENTITLEMENT] ||
    entitlements["haus.premium"]
  ) {
    return "premium";
  }

  return "free";
}

/**
 * Map Stripe status to unified status
 */
function mapStripeStatusToUnified(
  status: string | undefined
): { isActive: boolean; hasPaymentIssue: boolean } {
  if (!status) {
    return { isActive: false, hasPaymentIssue: false };
  }

  const activeStatuses = ["active", "trialing", "past_due", "incomplete"];
  const paymentIssueStatuses = ["past_due", "unpaid", "incomplete_expired"];

  return {
    isActive: activeStatuses.includes(status),
    hasPaymentIssue: paymentIssueStatuses.includes(status),
  };
}

/**
 * Map RevenueCat status to unified status
 */
function mapRevenueCatToUnified(
  isPremium: boolean | undefined,
  expiresAt: number | undefined
): { isActive: boolean; hasPaymentIssue: boolean } {
  const now = Date.now();
  const isExpired = expiresAt ? expiresAt < now : false;
  const isActive = isPremium === true && !isExpired;

  return {
    isActive,
    hasPaymentIssue: false, // RevenueCat handles this via subscription status
  };
}

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get unified subscription status for the current user
 *
 * Aggregates status from all sources (Stripe, RevenueCat, Polar)
 * and returns a unified view.
 *
 * @returns UnifiedSubscriptionStatus object with complete subscription info
 */
export const unifiedSubscriptionStatus = query({
  args: {},
  handler: async (ctx): Promise<UnifiedSubscriptionStatus> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      // Return free tier for unauthenticated users
      return {
        tier: "free",
        source: "none",
        isActive: false,
        isPremium: false,
        isAgency: false,
        expiresAt: null,
        willCancelAtPeriodEnd: false,
        hasPaymentIssue: false,
        sources: {
          stripe: {
            hasSubscription: false,
            tier: "free",
            status: null,
            expiresAt: null,
          },
          revenuecat: {
            hasSubscription: false,
            tier: "free",
            entitlements: {},
            expiresAt: null,
          },
          polar: {
            hasSubscription: false,
            tier: "free",
            status: null,
          },
        },
      };
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get Stripe status
    const stripeStatus = user.subscriptionStatus;
    const stripeTier = (user.subscriptionTier as SubscriptionTier) || "free";
    const stripeInfo = mapStripeStatusToUnified(stripeStatus);
    const stripeExpiresAt = user.subscriptionPeriodEnd || null;

    // Get RevenueCat status
    const revenueCatEntitlements = user.premiumEntitlements || {};
    const revenueCatTier = mapRevenueCatToTier(revenueCatEntitlements);
    const revenueCatInfo = mapRevenueCatToUnified(
      user.isPremium,
      user.premiumExpiresAt
    );
    const revenueCatExpiresAt = user.premiumExpiresAt || null;

    // Get Polar status (from user record if available)
    // Note: Polar subscription is also accessible via the separate query
    const polarTier: SubscriptionTier = "free"; // Will be determined below
    const polarStatus = user.subscriptionStatus; // Could be enhanced with Polar-specific field

    // Calculate unified tier (highest from all sources)
    let unifiedTier: SubscriptionTier = "free";
    let unifiedSource: SubscriptionSource = "none";
    let unifiedExpiresAt: number | null = null;
    let unifiedWillCancel = false;
    let unifiedHasPaymentIssue = false;

    // Check Stripe
    if (stripeInfo.isActive && TIER_HIERARCHY[stripeTier] > TIER_HIERARCHY[unifiedTier]) {
      unifiedTier = stripeTier;
      unifiedSource = "stripe";
      unifiedExpiresAt = stripeExpiresAt;
      unifiedWillCancel = user.subscriptionCancelAtPeriodEnd || false;
      unifiedHasPaymentIssue = stripeInfo.hasPaymentIssue;
    }

    // Check RevenueCat (mobile subscriptions)
    if (
      revenueCatInfo.isActive &&
      TIER_HIERARCHY[revenueCatTier] > TIER_HIERARCHY[unifiedTier]
    ) {
      unifiedTier = revenueCatTier;
      unifiedSource = "revenuecat";
      unifiedExpiresAt = revenueCatExpiresAt;
      unifiedHasPaymentIssue = revenueCatInfo.hasPaymentIssue;
    }

    // If tiers are equal but RevenueCat is active and Stripe is not, prefer RevenueCat
    if (
      revenueCatInfo.isActive &&
      !stripeInfo.isActive &&
      TIER_HIERARCHY[revenueCatTier] >= TIER_HIERARCHY[unifiedTier]
    ) {
      unifiedTier = revenueCatTier;
      unifiedSource = "revenuecat";
      unifiedExpiresAt = revenueCatExpiresAt;
    }

    // Check if still active based on expiration
    const now = Date.now();
    const isExpired = unifiedExpiresAt ? unifiedExpiresAt < now : false;
    const isActive = unifiedSource !== "none" && !isExpired;

    return {
      tier: unifiedTier,
      source: unifiedSource,
      isActive,
      isPremium: isActive && TIER_HIERARCHY[unifiedTier] >= TIER_HIERARCHY["premium"],
      isAgency: isActive && unifiedTier === "agency",
      expiresAt: unifiedExpiresAt,
      willCancelAtPeriodEnd: unifiedWillCancel,
      hasPaymentIssue: unifiedHasPaymentIssue,
      sources: {
        stripe: {
          hasSubscription: stripeInfo.isActive,
          tier: stripeTier,
          status: stripeStatus || null,
          expiresAt: stripeExpiresAt,
        },
        revenuecat: {
          hasSubscription: revenueCatInfo.isActive,
          tier: revenueCatTier,
          entitlements: revenueCatEntitlements,
          expiresAt: revenueCatExpiresAt,
        },
        polar: {
          hasSubscription: false, // Will be populated from Polar query
          tier: polarTier,
          status: polarStatus || null,
        },
      },
    };
  },
});

/**
 * Get unified subscription status for a specific user (internal use)
 */
export const getUserSubscriptionStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<UnifiedSubscriptionStatus> => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get Stripe status
    const stripeStatus = user.subscriptionStatus;
    const stripeTier = (user.subscriptionTier as SubscriptionTier) || "free";
    const stripeInfo = mapStripeStatusToUnified(stripeStatus);
    const stripeExpiresAt = user.subscriptionPeriodEnd || null;

    // Get RevenueCat status
    const revenueCatEntitlements = user.premiumEntitlements || {};
    const revenueCatTier = mapRevenueCatToTier(revenueCatEntitlements);
    const revenueCatInfo = mapRevenueCatToUnified(
      user.isPremium,
      user.premiumExpiresAt
    );
    const revenueCatExpiresAt = user.premiumExpiresAt || null;

    // Calculate unified tier
    let unifiedTier: SubscriptionTier = "free";
    let unifiedSource: SubscriptionSource = "none";
    let unifiedExpiresAt: number | null = null;
    let unifiedWillCancel = false;
    let unifiedHasPaymentIssue = false;

    // Check Stripe
    if (stripeInfo.isActive && TIER_HIERARCHY[stripeTier] > TIER_HIERARCHY[unifiedTier]) {
      unifiedTier = stripeTier;
      unifiedSource = "stripe";
      unifiedExpiresAt = stripeExpiresAt;
      unifiedWillCancel = user.subscriptionCancelAtPeriodEnd || false;
      unifiedHasPaymentIssue = stripeInfo.hasPaymentIssue;
    }

    // Check RevenueCat
    if (
      revenueCatInfo.isActive &&
      TIER_HIERARCHY[revenueCatTier] > TIER_HIERARCHY[unifiedTier]
    ) {
      unifiedTier = revenueCatTier;
      unifiedSource = "revenuecat";
      unifiedExpiresAt = revenueCatExpiresAt;
    }

    const now = Date.now();
    const isExpired = unifiedExpiresAt ? unifiedExpiresAt < now : false;
    const isActive = unifiedSource !== "none" && !isExpired;

    return {
      tier: unifiedTier,
      source: unifiedSource,
      isActive,
      isPremium: isActive && TIER_HIERARCHY[unifiedTier] >= TIER_HIERARCHY["premium"],
      isAgency: isActive && unifiedTier === "agency",
      expiresAt: unifiedExpiresAt,
      willCancelAtPeriodEnd: unifiedWillCancel,
      hasPaymentIssue: unifiedHasPaymentIssue,
      sources: {
        stripe: {
          hasSubscription: stripeInfo.isActive,
          tier: stripeTier,
          status: stripeStatus || null,
          expiresAt: stripeExpiresAt,
        },
        revenuecat: {
          hasSubscription: revenueCatInfo.isActive,
          tier: revenueCatTier,
          entitlements: revenueCatEntitlements,
          expiresAt: revenueCatExpiresAt,
        },
        polar: {
          hasSubscription: false,
          tier: "free",
          status: null,
        },
      },
    };
  },
});

/**
 * Check if the current user has access to a specific feature
 *
 * @param feature - The feature to check access for
 * @returns boolean indicating if user has access
 */
export const hasFeatureAccess = query({
  args: {
    feature: v.union(
      v.literal("voice_search"),
      v.literal("advanced_filters"),
      v.literal("saved_searches"),
      v.literal("property_analytics"),
      v.literal("off_market_access"),
      v.literal("api_access")
    ),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      // Unauthenticated users only get free features
      const requiredTier = FEATURE_ACCESS[args.feature].minTier;
      return requiredTier === "free";
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return false;
    }

    // Calculate effective tier
    const effectiveTier = await calculateEffectiveTier(ctx, userId);

    // Check if tier meets requirement
    const requiredTier = FEATURE_ACCESS[args.feature].minTier;
    return tierMeetsRequirement(effectiveTier, requiredTier);
  },
});

/**
 * Get the current subscription tier for the authenticated user
 *
 * @returns The subscription tier ("free" | "premium" | "agency")
 */
export const getSubscriptionTier = query({
  args: {},
  handler: async (ctx): Promise<SubscriptionTier> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return "free";
    }

    return calculateEffectiveTier(ctx, userId);
  },
});

/**
 * Check if the current user has premium access (Premium or Agency tier)
 *
 * @returns boolean indicating premium access
 */
export const canAccessPremium = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return false;
    }

    const tier = await calculateEffectiveTier(ctx, userId);
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY["premium"];
  },
});

/**
 * Check if the current user has agency access
 *
 * @returns boolean indicating agency access
 */
export const canAccessAgency = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return false;
    }

    const tier = await calculateEffectiveTier(ctx, userId);
    return tier === "agency";
  },
});

/**
 * Get all available features and their access status for the current user
 *
 * @returns Record of features with access status and descriptions
 */
export const getFeatureAccessStatus = query({
  args: {},
  handler: async (
    ctx
  ): Promise<
    Record<
      FeatureFlag,
      {
        hasAccess: boolean;
        description: string;
        requiredTier: SubscriptionTier;
      }
    >
  > => {
    const userId = await getAuthUserId(ctx);
    let userTier: SubscriptionTier = "free";

    if (userId) {
      userTier = await calculateEffectiveTier(ctx, userId);
    }

    const result = {} as Record<
      FeatureFlag,
      {
        hasAccess: boolean;
        description: string;
        requiredTier: SubscriptionTier;
      }
    >;

    for (const [feature, config] of Object.entries(FEATURE_ACCESS)) {
      const featureFlag = feature as FeatureFlag;
      result[featureFlag] = {
        hasAccess: tierMeetsRequirement(userTier, config.minTier),
        description: config.description,
        requiredTier: config.minTier,
      };
    }

    return result;
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Sync subscription status from any source
 *
 * This mutation normalizes subscription data from Stripe, RevenueCat, or Polar
 * into a unified format stored in the user record.
 *
 * @param source - The source of the subscription data
 * @param tier - The subscription tier
 * @param status - The subscription status
 * @param expiresAt - Expiration timestamp (milliseconds)
 * @param metadata - Additional metadata from the source
 */
export const syncSubscriptionStatus = mutation({
  args: {
    source: v.union(
      v.literal("stripe"),
      v.literal("revenuecat"),
      v.literal("polar")
    ),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("agency")),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    willCancelAtPeriodEnd: v.optional(v.boolean()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const isExpired = args.expiresAt ? args.expiresAt < now : false;
    const isActive = args.isActive !== undefined ? args.isActive : !isExpired;

    // Update user record with unified subscription data
    const updateData: Record<string, unknown> = {
      subscriptionTier: args.tier,
      subscriptionStatus: isActive ? args.status || "active" : "inactive",
      subscriptionSource: args.source,
      subscriptionSyncedAt: now,
      isPremium: isActive && TIER_HIERARCHY[args.tier] >= TIER_HIERARCHY["premium"],
      premiumUpdatedAt: now,
    };

    // Set expiration based on source
    if (args.expiresAt) {
      updateData.premiumExpiresAt = args.expiresAt;
      updateData.subscriptionPeriodEnd = args.expiresAt;
    }

    // Set cancellation flag
    if (args.willCancelAtPeriodEnd !== undefined) {
      updateData.subscriptionCancelAtPeriodEnd = args.willCancelAtPeriodEnd;
    }

    // Source-specific updates
    if (args.source === "stripe") {
      if (args.metadata?.subscriptionId) {
        updateData.stripeSubscriptionId = args.metadata.subscriptionId;
      }
      if (args.metadata?.customerId) {
        updateData.stripeCustomerId = args.metadata.customerId;
      }
    }

    if (args.source === "revenuecat") {
      if (args.metadata?.revenueCatId) {
        updateData.revenueCatId = args.metadata.revenueCatId;
      }
      if (args.metadata?.entitlements) {
        updateData.premiumEntitlements = args.metadata.entitlements;
      }
      if (args.metadata?.subscriptions) {
        updateData.premiumSubscriptions = args.metadata.subscriptions;
      }
    }

    await ctx.db.patch(userId, updateData);

    return {
      success: true,
      userId,
      tier: args.tier,
      isActive,
      source: args.source,
    };
  },
});

/**
 * Internal mutation to sync subscription status by user ID
 * Used by webhook handlers when user ID is known
 */
export const syncSubscriptionStatusByUserId = mutation({
  args: {
    userId: v.id("users"),
    source: v.union(
      v.literal("stripe"),
      v.literal("revenuecat"),
      v.literal("polar")
    ),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("agency")),
    status: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    willCancelAtPeriodEnd: v.optional(v.boolean()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const isExpired = args.expiresAt ? args.expiresAt < now : false;
    const isActive = args.isActive !== undefined ? args.isActive : !isExpired;

    // Update user record
    const updateData: Record<string, unknown> = {
      subscriptionTier: args.tier,
      subscriptionStatus: isActive ? args.status || "active" : "inactive",
      subscriptionSource: args.source,
      subscriptionSyncedAt: now,
      isPremium: isActive && TIER_HIERARCHY[args.tier] >= TIER_HIERARCHY["premium"],
      premiumUpdatedAt: now,
    };

    if (args.expiresAt) {
      updateData.premiumExpiresAt = args.expiresAt;
      updateData.subscriptionPeriodEnd = args.expiresAt;
    }

    if (args.willCancelAtPeriodEnd !== undefined) {
      updateData.subscriptionCancelAtPeriodEnd = args.willCancelAtPeriodEnd;
    }

    if (args.source === "stripe") {
      if (args.metadata?.subscriptionId) {
        updateData.stripeSubscriptionId = args.metadata.subscriptionId;
      }
      if (args.metadata?.customerId) {
        updateData.stripeCustomerId = args.metadata.customerId;
      }
    }

    if (args.source === "revenuecat") {
      if (args.metadata?.revenueCatId) {
        updateData.revenueCatId = args.metadata.revenueCatId;
      }
      if (args.metadata?.entitlements) {
        updateData.premiumEntitlements = args.metadata.entitlements;
      }
      if (args.metadata?.subscriptions) {
        updateData.premiumSubscriptions = args.metadata.subscriptions;
      }
    }

    await ctx.db.patch(args.userId, updateData);

    return {
      success: true,
      userId: args.userId,
      tier: args.tier,
      isActive,
      source: args.source,
    };
  },
});

/**
 * Downgrade user to free tier
 * Called when all subscriptions are cancelled/expired
 */
export const downgradeToFree = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
      subscriptionSource: "none",
      subscriptionSyncedAt: Date.now(),
      isPremium: false,
      premiumExpiresAt: Date.now(),
      subscriptionCancelAtPeriodEnd: false,
      premiumUpdatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Force sync all subscription sources for the current user
 * Useful when user wants to refresh their subscription status
 */
export const forceSyncAllSources = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get current unified status
    const status = await ctx.runQuery(
      internal.unified_subscriptions.getUserSubscriptionStatus,
      { userId: user._id }
    );

    // If no active subscriptions found, ensure user is downgraded to free
    if (!status.isActive && user.subscriptionTier !== "free") {
      await ctx.runMutation(
        internal.unified_subscriptions.syncSubscriptionStatusByUserId,
        {
          userId: user._id,
          source: "stripe", // Default source
          tier: "free",
          status: "inactive",
          isActive: false,
        }
      );
    }

    return {
      success: true,
      currentStatus: status,
    };
  },
});

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Calculate the effective subscription tier for a user
 * by comparing all sources and returning the highest tier
 */
async function calculateEffectiveTier(
  ctx: any,
  userId: Id<"users">
): Promise<SubscriptionTier> {
  const user = await ctx.db.get(userId);

  if (!user) {
    return "free";
  }

  let effectiveTier: SubscriptionTier = "free";
  const now = Date.now();

  // Check Stripe subscription
  const stripeTier = (user.subscriptionTier as SubscriptionTier) || "free";
  const stripeStatus = user.subscriptionStatus;
  const stripeExpiresAt = user.subscriptionPeriodEnd;
  const isStripeActive =
    stripeStatus &&
    ["active", "trialing"].includes(stripeStatus) &&
    (!stripeExpiresAt || stripeExpiresAt > now);

  if (isStripeActive && TIER_HIERARCHY[stripeTier] > TIER_HIERARCHY[effectiveTier]) {
    effectiveTier = stripeTier;
  }

  // Check RevenueCat subscription
  const revenueCatEntitlements = user.premiumEntitlements || {};
  const revenueCatTier = mapRevenueCatToTier(revenueCatEntitlements);
  const revenueCatExpiresAt = user.premiumExpiresAt;
  const isRevenueCatActive =
    user.isPremium === true && (!revenueCatExpiresAt || revenueCatExpiresAt > now);

  if (
    isRevenueCatActive &&
    TIER_HIERARCHY[revenueCatTier] > TIER_HIERARCHY[effectiveTier]
  ) {
    effectiveTier = revenueCatTier;
  }

  return effectiveTier;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  TIER_HIERARCHY,
  getHigherTier,
  tierMeetsRequirement,
  mapRevenueCatToTier,
  mapStripeStatusToUnified,
};

// Type exports for use in other modules
export type { UnifiedSubscriptionStatus, FeatureAccess, SubscriptionSource };
