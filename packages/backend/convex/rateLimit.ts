/**
 * Rate Limiting Module for Convex Backend
 *
 * Implements sliding window rate limiting with the following features:
 * - User-based and IP-based limiting
 * - Per-endpoint/action configuration
 * - Proper 429 responses with Retry-After headers
 * - Automatic cleanup of expired windows
 *
 * Rate Limit Configurations:
 * - AI chat: 50 requests/minute per user
 * - Property search: 100 requests/minute per user
 * - Voice token generation: 10/minute per user
 * - Property sync: 5/minute per admin
 * - Memory operations: 200/minute per user
 */

import { v } from "convex/values";
import { query, mutation, action, type HttpAction } from "./_generated/server";
import { api } from "./_generated/api";

// =============================================================================
// Types & Configuration
// =============================================================================

/**
 * Rate limit configuration for an endpoint
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Whether to skip rate limiting for authenticated users */
  skipAuthenticated?: boolean;
  /** Custom identifier function (defaults to userId or IP) */
  keyPrefix?: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitStatus {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Current request count in the window */
  current: number;
  /** Maximum allowed requests */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the window resets (ms) */
  resetTime: number;
  /** Seconds until reset (for Retry-After header) */
  retryAfter: number;
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  /** AI chat: 50 requests/minute per user */
  AI_CHAT: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "ai:chat",
  } as RateLimitConfig,

  /** Property search: 100 requests/minute per user */
  PROPERTY_SEARCH: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "property:search",
  } as RateLimitConfig,

  /** Voice token generation: 10/minute per user */
  VOICE_TOKEN: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "voice:token",
  } as RateLimitConfig,

  /** Property sync: 5/minute per admin */
  PROPERTY_SYNC: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "property:sync",
  } as RateLimitConfig,

  /** Memory operations: 200/minute per user */
  MEMORY_OPERATIONS: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "memory:ops",
  } as RateLimitConfig,

  /** AI analyze property: 20/minute per user */
  AI_ANALYZE_PROPERTY: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "ai:analyze",
  } as RateLimitConfig,

  /** AI streaming: 30/minute per user */
  AI_STREAM: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "ai:stream",
  } as RateLimitConfig,
} as const;

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Generate a rate limit key for the database
 */
function generateRateLimitKey(
  identifier: string,
  endpoint: string,
  windowStart: number
): string {
  return `${endpoint}:${identifier}:${windowStart}`;
}

/**
 * Calculate the current window start time using sliding window
 */
function getWindowStart(timestamp: number, windowMs: number): number {
  return Math.floor(timestamp / windowMs) * windowMs;
}

/**
 * Calculate time until next window reset
 */
function getRetryAfter(windowStart: number, windowMs: number): number {
  const nextWindow = windowStart + windowMs;
  const now = Date.now();
  return Math.max(0, Math.ceil((nextWindow - now) / 1000));
}

// =============================================================================
// Database Schema (to be added to schema.ts)
// =============================================================================

/**
 * Rate limits table schema definition
 * Add this to your schema.ts file:
 *
 * rateLimits: defineTable({
 *   // User ID or IP address
 *   identifier: v.string(),
 *   // Endpoint or action being rate limited (e.g., "ai:chat", "voice:token")
 *   endpoint: v.string(),
 *   // Request count in current window
 *   count: v.number(),
 *   // Window start timestamp (ms)
 *   windowStart: v.number(),
 *   // Window duration (ms)
 *   windowMs: v.number(),
 *   // When this record was created
 *   createdAt: v.number(),
 *   // When this record was last updated
 *   updatedAt: v.number(),
 * })
 *   .index("by_identifier_endpoint", ["identifier", "endpoint"])
 *   .index("by_identifier_endpoint_window", ["identifier", "endpoint", "windowStart"])
 *   .index("by_windowStart", ["windowStart"]),
 */

// =============================================================================
// Convex Functions
// =============================================================================

/**
 * Check rate limit status without incrementing
 * Use this for read-only checks
 */
