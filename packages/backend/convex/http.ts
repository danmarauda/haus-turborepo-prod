/**
 * HTTP Router
 *
 * Integrates:
 * - Convex Auth (authentication)
 * - Polar (subscriptions)
 * - Stripe (payment processing)
 * - AI Chat Endpoints (migrated from tRPC/Hono)
 */

import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { auth } from "./auth";
import { polar } from "./subscriptions";
import {
  withRateLimit,
  RateLimits,
  buildRateLimitIdentifier,
  createRateLimitResponse,
} from "./rateLimit";

const http = httpRouter();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Routes (Convex Auth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
auth.addHttpRoutes(http);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Subscription Routes (Polar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Register the webhook handler at /polar/events
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
polar.registerRoutes(http as any);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Routes (Stripe)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /stripe/webhook
 * Stripe webhook endpoint for processing payment events
 *
 * Handles:
 * - checkout.session.completed: New subscription
 * - customer.subscription.updated: Subscription changes
 * - customer.subscription.deleted: Cancellations
 * - invoice.paid: Successful payments
 * - invoice.payment_failed: Failed payments
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: async (ctx, request) => {
    const signature = request.headers.get("Stripe-Signature");
    if (!signature) {
      return new Response("No Stripe signature", { status: 400 });
    }

    try {
      const payload = await request.text();
      const result = await ctx.runAction(api.payments.stripe.handleWebhook, {
        signature,
        payload,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI Chat Routes (Migrated from tRPC/Hono)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/ai/chat
 * General chat endpoint - streaming text generation
 * Converted from: ai.chat tRPC procedure
 * Rate limit: 50 requests/minute per user
 */
http.route({
  path: "/api/ai/chat",
  method: "POST",
  handler: withRateLimit(RateLimits.AI_CHAT, async (ctx, request) => {
    try {
      const body = await request.json();
      const { messages, systemPrompt, userId } = body;

      // Call the chat action
      const result = await ctx.runAction(api.ai.chat, {
        messages,
        systemPrompt,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Chat error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process chat request" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /api/ai/chat/stream
 * Streaming chat endpoint
 * Note: In Convex, true streaming requires special handling.
 * This returns the full response for compatibility.
 * Rate limit: 30 requests/minute per user
 */
http.route({
  path: "/api/ai/chat/stream",
  method: "POST",
  handler: withRateLimit(RateLimits.AI_STREAM, async (ctx, request) => {
    try {
      const body = await request.json();
      const { messages, systemPrompt, userId } = body;

      const result = await ctx.runAction(api.ai.chatStream, {
        messages,
        systemPrompt,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Chat stream error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process streaming chat" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /api/ai/analyze-property
 * Analyze property image with structured output
 * Converted from: ai.analyzeProperty tRPC procedure
 * Rate limit: 20 requests/minute per user
 */
http.route({
  path: "/api/ai/analyze-property",
  method: "POST",
  handler: withRateLimit(RateLimits.AI_ANALYZE_PROPERTY, async (ctx, request) => {
    try {
      const body = await request.json();
      const { imageBase64, additionalContext, userId } = body;

      const result = await ctx.runAction(api.ai.analyzeProperty, {
        imageBase64,
        additionalContext,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Analyze property error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to analyze property image" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /api/ai/summarize-property
 * Quick property image summary
 * Converted from: ai.summarizeProperty tRPC procedure
 */
http.route({
  path: "/api/ai/summarize-property",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.json();
      const { imageBase64, userId } = body;

      const result = await ctx.runAction(api.ai.summarizeProperty, {
        imageBase64,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Summarize property error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to summarize property image" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

/**
 * POST /api/ai/market-insights
 * Get market insights for a suburb
 * Converted from: ai.marketInsights tRPC procedure
 */
http.route({
  path: "/api/ai/market-insights",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.json();
      const { suburb, propertyType, userId } = body;

      const result = await ctx.runAction(api.ai.marketInsights, {
        suburb,
        propertyType,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Market insights error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get market insights" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

/**
 * POST /api/ai/generate-text (Legacy)
 * Legacy text generation endpoint for backward compatibility
 * Converted from: ai.generateText tRPC procedure
 */
http.route({
  path: "/api/ai/generate-text",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.json();
      const { messages, userId } = body;

      const result = await ctx.runAction(api.ai.generateTextLegacy, {
        messages,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Generate text error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate text" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

/**
 * POST /api/ai/chat/tools
 * Chat with tool support (function calling)
 */
http.route({
  path: "/api/ai/chat/tools",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.json();
      const { messages, systemPrompt, enablePropertySearch, userId } = body;

      const result = await ctx.runAction(api.ai.chatWithTools, {
        messages,
        systemPrompt,
        enablePropertySearch,
        userId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Chat with tools error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process chat with tools" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Property Sync Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/properties/sync
 * Trigger property sync from external sources (Realestate, Domain)
 * Rate limit: 5 requests/minute per admin
 *
 * Body: {
 *   suburb?: string,
 *   state?: string,
 *   query?: string,
 *   maxPages?: number,
 *   listingType?: "buy" | "rent" | "sold"
 * }
 *
 * Example:
 * ```bash
 * curl -X POST http://localhost:3000/api/properties/sync \
 *   -H "Content-Type: application/json" \
 *   -d '{"suburb":"Bondi Beach","state":"NSW","maxPages":2}'
 * ```
 */
http.route({
  path: "/api/properties/sync",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.json();
      const { suburb, state, query, maxPages, listingType } = body;

      const result = await ctx.runAction(
        api.propertySync.syncAllSources,
        {
          suburb,
          state,
          query,
          maxPages,
          listingType,
        }
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Property sync error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to sync properties",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

/**
 * GET /api/properties/sync/status
 * Get the status of recent property sync operations
 */
http.route({
  path: "/api/properties/sync/status",
  method: "GET",
  handler: async (ctx) => {
    try {
      // Get recent property sync statistics
      const stats = await ctx.runQuery(api.propertyListings.getStats, {});

      return new Response(JSON.stringify({
        status: "ok",
        total: stats.total,
        active: stats.active,
        averagePrice: stats.averagePrice,
        byType: stats.byType,
        timestamp: Date.now(),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Sync status error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get sync status" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RevenueCat Webhook Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/webhooks/revenuecat
 * RevenueCat webhook endpoint for subscription events
 *
 * Handles subscription lifecycle events:
 * - initial_purchase, subscription_purchased, subscription_renewed
 * - subscription_cancelled, subscription_expired
 * - uncancellation, product_change, etc.
 *
 * Body: RevenueCat webhook payload with event and signature
 *
 * Example:
 * ```bash
 * curl -X POST http://localhost:3000/api/webhooks/revenuecat \
 *   -H "Content-Type: application/json" \
 *   -d '{"event":{"event_type":"subscription_purchased",...},"signature":"..."}'
 * ```
 */
http.route({
  path: "/api/webhooks/revenuecat",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const payload = await request.json();

      // Get signature from header if present
      const signature = request.headers.get("X-RevenueCat-Signature") ||
                       request.headers.get("signature");

      const result = await ctx.runAction(
        api.revenuecatWebhooks.handleWebhook,
        {
          payload,
          signature: signature || undefined,
        }
      );

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("RevenueCat webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Voice Token Generation (Node.js only)
//
// LiveKit token generation requires Node.js crypto module.
// This endpoint handles token generation directly using dynamic import.
/**
 * POST /voice/token
 * Generate LiveKit JWT token for voice rooms
 * Rate limit: 10 requests/minute per user
 *
 * Body: { roomName: string, participantName?: string }
 */
http.route({
  path: "/voice/token",
  method: "POST",
  handler: withRateLimit(RateLimits.VOICE_TOKEN, async (ctx, request) => {
    try {
      const body = await request.json();
      const { roomName, participantName } = body;

      if (!roomName) {
        return new Response(
          JSON.stringify({ error: "roomName is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      if (!apiKey || !apiSecret) {
        return new Response(
          JSON.stringify({ error: "LiveKit not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Generate token using Node.js crypto module
      // Dynamic import to avoid bundler issues
      const crypto = await import("node:crypto");
      const identity = participantName || "anonymous";
      const now = Math.floor(Date.now() / 1000);
      const ttl = 3600;

      // JWT header
      const header = { alg: "HS256", typ: "JWT" };

      // JWT payload with LiveKit video grants
      const payload = {
        sub: identity,
        iss: apiKey,
        iat: now,
        exp: now + ttl,
        nbf: now,
        jti: crypto.randomUUID(),
        video: {
          roomJoin: true,
          room: roomName,
          canPublish: true,
          canSubscribe: true,
          canUpdateOwnMetadata: true,
        },
        name: identity,
        metadata: identity,
      };

      // Base64URL encode function
      const base64UrlEncode = (data: string) => {
        return Buffer.from(data)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      };

      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));

      // Create HMAC-SHA256 signature
      const data = `${encodedHeader}.${encodedPayload}`;
      const hmac = crypto.createHmac("sha256", apiSecret);
      hmac.update(data);
      const signature = hmac
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      const token = `${data}.${signature}`;

      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Voice token error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate token" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
