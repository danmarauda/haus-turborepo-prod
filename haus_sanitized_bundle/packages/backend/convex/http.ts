/**
 * HTTP Router
 *
 * Integrates:
 * - Convex Auth (authentication)
 * - Polar (subscriptions)
 * - AI Chat Endpoints (migrated from tRPC/Hono)
 */

import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { auth } from "./auth";
import { polar } from "./subscriptions";

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
// AI Chat Routes (Migrated from tRPC/Hono)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/ai/chat
 * General chat endpoint - streaming text generation
 * Converted from: ai.chat tRPC procedure
 */
http.route({
  path: "/api/ai/chat",
  method: "POST",
  handler: async (ctx, request) => {
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
  },
});

/**
 * POST /api/ai/chat/stream
 * Streaming chat endpoint
 * Note: In Convex, true streaming requires special handling.
 * This returns the full response for compatibility.
 */
http.route({
  path: "/api/ai/chat/stream",
  method: "POST",
  handler: async (ctx, request) => {
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
  },
});

/**
 * POST /api/ai/analyze-property
 * Analyze property image with structured output
 * Converted from: ai.analyzeProperty tRPC procedure
 */
http.route({
  path: "/api/ai/analyze-property",
  method: "POST",
  handler: async (ctx, request) => {
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
  },
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
// Health Check
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
http.route({
  path: "/api/health",
  method: "GET",
  handler: async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: Date.now() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  },
});

export default http;