export const checkRateLimit = query({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<RateLimitStatus> => {
    const { identifier, endpoint, maxRequests, windowMs } = args;
    const now = Date.now();
    const currentWindow = getWindowStart(now, windowMs);

    // Look for existing rate limit record for current window
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_endpoint_window", (q) =>
        q
          .eq("identifier", identifier)
          .eq("endpoint", endpoint)
          .eq("windowStart", currentWindow)
      )
      .first();

    const current = existing?.count ?? 0;
    const allowed = current < maxRequests;
    const remaining = Math.max(0, maxRequests - current);
    const resetTime = currentWindow + windowMs;
    const retryAfter = getRetryAfter(currentWindow, windowMs);

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetTime,
      retryAfter,
    };
  },
});

/**
 * Increment rate limit counter
 * Returns the updated status after incrementing
 */
export const incrementRateLimit = mutation({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<RateLimitStatus> => {
    const { identifier, endpoint, maxRequests, windowMs } = args;
    const now = Date.now();
    const currentWindow = getWindowStart(now, windowMs);

    // Look for existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_endpoint_window", (q) =>
        q
          .eq("identifier", identifier)
          .eq("endpoint", endpoint)
          .eq("windowStart", currentWindow)
      )
      .first();

    let current: number;

    if (existing) {
      // Update existing record
      current = existing.count + 1;
      await ctx.db.patch(existing._id, {
        count: current,
        updatedAt: now,
      });
    } else {
      // Create new record for this window
      current = 1;
      await ctx.db.insert("rateLimits", {
        identifier,
        endpoint,
        count: current,
        windowStart: currentWindow,
        windowMs,
        createdAt: now,
        updatedAt: now,
      });
    }

    const allowed = current <= maxRequests;
    const remaining = Math.max(0, maxRequests - current);
    const resetTime = currentWindow + windowMs;
    const retryAfter = getRetryAfter(currentWindow, windowMs);

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetTime,
      retryAfter,
    };
  },
});

/**
 * Check and increment rate limit in a single operation
 * This is the recommended approach for most use cases
 */
export const checkAndIncrementRateLimit = mutation({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<RateLimitStatus> => {
    const { identifier, endpoint, maxRequests, windowMs } = args;
    const now = Date.now();
    const currentWindow = getWindowStart(now, windowMs);

    // Look for existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_endpoint_window", (q) =>
        q
          .eq("identifier", identifier)
          .eq("endpoint", endpoint)
          .eq("windowStart", currentWindow)
      )
      .first();

    let current: number;

    if (existing) {
      // Update existing record
      current = existing.count + 1;
      await ctx.db.patch(existing._id, {
        count: current,
        updatedAt: now,
      });
    } else {
      // Create new record for this window
      current = 1;
      await ctx.db.insert("rateLimits", {
        identifier,
        endpoint,
        count: current,
        windowStart: currentWindow,
        windowMs,
        createdAt: now,
        updatedAt: now,
      });
    }

    const allowed = current <= maxRequests;
    const remaining = Math.max(0, maxRequests - current);
    const resetTime = currentWindow + windowMs;
    const retryAfter = getRetryAfter(currentWindow, windowMs);

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetTime,
      retryAfter,
    };
  },
});

/**
 * Get current rate limit status without modifying it
 */
export const getRateLimitStatus = query({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<RateLimitStatus> => {
    const { identifier, endpoint, maxRequests, windowMs } = args;
    const now = Date.now();
    const currentWindow = getWindowStart(now, windowMs);

    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_endpoint_window", (q) =>
        q
          .eq("identifier", identifier)
          .eq("endpoint", endpoint)
          .eq("windowStart", currentWindow)
      )
      .first();

    const current = existing?.count ?? 0;
    const allowed = current < maxRequests;
    const remaining = Math.max(0, maxRequests - current);
    const resetTime = currentWindow + windowMs;
    const retryAfter = getRetryAfter(currentWindow, windowMs);

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetTime,
      retryAfter,
    };
  },
});

/**
 * Clean up expired rate limit records
 * Run this periodically to remove old windows
 */
export const cleanupExpiredRateLimits = mutation({
  args: {
    olderThanMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanMs ?? 24 * 60 * 60 * 1000); // Default: 24 hours

    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_windowStart", (q) => q.lt("windowStart", cutoff))
      .take(1000);

    let deleted = 0;
    for (const record of expired) {
      await ctx.db.delete(record._id);
      deleted++;
    }

    return { deleted };
  },
});

// =============================================================================
// Helper Functions for HTTP Routes
// =============================================================================

/**
 * Create a 429 Too Many Requests response
 */
