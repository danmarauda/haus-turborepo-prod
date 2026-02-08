import { type NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";
import { auth } from "@/lib/auth";
import { checkRateLimit, searchRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/error-handler";

/**
 * GET /api/compass/listings
 * Search listings by bounds (north, south, east, west) and filters
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
    const rateLimitResult = await checkRateLimit(`compass:${ip}`, searchRateLimit);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset 
        },
        { 
          status: 429,
          headers: Object.fromEntries(Object.entries(rateLimitResult.headers).filter(([,v]) => v !== undefined)) as Record<string, string>
        }
      );
    }

    const { searchParams } = new URL(req.url);

    // Parse bounds from query params
    const north = searchParams.get("north");
    const south = searchParams.get("south");
    const east = searchParams.get("east");
    const west = searchParams.get("west");

    // Validate bounds
    if (!north || !south || !east || !west) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required bounds parameters (north, south, east, west)" 
        },
        { status: 400 }
      );
    }

    const bounds = {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west),
    };

    // Validate coordinate values
    if (Object.values(bounds).some(isNaN)) {
      return NextResponse.json(
        { success: false, error: "Invalid bounds coordinates" },
        { status: 400 }
      );
    }

    // Parse filters
    const filters = {
      listingMode: searchParams.get("listingMode") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!, 10)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!, 10)
        : undefined,
      bedrooms: searchParams.get("bedrooms")
        ? parseInt(searchParams.get("bedrooms")!, 10)
        : undefined,
    };

    // Call Convex query
    const listings = await fetchQuery(api.compassListings.getByBounds, {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      listingMode: filters.listingMode,
      propertyType: filters.propertyType,
    });

    // Client-side price and bedroom filtering
    const filteredListings = listings.filter((listing: { price: number; bedrooms: number }) => {
      if (filters.minPrice !== undefined && listing.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) return false;
      if (filters.bedrooms !== undefined && listing.bedrooms < filters.bedrooms) return false;
      return true;
    });

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
          listings: filteredListings,
          count: filteredListings.length,
          total: listings.length,
          bounds,
          filters,
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
    console.error("[Compass API] Error:", error);
    return handleApiError(error, { requestId, path: req.url });
  }
}
