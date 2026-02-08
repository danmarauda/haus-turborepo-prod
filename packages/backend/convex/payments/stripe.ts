/**
 * Stripe Payment Integration for HAUS
 *
 * Provides comprehensive Stripe payment functionality including:
 * - Checkout session creation for one-time payments and subscriptions
 * - Webhook handling for Stripe events
 * - Customer and subscription management
 * - Product and price configuration
 * - Entitlement synchronization with user records
 *
 * Architecture:
 * - Uses Stripe SDK for server-side operations
 * - Integrates with Convex auth for user management
 * - Syncs subscription status to users table
 * - Provides checkout and portal links for frontend
 *
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Stripe API secret key
 * - STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
 * - STRIPE_PRICE_ID_PREMIUM_MONTHLY: Premium monthly price ID
 * - STRIPE_PRICE_ID_PREMIUM_YEARLY: Premium yearly price ID
 * - STRIPE_PRICE_ID_AGENCY_MONTHLY: Agency monthly price ID
 * - STRIPE_PRICE_ID_AGENCY_YEARLY: Agency yearly price ID
 */

import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Product tiers for HAUS subscriptions
 */
export enum ProductTier {
  FREE = "free",
  PREMIUM = "premium",
  AGENCY = "agency",
}

/**
 * Subscription intervals
 */
export enum BillingInterval {
  MONTHLY = "month",
  YEARLY = "year",
}

/**
 * Stripe product configuration
 */
export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  tier: ProductTier;
  prices: {
    monthly?: string; // Stripe Price ID
    yearly?: string; // Stripe Price ID
  };
  features: string[];
}

/**
 * Entitlements for each tier
 */
export interface TierEntitlements {
  maxProperties: number;
  maxCollaborativeRooms: number;
  aiQueriesPerMonth: number;
  voiceSearchEnabled: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
}

// =============================================================================
// PRODUCT CONFIGURATION
// =============================================================================

/**
 * HAUS product catalog
 * Maps to Stripe products and prices configured in the Stripe Dashboard
 */
export const PRODUCTS: Record<ProductTier, StripeProduct> = {
  [ProductTier.FREE]: {
    id: "prod_free",
    name: "HAUS Free",
    description: "Essential property search and discovery",
    tier: ProductTier.FREE,
    prices: {},
    features: [
      "Basic property search",
      "Voice search queries (50/month)",
      "Save up to 10 properties",
      "1 collaborative room",
      "Email support",
    ],
  },
  [ProductTier.PREMIUM]: {
    id: "prod_premium",
    name: "HAUS Premium",
    description: "Advanced tools for serious property seekers",
    tier: ProductTier.PREMIUM,
    prices: {
      monthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
      yearly: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
    },
    features: [
      "Everything in Free",
      "Unlimited voice search",
      "Unlimited saved properties",
      "10 collaborative rooms",
      "Advanced analytics",
      "AI property insights",
      "Priority email support",
      "Market trend alerts",
    ],
  },
  [ProductTier.AGENCY]: {
    id: "prod_agency",
    name: "HAUS Agency",
    description: "Complete solution for real estate professionals",
    tier: ProductTier.AGENCY,
    prices: {
      monthly: process.env.STRIPE_PRICE_ID_AGENCY_MONTHLY,
      yearly: process.env.STRIPE_PRICE_ID_AGENCY_YEARLY,
    },
    features: [
      "Everything in Premium",
      "Unlimited collaborative rooms",
      "White-label branding",
      "API access",
      "Team management (up to 50 users)",
      "Client portal",
      "Phone & chat support",
      "Custom integrations",
    ],
  },
};

/**
 * Tier entitlement mapping
 */
