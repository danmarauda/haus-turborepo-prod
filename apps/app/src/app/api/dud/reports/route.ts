import { type NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";
import { auth } from "@/lib/auth";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/error-handler";

/**
 * GET /api/dud/reports
 * Get single report by slug or list reports with filters
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
    const rateLimitResult = await checkRateLimit(`dud:${ip}`, apiRateLimit);

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
    const slug = searchParams.get("slug");
    const category = searchParams.get("category") || undefined;
    const country = searchParams.get("country") || undefined;
    const region = searchParams.get("region") || undefined;
    const highProfile = searchParams.get("highProfile") === "true" ? true : undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // If slug is provided, get single report
    if (slug) {
      const report = await fetchQuery(api.dudReports.get, { slug });

      if (!report) {
        return NextResponse.json(
          {
            success: false,
            error: "Report not found",
          },
          { status: 404 }
        );
      }

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
            report,
            type: "single",
          },
          meta: {
            requestId,
            processingTime,
            timestamp: new Date().toISOString(),
          },
        },
        { headers: responseHeaders }
      );
    }

    // Otherwise, list reports with filters
    const reports = await fetchQuery(api.dudReports.list, {
      category,
      country,
      region,
      highProfile,
      limit,
    });

    // Calculate stats
    const stats = {
      total: reports.length,
      highRisk: reports.filter((r: { riskScore?: number }) => (r.riskScore || 0) > 70).length,
      mediumRisk: reports.filter(
        (r: { riskScore?: number }) => (r.riskScore || 0) > 40 && (r.riskScore || 0) <= 70
      ).length,
      lowRisk: reports.filter((r: { riskScore?: number }) => (r.riskScore || 0) <= 40).length,
      highProfile: reports.filter((r: { highProfile?: boolean }) => r.highProfile).length,
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
          reports,
          count: reports.length,
          stats,
          filters: {
            category,
            country,
            region,
            highProfile,
            limit,
          },
          type: "list",
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
    console.error("[DUD API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}
