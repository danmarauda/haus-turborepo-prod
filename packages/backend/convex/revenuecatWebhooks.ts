/**
 * RevenueCat Webhook Handlers
 *
 * Convex actions that process RevenueCat webhook events
 * and sync subscription status to user records.
 *
 * @module convex/revenuecatWebhooks
 */

"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  isValidWebhookPayload,
  eventGrantsPremium,
  eventRevokesPremium,
  getEventDescription,
  type RevenueCatWebhookRequest,
} from "../lib/revenuecat";

// ============================================================================
// Webhook Handler Action
// ============================================================================

/**
 * Handle RevenueCat webhook event
 *
 * Processes incoming webhook events from RevenueCat and updates
 * user subscription status accordingly.
 *
 * Events handled:
 * - initial_purchase: New subscription purchase
 * - subscription_purchased: Subscription activated
 * - subscription_renewed: Subscription renewed
 * - subscription_cancelled: Subscription cancelled
 * - subscription_expired: Subscription expired
 * - uncancellation: Cancelled subscription reactivated
 * - product_change: User changed subscription tier
 *
 * @example
 * ```tsx
 * const result = await ctx.runAction(api.revenuecatWebhooks.handleWebhook, {
 *   payload: { event: { ... }, signature: "..." }
 * });
 * ```
 */
export const handleWebhook = internalAction({
  args: {
    payload: v.any(),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { payload, signature } = args;

    // Validate payload structure
    if (!isValidWebhookPayload(payload)) {
      console.error("[RevenueCat] Invalid webhook payload structure");
      return {
        success: false,
        error: "Invalid payload structure",
        processed: false,
      };
    }

    const event = payload.event;

    // Log incoming event
    console.log("[RevenueCat] Webhook received:", {
      eventType: event.event_type,
      appId: event.app_user_id,
      productId: event.product_id,
      eventId: event.id,
      description: getEventDescription(event),
    });

    // In production, verify signature here
    // const isValid = verifyWebhookSignature(
    //   JSON.stringify(payload),
    //   signature || "",
    //   process.env.REVENUECAT_API_KEY || ""
    // );
    // if (!isValid) {
    //   return { success: false, error: "Invalid signature", processed: false };
    // }

    // Determine premium status change
    const grantsPremium = eventGrantsPremium(event);
    const revokesPremium = eventRevokesPremium(event);

    // For events that don't directly change premium status,
    // we still want to record the event
    if (!grantsPremium && !revokesPremium) {
      console.log("[RevenueCat] Event does not affect premium status:", event.event_type);
      return {
        success: true,
        processed: false,
        message: "Event logged but does not affect premium status",
        eventType: event.event_type,
      };
    }

    // Calculate new premium status
    const isPremium = grantsPremium && !revokesPremium;

    // Calculate expiration date for subscriptions
    let latestExpiration: string | undefined;
    if (event.event_timestamp_ms) {
      // For most events, use the event timestamp
      // In production, you'd fetch full customer info from RevenueCat API
      latestExpiration = new Date(event.event_timestamp_ms).toISOString();
    }

    // Sync to user record (both legacy and unified)
    try {
      // First sync to legacy premium status
      const syncResult = await ctx.runMutation(internal.users.syncPremiumStatus, {
        revenueCatId: event.app_user_id,
        isPremium,
        latestExpiration,
        entitlements: {
          [event.entitlement_id || "default"]: {
            isActive: isPremium,
            productIdentifier: event.product_id,
            // In production, populate with full entitlement data
          },
        },
        subscriptions: {
          [event.product_id]: {
            productIdentifier: event.product_id,
            isActive: isPremium,
            store: event.store || "stripe",
            // In production, populate with full subscription data
          },
        },
        allPurchasedProducts: [event.product_id],
      });

      // Also sync to unified subscription system if user found
      if (syncResult.userId) {
        // Determine tier from entitlements
        let tier: "free" | "premium" | "agency" = isPremium ? "premium" : "free";
        if (event.entitlement_id?.includes("agency") || event.product_id?.includes("agency")) {
          tier = "agency";
        }

        await ctx.runMutation(
          internal.unified_subscriptions.syncSubscriptionStatusByUserId,
          {
            userId: syncResult.userId as Id<"users">,
            source: "revenuecat",
            tier,
            status: isPremium ? "active" : "inactive",
            isActive: isPremium,
            expiresAt: latestExpiration ? new Date(latestExpiration).getTime() : undefined,
            metadata: {
              revenueCatId: event.app_user_id,
              entitlements: {
                [event.entitlement_id || "default"]: {
                  isActive: isPremium,
                  productIdentifier: event.product_id,
                },
              },
              subscriptions: {
                [event.product_id]: {
                  productIdentifier: event.product_id,
                  isActive: isPremium,
                  store: event.store || "stripe",
                },
              },
            },
          }
        );
      }

      console.log("[RevenueCat] Premium status synced:", syncResult);

      return {
        success: true,
        processed: true,
        userId: syncResult.userId,
        eventType: event.event_type,
        grantsPremium,
        revokesPremium,
        isPremium,
      };
    } catch (error) {
      console.error("[RevenueCat] Failed to sync premium status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        processed: false,
      };
    }
  },
});

// ============================================================================
// Types
// ============================================================================

interface WebhookResult {
  success: boolean;
  error?: string;
  processed: boolean;
  userId?: string;
  eventType?: string;
  grantsPremium?: boolean;
  revokesPremium?: boolean;
  isPremium?: boolean;
  message?: string;
}