export const TIER_ENTITLEMENTS: Record<ProductTier, TierEntitlements> = {
  [ProductTier.FREE]: {
    maxProperties: 10,
    maxCollaborativeRooms: 1,
    aiQueriesPerMonth: 50,
    voiceSearchEnabled: true,
    advancedAnalytics: false,
    prioritySupport: false,
    whiteLabel: false,
    apiAccess: false,
  },
  [ProductTier.PREMIUM]: {
    maxProperties: -1, // Unlimited
    maxCollaborativeRooms: 10,
    aiQueriesPerMonth: -1, // Unlimited
    voiceSearchEnabled: true,
    advancedAnalytics: true,
    prioritySupport: true,
    whiteLabel: false,
    apiAccess: false,
  },
  [ProductTier.AGENCY]: {
    maxProperties: -1, // Unlimited
    maxCollaborativeRooms: -1, // Unlimited
    aiQueriesPerMonth: -1, // Unlimited
    voiceSearchEnabled: true,
    advancedAnalytics: true,
    prioritySupport: true,
    whiteLabel: true,
    apiAccess: true,
  },
};

// =============================================================================
// STRIPE CLIENT HELPERS
// =============================================================================

/**
 * Get Stripe API key from environment
 */
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return key;
}

/**
 * Get Stripe webhook secret from environment
 */
function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Lazily load Stripe to avoid import issues
 */
let StripeModule: typeof import("stripe") | null = null;

async function getStripe() {
  if (!StripeModule) {
    StripeModule = await import("stripe");
  }
  const Stripe = StripeModule.default;
  return new Stripe(getStripeSecretKey(), {
    apiVersion: "2025-01-27.acacia",
    typescript: true,
  });
}

// =============================================================================
// CHECKOUT SESSIONS
// =============================================================================

/**
 * Create a Stripe checkout session for a subscription or one-time payment
 *
 * @param userId - Convex user ID
 * @param priceId - Stripe Price ID for the product
 * @param tier - Product tier being purchased
 * @param successUrl - URL to redirect on successful payment
 * @param cancelUrl - URL to redirect on cancellation
 * @returns Checkout session URL
 */
