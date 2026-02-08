/**
 * RevenueCat Webhook Handler
 *
 * HTTP webhook handler for RevenueCat subscription events.
 * Can be used with Hono, Next.js route handlers, or other HTTP frameworks.
 *
 * Usage with Hono:
 *   import { handleRevenueCatWebhook } from "./lib/revenuecat-webhook";
 *   app.post("/api/webhooks/revenuecat", handleRevenueCatWebhook);
 *
 * @see https://docs.revenuecat.com/reference/webhooks
 */

import type { Context } from "hono";
import { z } from "zod";
import {
  RevenueCatWebhookRequestSchema,
  eventGrantsPremium,
  eventRevokesPremium,
  getEventDescription,
  PremiumSyncPayloadSchema,
  type RevenueCatWebhookRequest,
  type PremiumSyncPayload,
} from "./revenuecat";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Webhook Handler Options
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Options for webhook handler
 */
export interface RevenueCatWebhookHandlerOptions {
  /** RevenueCat API key for signature verification */
  apiKey: string;
  /** Function to sync premium status to Convex */
  syncPremiumStatus: (payload: PremiumSyncPayload) => Promise<{ success: boolean; userId?: string; error?: string }>;
  /** Optional: Log webhook events */
  onEvent?: (event: RevenueCatWebhookRequest) => void | Promise<void>;
  /** Optional: Handle errors */
  onError?: (error: Error, event: RevenueCatWebhookRequest) => void | Promise<void>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Webhook Handler Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Process RevenueCat webhook event
 *
 * This is the core logic that can be adapted to any HTTP framework.
 */
export async function processRevenueCatWebhook(
  requestBody: unknown,
  signature: string | undefined,
  options: RevenueCatWebhookHandlerOptions
): Promise<{ status: number; body: string }> {
  try {
    // 1. Parse and validate request body
    let request: RevenueCatWebhookRequest;
    try {
      request = RevenueCatWebhookRequestSchema.parse(requestBody);
    } catch (error) {
      console.error("[RevenueCat] Invalid webhook payload:", error);
      return {
        status: 400,
        body: JSON.stringify({ error: "Invalid webhook payload" }),
      };
    }

    const { event } = request;

    // 2. Verify signature (if provided)
    if (signature && options.apiKey) {
      // Note: RevenueCat uses HMAC-SHA256 for webhook signatures
      // Implement verification using standardwebhooks or crypto module
      const isValid = verifyRevenueCatSignature(
        JSON.stringify(requestBody),
        signature,
        options.apiKey
      );
      if (!isValid) {
        console.warn("[RevenueCat] Invalid webhook signature");
        return {
          status: 401,
          body: JSON.stringify({ error: "Invalid signature" }),
        };
      }
    }

    // 3. Log event
    console.log(`[RevenueCat] ${event.event_type}: ${getEventDescription(event)}`, {
      appUserId: event.app_user_id,
      productId: event.product_id,
      entitlementId: event.entitlement_id,
    });

    await options.onEvent?.(request);

    // 4. Determine premium status change
    const grantsPremium = eventGrantsPremium(event);
    const revokesPremium = eventRevokesPremium(event);

    // 5. Sync to Convex if premium status changes
    if (grantsPremium || revokesPremium) {
      const syncPayload: PremiumSyncPayload = {
        revenueCatId: event.app_user_id,
        isPremium: grantsPremium,
        latestExpiration: event.event_type === "subscription_expired"
          ? new Date(event.event_timestamp_ms).toISOString()
          : null,
        entitlements: { [event.entitlement_id || "default"]: { isActive: grantsPremium } },
        subscriptions: {
          [event.product_id]: {
            isActive: grantsPremium,
            productIdentifier: event.product_id,
            store: event.store as any || "promotional",
            willRenew: event.event_type === "subscription_renewed",
            periodType: event.period_type || "normal",
          },
        },
        allPurchasedProducts: [event.product_id],
      };

      const syncResult = await options.syncPremiumStatus(syncPayload);

      if (!syncResult.success) {
        console.error("[RevenueCat] Failed to sync premium status:", syncResult.error);
        await options.onError?.(new Error(syncResult.error), request);
        // Don't fail the webhook - RevenueCat will retry
      }
    }

    // 6. Return success
    return {
      status: 200,
      body: JSON.stringify({ success: true, eventId: event.id }),
    };

  } catch (error) {
    console.error("[RevenueCat] Webhook processing error:", error);
    await options.onError?.(error as Error, requestBody as RevenueCatWebhookRequest);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

/**
 * Verify RevenueCat webhook signature
 *
 * RevenueCat signs webhooks with HMAC-SHA256 using your API key.
 */
function verifyRevenueCatSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hono Handler (for use with backend Hono server)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create a Hono route handler for RevenueCat webhooks
 *
 * Usage:
 *   import { createRevenueCatWebhookHandler } from "./lib/revenuecat-webhook";
 *   const handler = createRevenueCatWebhookHandler({
 *     apiKey: process.env.REVENUECAT_API_KEY!,
 *     syncPremiumStatus: async (payload) => {
 *       // Call Convex mutation
 *       const result = await convex.mutation(api.users.syncPremiumStatus, payload);
 *       return result;
 *     },
 *   });
 *   app.post("/api/webhooks/revenuecat", handler);
 */
export function createRevenueCatWebhookHandler(
  options: RevenueCatWebhookHandlerOptions
) {
  return async (c: Context) => {
    try {
      const signature = c.req.header("x-revenuecat-signature");
      const requestBody = await c.req.json();

      const result = await processRevenueCatWebhook(requestBody, signature, options);

      return c.text(result.body, result.status);
    } catch (error) {
      console.error("[RevenueCat] Handler error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Next.js Route Handler (for Next.js App Router)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Next.js App Router route handler
 *
 * Usage in app/api/webhooks/revenuecat/route.ts:
 *
 *   import { handleRevenueCatWebhookNextjs } from "@v1/backend/lib/revenuecat-webhook";
 *   import { convex } from "@v1/backend/convex/server";
 *   import { api } from "@v1/backend/convex/_generated";
 *
 *   export const POST = handleRevenueCatWebhookNextjs({
 *     apiKey: process.env.REVENUECAT_API_KEY!,
 *     syncPremiumStatus: async (payload) => {
 *       return await convex.mutation(api.users.syncPremiumStatus, payload);
 *     },
 *   });
 */
export function handleRevenueCatWebhookNextjs(
  options: RevenueCatWebhookHandlerOptions
) {
  return async (request: Request) => {
    try {
      const signature = request.headers.get("x-revenuecat-signature") || undefined;
      const requestBody = await request.json();

      const result = await processRevenueCatWebhook(requestBody, signature, options);

      return new Response(result.body, {
        status: result.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[RevenueCat] Handler error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if webhook is from test environment
 */
export function isTestWebhook(event: RevenueCatWebhookRequest): boolean {
  return event.event.event_type === "test" || event.event.environment === "sandbox";
}

/**
 * Check if webhook is from production environment
 */
export function isProductionWebhook(event: RevenueCatWebhookRequest): boolean {
  return event.event.environment === "production";
}

/**
 * Get the app user ID from a webhook event
 */
export function getAppUserId(event: RevenueCatWebhookRequest): string {
  return event.event.app_user_id;
}

/**
 * Get the product ID from a webhook event
 */
export function getProductId(event: RevenueCatWebhookRequest): string {
  return event.event.product_id;
}

/**
 * Get the entitlement ID from a webhook event (if any)
 */
export function getEntitlementId(event: RevenueCatWebhookRequest): string | undefined {
  return event.event.entitlement_id ||
         event.event.new_entitlement_id ||
         event.event.old_entitlement_id;
}
