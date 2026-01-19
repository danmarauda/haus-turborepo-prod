import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.exp(retryCount) * 50,
  },
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"), // 15 requests per minute for general API
  analytics: true,
  prefix: "haus:api",
})

export const voiceRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, "1 m"), // 8 voice requests per minute (more expensive)
  analytics: true,
  prefix: "haus:voice",
})

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(25, "1 m"), // 25 search requests per minute
  analytics: true,
  prefix: "haus:search",
})

export const burstProtection = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, "1 h"), // 50 requests per hour hard limit
  analytics: true,
  prefix: "haus:burst",
})

export const ipBlockList = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(1, "24 h"), // Block for 24 hours after violations
  analytics: true,
  prefix: "haus:blocked",
})

export async function checkRateLimit(identifier: string, rateLimit: Ratelimit) {
  try {
    // Check if IP is blocked
    const blockCheck = await ipBlockList.limit(`blocked:${identifier}`)
    if (!blockCheck.success) {
      return {
        success: false,
        limit: 0,
        reset: blockCheck.reset,
        remaining: 0,
        blocked: true,
        headers: {
          "X-RateLimit-Limit": "0",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(blockCheck.reset).toISOString(),
          "X-RateLimit-Blocked": "true",
        },
      }
    }

    // Check burst protection
    const burstCheck = await burstProtection.limit(`burst:${identifier}`)
    if (!burstCheck.success) {
      // Add to block list for repeated violations
      await ipBlockList.limit(`blocked:${identifier}`)

      return {
        success: false,
        limit: burstCheck.limit,
        reset: burstCheck.reset,
        remaining: burstCheck.remaining,
        burst: true,
        headers: {
          "X-RateLimit-Limit": burstCheck.limit.toString(),
          "X-RateLimit-Remaining": burstCheck.remaining.toString(),
          "X-RateLimit-Reset": new Date(burstCheck.reset).toISOString(),
          "X-RateLimit-Burst": "true",
        },
      }
    }

    // Check normal rate limit
    const { success, limit, reset, remaining } = await rateLimit.limit(identifier)

    return {
      success,
      limit,
      reset,
      remaining,
      blocked: false,
      burst: false,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      },
    }
  } catch (error) {
    console.error("[SECURITY] Rate limit check failed:", error)
    // Fail open but log the error
    return {
      success: true,
      limit: 0,
      reset: Date.now() + 60000,
      remaining: 0,
      error: true,
      headers: {
        "X-RateLimit-Error": "true",
      },
    }
  }
}

export async function blockIP(ip: string, reason: string, duration: number = 24 * 60 * 60 * 1000) {
  try {
    await redis.setex(`haus:manual_block:${ip}`, Math.floor(duration / 1000), reason)
    console.warn(`[SECURITY] IP ${ip} manually blocked for ${duration}ms. Reason: ${reason}`)
    return true
  } catch (error) {
    console.error("[SECURITY] Failed to block IP:", error)
    return false
  }
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await redis.get(`haus:manual_block:${ip}`)
    return blocked !== null
  } catch (error) {
    console.error("[SECURITY] Failed to check IP block status:", error)
    return false
  }
}

export async function rateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

  return await checkRateLimit(ip, voiceRateLimit)
}