export const createCheckoutSession = action({
  args: {
    userId: v.id("users"),
    priceId: v.string(),
    tier: v.string(),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.email) {
      throw new Error("User email is required for checkout");
    }

    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          convexUserId: args.userId,
        },
      });
      customerId = customer.id;

      // Store customer ID in user record
      await ctx.runMutation(internal.payments.stripe.updateUserStripeInfo, {
        userId: args.userId,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const sessionConfig: import("stripe").Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription", // Can be 'payment' for one-time
      payment_method_types: ["card"],
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      success_url:
        args.successUrl ||
        `${process.env.APP_URL || "http://localhost:3000"}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        args.cancelUrl ||
        `${process.env.APP_URL || "http://localhost:3000"}/checkout?canceled=true`,
      metadata: {
        convexUserId: args.userId,
        tier: args.tier,
        ...args.metadata,
      },
      subscription_data: {
        metadata: {
          convexUserId: args.userId,
          tier: args.tier,
        },
        trial_period_days: args.tier === ProductTier.PREMIUM ? 14 : undefined,
      },
      customer_update: {
        address: "auto",
        name: "auto",
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },
});

/**
 * Create checkout session for Premium tier
 */
export const createPremiumCheckout = action({
  args: {
    userId: v.id("users"),
    interval: v.union(v.literal("month"), v.literal("year")),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = PRODUCTS[ProductTier.PREMIUM];
    const priceId =
      args.interval === "month"
        ? product.prices.monthly
        : product.prices.yearly;

    if (!priceId) {
      throw new Error(
        `No ${args.interval}ly price configured for Premium tier`
      );
    }

    return ctx.runAction(internal.payments.stripe.createCheckoutSession, {
      userId: args.userId,
      priceId,
      tier: ProductTier.PREMIUM,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
    });
  },
});

/**
 * Create checkout session for Agency tier
 */
export const createAgencyCheckout = action({
  args: {
    userId: v.id("users"),
    interval: v.union(v.literal("month"), v.literal("year")),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = PRODUCTS[ProductTier.AGENCY];
    const priceId =
      args.interval === "month"
        ? product.prices.monthly
        : product.prices.yearly;

    if (!priceId) {
      throw new Error(
        `No ${args.interval}ly price configured for Agency tier`
      );
    }

    return ctx.runAction(internal.payments.stripe.createCheckoutSession, {
      userId: args.userId,
      priceId,
      tier: ProductTier.AGENCY,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
    });
  },
});

// =============================================================================
// CUSTOMER PORTAL
// =============================================================================

/**
 * Create a Stripe customer portal session for managing subscriptions
 *
 * @param userId - Convex user ID
 * @param returnUrl - URL to redirect after portal session
 * @returns Portal session URL
 */
export const createPortalSession = action({
  args: {
    userId: v.id("users"),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user?.stripeCustomerId) {
      throw new Error("User does not have a Stripe customer");
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url:
        args.returnUrl ||
        `${process.env.APP_URL || "http://localhost:3000"}/settings`,
    });

    return {
      portalUrl: session.url,
    };
  },
});

// =============================================================================
// WEBHOOK HANDLING
// =============================================================================

/**
 * Verify and process Stripe webhook events
 *
 * Handles:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription modified
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.paid: Payment succeeded
 * - invoice.payment_failed: Payment failed
 *
 * This endpoint should be registered in http.ts at /stripe/webhook
 */
export const handleWebhook = action({
  args: {
    signature: v.string(), // Stripe-Signature header
    payload: v.string(), // Raw request body
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();
    const webhookSecret = getStripeWebhookSecret();

    let event: import("stripe").Event;

    try {
      event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Invalid webhook signature");
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(ctx, event);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(ctx, event);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(ctx, event);
        break;
      }
      case "invoice.paid": {
        await handleInvoicePaid(ctx, event);
        break;
      }
      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(ctx, event);
        break;
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return { received: true, eventType: event.type };
  },
});

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(
  ctx: any,
  event: import("stripe").Event
) {
  const session = event.data.object as import("stripe").Checkout.Session;

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = session.subscription as string;
    const userId = session.metadata?.convexUserId;
    const tier = session.metadata?.tier as ProductTier;

    if (!userId) {
      console.error("No convexUserId in session metadata");
      return;
    }

    // Get subscription details from Stripe
    const stripe = await getStripe();
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    // Update user with subscription info
    await ctx.runMutation(
      internal.payments.stripe.syncSubscriptionStatus,
      {
        userId,
        subscriptionId,
        tier,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    );
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(
  ctx: any,
  event: import("stripe").Event
) {
  const subscription = event.data.object as import("stripe").Subscription;

  const userId = subscription.metadata?.convexUserId;
  const tier = subscription.metadata?.tier as ProductTier;

  if (!userId) {
    console.error("No convexUserId in subscription metadata");
    return;
  }

  await ctx.runMutation(internal.payments.stripe.syncSubscriptionStatus, {
    userId,
    subscriptionId: subscription.id,
    tier,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(
  ctx: any,
  event: import("stripe").Event
) {
  const subscription = event.data.object as import("stripe").Subscription;

  const userId = subscription.metadata?.convexUserId;

  if (!userId) {
    console.error("No convexUserId in subscription metadata");
    return;
  }

  // Downgrade to free tier
  await ctx.runMutation(internal.payments.stripe.downgradeToFree, {
    userId,
  });
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(ctx: any, event: import("stripe").Event) {
  const invoice = event.data.object as import("stripe").Invoice;

  if (invoice.subscription) {
    // Log successful payment for analytics
    console.log(
      `Invoice ${invoice.id} paid for subscription ${invoice.subscription}`
    );
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(
  ctx: any,
  event: import("stripe").Event
) {
  const invoice = event.data.object as import("stripe").Invoice;

  if (invoice.subscription && invoice.customer) {
    // Could send notification to user about payment failure
    console.error(
      `Invoice ${invoice.id} payment failed for customer ${invoice.customer}`
    );
  }
}

// =============================================================================
// MUTATIONS (Internal)
// =============================================================================

/**
 * Update user with Stripe customer ID
 */
export const updateUserStripeInfo = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

/**
 * Sync subscription status from Stripe to user record
 * Also updates unified subscription status
 */
export const syncSubscriptionStatus = mutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.string(),
    tier: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const isActive = ["active", "trialing"].includes(args.status);
    const tier = args.tier || ProductTier.FREE;
    const now = Date.now();

    await ctx.db.patch(args.userId, {
      stripeSubscriptionId: args.subscriptionId,
      subscriptionTier: tier as ProductTier,
      subscriptionStatus: args.status,
      subscriptionPeriodEnd: args.currentPeriodEnd,
      subscriptionCancelAtPeriodEnd: args.cancelAtPeriodEnd,
      subscriptionSource: "stripe",
      subscriptionSyncedAt: now,
      isPremium: isActive && tier !== ProductTier.FREE,
      premiumExpiresAt: args.currentPeriodEnd,
      premiumUpdatedAt: now,
    });
  },
});

/**
 * Downgrade user to free tier
 */
export const downgradeToFree = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.userId, {
      stripeSubscriptionId: undefined,
      subscriptionTier: ProductTier.FREE,
      subscriptionStatus: "canceled",
      subscriptionPeriodEnd: now,
      subscriptionCancelAtPeriodEnd: false,
      subscriptionSource: "none",
      subscriptionSyncedAt: now,
      isPremium: false,
      premiumExpiresAt: now,
      premiumUpdatedAt: now,
    });
  },
});

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get current subscription details for a user
 */
export const getSubscription = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const tier = (user.subscriptionTier as ProductTier) || ProductTier.FREE;
    const isActive =
      user.isPremium &&
      user.premiumExpiresAt &&
      user.premiumExpiresAt > Date.now();

    return {
      tier,
      status: user.subscriptionStatus,
      isActive,
      periodEnd: user.premiumExpiresAt,
      cancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      product: PRODUCTS[tier],
      entitlements: TIER_ENTITLEMENTS[tier],
    };
  },
});

/**
 * Get all available products and prices
 */
export const getProducts = query({
  args: {},
  handler: async () => {
    return {
      products: PRODUCTS,
      entitlements: TIER_ENTITLEMENTS,
    };
  },
});

/**
 * Check if user has access to a specific feature
 */
export const checkEntitlement = query({
  args: {
    userId: v.id("users"),
    feature: v.union(
      v.literal("maxProperties"),
      v.literal("maxCollaborativeRooms"),
      v.literal("aiQueriesPerMonth"),
      v.literal("voiceSearchEnabled"),
      v.literal("advancedAnalytics"),
      v.literal("prioritySupport"),
      v.literal("whiteLabel"),
      v.literal("apiAccess")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return false;
    }

    const tier = (user.subscriptionTier as ProductTier) || ProductTier.FREE;
    const entitlements = TIER_ENTITLEMENTS[tier];

    return entitlements[args.feature];
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get Stripe customer ID for a user, creating one if needed
 */
export const getOrCreateCustomerId = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Return existing customer ID
    if (user.stripeCustomerId) {
      return { customerId: user.stripeCustomerId };
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        convexUserId: args.userId,
      },
    });

    // Store customer ID
    await ctx.runMutation(internal.payments.stripe.updateUserStripeInfo, {
      userId: args.userId,
      stripeCustomerId: customer.id,
    });

    return { customerId: customer.id };
  },
});

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    // Cancel at period end
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return { success: true };
  },
});

/**
 * Resume subscription (if cancel_at_period_end is true)
 */
export const resumeSubscription = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    // Remove cancellation
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    return { success: true };
  },
});

/**
 * Update subscription to a different price/tier
 */
export const updateSubscription = action({
  args: {
    userId: v.id("users"),
    newPriceId: v.string(),
    newTier: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = await getStripe();

    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      userId: args.userId,
    });

    if (!user?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    // Get subscription
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    // Update subscription items
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: args.newPriceId,
        },
      ],
      metadata: {
        ...subscription.metadata,
        tier: args.newTier,
      },
    });

    return { success: true };
  },
});
