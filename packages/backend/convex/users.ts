import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { polar } from "./subscriptions";
import { username } from "./utils/validators";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Queries (Internal)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get user by ID (internal query for payment processing)
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Queries (Public)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return;
    }
    const subscription = await polar.getCurrentSubscription(ctx, {
      userId: user._id,
    });
    return {
      ...user,
      name: user.username || user.name,
      subscription,
      avatarUrl: user.imageId
        ? await ctx.storage.getUrl(user.imageId)
        : undefined,
    };
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const validatedUsername = username.safeParse(args.username);

    if (!validatedUsername.success) {
      throw new Error(validatedUsername.error.message);
    }
    await ctx.db.patch(userId, { username: validatedUsername.data });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    ctx.db.patch(userId, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
  },
});

export const deleteUserAccount = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await asyncMap(
      ["google" /* add other providers as needed */],
      async (provider) => {
        const authAccount = await ctx.db
          .query("authAccounts")
          .withIndex("userIdAndProvider", (q) =>
            q.eq("userId", args.userId).eq("provider", provider),
          )
          .unique();
        if (!authAccount) {
          return;
        }
        await ctx.db.delete(authAccount._id);
      },
    );
    await ctx.db.delete(args.userId);
  },
});

export const deleteCurrentUserAccount = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const subscription = await polar.getCurrentSubscription(ctx, {
      userId,
    });
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await polar.cancelSubscription(ctx, {
        revokeImmediately: true,
      });
    }
    await ctx.runMutation(internal.users.deleteUserAccount, {
      userId,
    });
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RevenueCat Premium Sync (for Mobile App)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Syncs premium subscription status from RevenueCat (mobile app)
 * Called by RevenueCatContext when subscription status changes
 * Also updates unified subscription fields
 */
export const syncPremiumStatus = mutation({
  args: {
    revenueCatId: v.string(), // RevenueCat originalAppUserId
    isPremium: v.boolean(), // Premium subscription status
    latestExpiration: v.optional(v.nullable(v.string())), // ISO date string
    entitlements: v.optional(v.record(v.string(), v.any())), // Active entitlements
    subscriptions: v.optional(v.record(v.string(), v.any())), // Subscription details
    allPurchasedProducts: v.optional(v.array(v.string())), // All purchased product IDs
  },
  handler: async (ctx, args) => {
    const { revenueCatId, isPremium, latestExpiration, entitlements, subscriptions } = args;

    // Find user by revenueCatId
    const userByRevenueCatId = await ctx.db
      .query("users")
      .withIndex("revenueCatId", (q) => q.eq("revenueCatId", revenueCatId))
      .unique();

    if (userByRevenueCatId) {
      const now = Date.now();

      // Determine tier from entitlements
      let tier: "free" | "premium" | "agency" = isPremium ? "premium" : "free";
      if (entitlements) {
        if (entitlements["haus.agency"] || entitlements["haus.pro"]) {
          tier = "agency";
        }
      }

      // Update existing user's premium status
      await ctx.db.patch(userByRevenueCatId._id, {
        isPremium,
        premiumExpiresAt: latestExpiration ? new Date(latestExpiration).getTime() : undefined,
        premiumEntitlements: entitlements,
        premiumSubscriptions: subscriptions,
        premiumUpdatedAt: now,
        // Update unified subscription fields
        subscriptionTier: tier,
        subscriptionStatus: isPremium ? "active" : "inactive",
        subscriptionSource: "revenuecat",
        subscriptionSyncedAt: now,
      });
      return { success: true, userId: userByRevenueCatId._id };
    }

    // If no user found by revenueCatId, this might be a new user
    // The mobile app should call this after authentication
    return { success: false, error: "User not found" };
  },
});

/**
 * Links RevenueCat ID to authenticated user (call after sign-in)
 */
export const linkRevenueCatAccount = mutation({
  args: {
    revenueCatId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if RevenueCat ID is already linked to another user
    const existing = await ctx.db
      .query("users")
      .withIndex("revenueCatId", (q) => q.eq("revenueCatId", args.revenueCatId))
      .unique();

    if (existing && existing._id !== userId) {
      throw new Error("RevenueCat account already linked to another user");
    }

    // Link RevenueCat ID to current user
    await ctx.db.patch(userId, {
      revenueCatId: args.revenueCatId,
    });

    return { success: true };
  },
});

/**
 * Gets premium status for current user
 */
export const getPremiumStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isPremium: false };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { isPremium: false };
    }

    return {
      isPremium: user.isPremium ?? false,
      expiresAt: user.premiumExpiresAt,
      entitlements: user.premiumEntitlements,
    };
  },
});
