import { type NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";
import { auth } from "@/lib/auth";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/error-handler";

/**
 * GET /api/market/providers
 * List providers with category, verification, and featured filters
 */
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimitResult = await checkRateLimit(`market:${ip}`, apiRateLimit);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: Object.fromEntries(Object.entries(rateLimitResult.headers).filter(([,v]) => v !== undefined)) as Record<string, string>
        }
      );
    }

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const category = searchParams.get("category") || undefined;
    const verificationLevel = searchParams.get("verification") || undefined;
    const featured = searchParams.get("featured") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const country = searchParams.get("country") || undefined;

    // Call Convex query
    const providers = await fetchQuery(api.providers.list, {
      category,
      verificationLevel,
      featured,
      limit,
    });

    // Filter by country if specified
    const filteredProviders = country
      ? providers.filter((p: { country?: string }) => p.country === country)
      : providers;

    // Calculate stats
    const stats = {
      total: filteredProviders.length,
      featured: filteredProviders.filter((p: { featured?: boolean }) => p.featured).length,
      verified: filteredProviders.filter((p: { verificationLevel?: string }) => p.verificationLevel === "verified").length,
      avgRating:
        filteredProviders.length > 0
          ? filteredProviders.reduce((sum: number, p: { rating?: number }) => sum + (p.rating || 0), 0) /
            filteredProviders.length
          : 0,
    };

    const processingTime = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {
      "X-Request-ID": requestId,
      "X-Processing-Time": processingTime.toString(),
    };
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      if (value !== undefined) responseHeaders[key] = value;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          providers: filteredProviders,
          count: filteredProviders.length,
          stats,
          filters: {
            category,
            verificationLevel,
            featured,
            country,
            limit,
          },
        },
        meta: {
          requestId,
          processingTime,
          timestamp: new Date().toISOString(),
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("[Market API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}
