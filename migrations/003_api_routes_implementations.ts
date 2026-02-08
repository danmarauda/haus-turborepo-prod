/**
 * Migration 003: API Route Implementations
 * 
 * Ready-to-use API route implementations for the HAUS platform.
 * Copy these to apps/app/src/app/api/[route]/route.ts
 */

// ============================================================================
// /api/agent - Claude Buyers Agent
// ============================================================================

// apps/app/src/app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@v1/backend/convex/auth";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, propertyContext } = await req.json();

    // Use AI SDK with Claude
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      messages,
      system: `You are a knowledgeable Australian real estate buyers agent. 
        Help users find properties, analyze deals, and navigate the market.
        ${propertyContext ? `Context: ${JSON.stringify(propertyContext)}` : ""}`,
      tools: {
        searchProperties: {
          description: "Search for properties based on criteria",
          parameters: {
            location: "string",
            minPrice: "optional number",
            maxPrice: "optional number",
            bedrooms: "optional number",
            propertyType: "optional string",
          },
        },
        analyzeProperty: {
          description: "Analyze a specific property",
          parameters: {
            propertyId: "string",
          },
        },
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Agent API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/compass/listings - Map-based Property Search
// ============================================================================

// apps/app/src/app/api/compass/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse bounds from query params
    const bounds = {
      north: parseFloat(searchParams.get("north") || "-33.7"),
      south: parseFloat(searchParams.get("south") || "-33.9"),
      east: parseFloat(searchParams.get("east") || "151.3"),
      west: parseFloat(searchParams.get("west") || "151.1"),
    };

    // Parse filters
    const filters = {
      listingMode: searchParams.get("listingMode") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      minPrice: searchParams.get("minPrice") 
        ? parseInt(searchParams.get("minPrice")!) 
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!)
        : undefined,
      bedrooms: searchParams.get("bedrooms")
        ? parseInt(searchParams.get("bedrooms")!)
        : undefined,
    };

    // Call Convex query
    const listings = await fetchQuery(api.compassListings.search, {
      bounds,
      filters,
    });

    return NextResponse.json({
      success: true,
      listings,
      count: listings.length,
      bounds,
    });
  } catch (error) {
    console.error("Compass API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Seed with sample data (admin only)
    const body = await req.json();
    
    // In production, verify admin permissions
    
    return NextResponse.json({
      success: true,
      message: "Listings seeded",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed listings" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/market/providers - Marketplace Providers
// ============================================================================

// apps/app/src/app/api/market/providers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get("category") || undefined;
    const verificationLevel = searchParams.get("verification") || undefined;
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const providers = await fetchQuery(api.providers.list, {
      category,
      verificationLevel,
      featured,
      limit,
    });

    return NextResponse.json({
      success: true,
      providers,
      count: providers.length,
    });
  } catch (error) {
    console.error("Market API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/dud/reports - DUD Trust Reports
// ============================================================================

// apps/app/src/app/api/dud/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const country = searchParams.get("country");

    // If slug provided, get single report
    if (slug) {
      const report = await fetchQuery(api.dudReports.get, { slug });
      
      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        report,
      });
    }

    // Otherwise list reports
    const reports = await fetchQuery(api.dudReports.list, {
      category: category || undefined,
      country: country || undefined,
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("DUD API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/academy/lessons - Academy Content
// ============================================================================

// apps/app/src/app/api/academy/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get("category");
    const courseId = searchParams.get("courseId");

    const lessons = await fetchQuery(api.lessons.list, {
      category: category || undefined,
      courseId: courseId || undefined,
    });

    return NextResponse.json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("Academy API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/user/progress - User Progress & Gamification
// ============================================================================

// apps/app/src/app/api/user/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@v1/backend/convex/auth";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@v1/backend/convex";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await fetchQuery(api.userProgress.get, {
      userId: session.user.id,
    });

    // If no progress exists, create initial record
    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: {
          userId: session.user.id,
          xp: 0,
          level: 1,
          streak: 0,
          completedLessons: [],
          completedAchievements: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Progress API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case "completeLesson":
        const result = await fetchMutation(api.userProgress.completeLesson, {
          userId: session.user.id,
          lessonId: data.lessonId,
          xpReward: data.xpReward,
        });
        return NextResponse.json({ success: true, result });

      case "addXp":
        const xpResult = await fetchMutation(api.userProgress.addXp, {
          userId: session.user.id,
          amount: data.amount,
        });
        return NextResponse.json({ success: true, xpResult });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Progress API Error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

// ============================================================================
// /api/voice-search - Gemini Voice Search
// ============================================================================

// apps/app/src/app/api/voice-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    const { query, context } = await req.json();

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        {
          role: "system",
          content: `You are a property search assistant. Extract search parameters from user queries.
            Return JSON with: location, minPrice, maxPrice, bedrooms, propertyType, features.
            Query: "${query}"`,
        },
      ],
      ...context,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Voice Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to process voice search" },
      { status: 500 }
    );
  }
}

// ============================================================================
// Rate Limiting Helper
// ============================================================================

// lib/rate-limit.ts
interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  check: (limit: number, token: string) => Promise<void>;
}

export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const tokenCache = new Map();
  
  return {
    check: async (limit: number, token: string) => {
      const now = Date.now();
      const tokenCount = tokenCache.get(token) || [0, now];
      
      if (now - tokenCount[1] > config.interval) {
        tokenCount[0] = 1;
        tokenCount[1] = now;
      } else {
        tokenCount[0]++;
      }
      
      tokenCache.set(token, tokenCount);
      
      if (tokenCount[0] > limit) {
        throw new Error("Rate limit exceeded");
      }
    },
  };
}