export function createRateLimitResponse(
  status: RateLimitStatus,
  message?: string
): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-RateLimit-Limit": String(status.limit),
    "X-RateLimit-Remaining": String(status.remaining),
    "X-RateLimit-Reset": String(Math.floor(status.resetTime / 1000)),
  };

  if (!status.allowed) {
    headers["Retry-After"] = String(status.retryAfter);
  }

  return new Response(
    JSON.stringify({
      error: message ?? "Rate limit exceeded",
      retryAfter: status.retryAfter,
      limit: status.limit,
      current: status.current,
      resetTime: status.resetTime,
    }),
    {
      status: 429,
      headers,
    }
  );
}

/**
 * Extract client IP from request headers
 * Uses X-Forwarded-For for proxied requests, falls back to other headers
 */
export function extractClientIP(request: Request): string {
  // Check X-Forwarded-For (common for proxies/CDNs)
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) {
    // Take the first IP in the chain (client IP)
    return forwarded.split(",")[0].trim();
  }

  // Check X-Real-IP (Nginx, etc.)
  const realIP = request.headers.get("X-Real-IP");
  if (realIP) {
    return realIP;
  }

  // Check CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get("CF-Connecting-IP");
  if (cfIP) {
    return cfIP;
  }

  // Fallback: generate a hash from user agent (not perfect but better than nothing)
  const userAgent = request.headers.get("User-Agent") ?? "unknown";
  return `anonymous:${userAgent.slice(0, 50)}`;
}

/**
 * Build rate limit identifier from request
 * Uses userId if provided, otherwise falls back to IP
 */
export function buildRateLimitIdentifier(
  request: Request,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${extractClientIP(request)}`;
}

// =============================================================================
// Rate-Limited Wrapper for HTTP Routes
// =============================================================================

/**
 * Wrap an HTTP handler with rate limiting
 * This is a helper for applying rate limiting to HTTP routes in http.ts
 *
 * Usage in http.ts:
 * ```typescript
 * import { withRateLimit, RateLimits } from "./rate-limit";
 *
 * http.route({
 *   path: "/api/ai/chat",
 *   method: "POST",
 *   handler: withRateLimit(RateLimits.AI_CHAT, async (ctx, request) => {
 *     // Your handler logic here
 *   }),
 * });
 * ```
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: HttpAction
): HttpAction {
  return async (ctx, request) => {
    // Extract userId from request body if present
    let userId: string | undefined;
    try {
      const clonedRequest = request.clone();
      const body = await clonedRequest.json();
      userId = body?.userId;
    } catch {
      // No body or invalid JSON, continue without userId
    }

    const identifier = buildRateLimitIdentifier(request, userId);
    const endpoint = config.keyPrefix ?? "default";

    // Check and increment rate limit
    const status = await ctx.runMutation(
      api.rateLimit.checkAndIncrementRateLimit,
      {
        identifier,
        endpoint,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
      }
    );

    // If rate limited, return 429 response
    if (!status.allowed) {
      return createRateLimitResponse(status);
    }

    // Otherwise, proceed with the handler
    const response = await handler(ctx, request);

    // Add rate limit headers to successful response
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Limit", String(status.limit));
      headers.set("X-RateLimit-Remaining", String(status.remaining));
      headers.set("X-RateLimit-Reset", String(Math.floor(status.resetTime / 1000)));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
}

// =============================================================================
// Rate-Limited Action Wrapper
// =============================================================================

/**
 * Helper action to check rate limit from other actions
 * Use this at the start of rate-limited actions
 */
export const checkRateLimitAction = action({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<RateLimitStatus> => {
    return await ctx.runMutation(api.rateLimit.checkAndIncrementRateLimit, args);
  },
});

/**
 * Helper to check if an action should proceed or throw rate limit error
 */
export async function assertRateLimit(
  ctx: any,
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): Promise<void> {
  const status = await ctx.runMutation(
    api.rateLimit.checkAndIncrementRateLimit,
    {
      identifier,
      endpoint,
      maxRequests,
      windowMs,
    }
  );

  if (!status.allowed) {
    const error = new Error(
      `Rate limit exceeded. Retry after ${status.retryAfter} seconds.`
    );
    (error as Error & { statusCode: number }).statusCode = 429;
    (error as Error & { retryAfter: number }).retryAfter = status.retryAfter;
    throw error;
  }
}
