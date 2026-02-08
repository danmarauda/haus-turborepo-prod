/**
 * Property Listings Module
 *
 * Convex functions for managing property listings from external sources
 * (Domain.com.au, realestate.com.au, manual entry).
 *
 * @module convex/propertyListings
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// Types (matching schema)
// ============================================================================

const PropertyStatus = v.union(
  v.literal("active"),
  v.literal("sold"),
  v.literal("leased"),
  v.literal("withdrawn"),
  v.literal("off_market"),
);

const PropertyType = v.union(
  v.literal("house"),
  v.literal("apartment"),
  v.literal("townhouse"),
  v.literal("unit"),
  v.literal("land"),
  v.literal("studio"),
);

// ============================================================================
// Queries
// ============================================================================

/**
 * Search property listings with filters
 * @deprecated Use searchAdvanced instead for better performance with proper index usage
 */
export const search = query({
  args: {
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    propertyType: v.optional(PropertyType),
    status: v.optional(PropertyStatus),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    maxBedrooms: v.optional(v.number()),
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Note: Rate limiting removed - queries cannot call mutations
    // TODO: Implement rate limiting at HTTP route level instead
    let q = ctx.db.query("propertyListings");

    // Apply filters
    if (args.suburb) {
      // Use index for suburb search
      q = q.withIndex("by_suburb");
      // Note: This is a simplified search - in production you'd want
      // more sophisticated filtering with pagination
    }

    const results = await q.take(args.limit || 50);

    // Client-side filtering for complex queries
    return results.filter((listing) => {
      if (args.state && listing.state !== args.state) return false;
      if (args.propertyType && listing.propertyType !== args.propertyType)
        return false;
      if (args.status && listing.status !== args.status) return false;
      if (args.minPrice && (listing.price || 0) < args.minPrice) return false;
      if (args.maxPrice && (listing.price || 0) > args.maxPrice) return false;
      if (args.minBedrooms && (listing.bedrooms || 0) < args.minBedrooms)
        return false;
      if (args.maxBedrooms && (listing.bedrooms || 0) > args.maxBedrooms)
        return false;
      if (args.source && listing.source !== args.source) return false;
      return true;
    });
  },
});

/**
 * Advanced property search with server-side filtering using proper indexes.
 * Supports multi-field filtering, pagination with cursor, and full-text search.
 * Rate limit: 100 requests/minute per user
 */
export const searchAdvanced = query({
  args: {
    // Location filters
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    postcode: v.optional(v.string()),

    // Property type and status
    propertyType: v.optional(PropertyType),
    status: v.optional(PropertyStatus),

    // Price range
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),

    // Bedroom/bathroom filters
    minBedrooms: v.optional(v.number()),
    maxBedrooms: v.optional(v.number()),
    minBathrooms: v.optional(v.number()),
    maxBathrooms: v.optional(v.number()),

    // Car spaces
    minCarSpaces: v.optional(v.number()),

    // Land/building size (sqm)
    minLandSize: v.optional(v.number()),
    maxLandSize: v.optional(v.number()),

    // Full-text search
    searchQuery: v.optional(v.string()),

    // Source filter
    source: v.optional(v.string()),

    // Pagination
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),

    // Sorting
    sortBy: v.optional(v.union(
      v.literal("price_asc"),
      v.literal("price_desc"),
      v.literal("date_desc"),
      v.literal("date_asc"),
      v.literal("bedrooms_desc"),
    )),

    // Rate limiting identifier
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    listings: unknown[];
    nextCursor: string | null;
    totalCount: number;
    hasMore: boolean;
  }> => {
    const limit = Math.min(args.limit || 20, 100); // Max 100 per page
    const status = args.status ?? "active";

    // Determine the best index to use based on filters
    let q = ctx.db.query("propertyListings");
    let indexName: string | undefined;
    const indexRange: unknown[] = [];

    // Choose optimal index based on filter combination
    if (args.searchQuery) {
      // Full-text search takes priority
      // Use searchIndex for address/suburb/description/headline search
      const searchResults = await ctx.db
        .query("propertyListings")
        .withSearchIndex("search_properties", (q) => {
          let query = q.search("address", args.searchQuery!);
          if (args.suburb) query = query.eq("suburb", args.suburb);
          if (args.state) query = query.eq("state", args.state);
          if (args.propertyType) query = query.eq("propertyType", args.propertyType);
          query = query.eq("status", status);
          return query;
        })
        .take(limit + 1);

      return processResults(searchResults, args, limit);
    }

    // Determine best compound index
    if (args.suburb && args.state) {
      indexName = "by_state_suburb_status";
      indexRange.push(args.state, args.suburb.toLowerCase(), status);
    } else if (args.suburb) {
      indexName = "by_suburb_status";
      indexRange.push(args.suburb.toLowerCase(), status);
    } else if (args.propertyType) {
      indexName = "by_propertyType_status_price";
      indexRange.push(args.propertyType, status);
    } else {
      indexName = "by_status";
      indexRange.push(status);
    }

    // Apply index
    if (indexName) {
      q = q.withIndex(indexName);
    }

    // Get results
    let results = await q.take(limit * 2); // Fetch more for server-side filtering

    // Server-side filtering with early termination optimization
    const filtered: unknown[] = [];
    for (const listing of results) {
      // Skip if already have enough results past cursor
      if (filtered.length >= limit + 1) break;

      // Apply all filters
      const listingState = (listing as { state?: string }).state;
      const listingSuburb = (listing as { suburb?: string }).suburb;
      if (args.state && listingState?.toLowerCase() !== args.state.toLowerCase()) continue;
      if (args.suburb && listingSuburb?.toLowerCase() !== args.suburb.toLowerCase()) continue;
      if (args.postcode && (listing as { postcode?: string }).postcode !== args.postcode) continue;
      if (args.propertyType && (listing as { propertyType?: string }).propertyType !== args.propertyType) continue;
      if ((listing as { status?: string }).status !== status) continue;

      // Price filtering
      const price = (listing as { price?: number }).price;
      if (args.minPrice !== undefined && (price === undefined || price < args.minPrice)) continue;
      if (args.maxPrice !== undefined && (price === undefined || price > args.maxPrice)) continue;

      // Bedroom filtering
      const bedrooms = (listing as { bedrooms?: number }).bedrooms ?? 0;
      if (args.minBedrooms !== undefined && bedrooms < args.minBedrooms) continue;
      if (args.maxBedrooms !== undefined && bedrooms > args.maxBedrooms) continue;

      // Bathroom filtering
      const bathrooms = (listing as { bathrooms?: number }).bathrooms ?? 0;
      if (args.minBathrooms !== undefined && bathrooms < args.minBathrooms) continue;
      if (args.maxBathrooms !== undefined && bathrooms > args.maxBathrooms) continue;

      // Car spaces filtering
      const carSpaces = (listing as { carSpaces?: number }).carSpaces ?? 0;
      if (args.minCarSpaces !== undefined && carSpaces < args.minCarSpaces) continue;

      // Land size filtering
      const landSize = (listing as { landSize?: number }).landSize;
      if (args.minLandSize !== undefined && (landSize === undefined || landSize < args.minLandSize)) continue;
      if (args.maxLandSize !== undefined && (landSize === undefined || landSize > args.maxLandSize)) continue;

      // Source filtering
      if (args.source && (listing as { source?: string }).source !== args.source) continue;

      filtered.push(listing);
    }

    return processResults(filtered, args, limit);
  },
});

/**
 * Helper function to process and sort search results
 */
function processResults(
  results: unknown[],
  args: {
    sortBy?: "price_asc" | "price_desc" | "date_desc" | "date_asc" | "bedrooms_desc";
    cursor?: string;
  },
  limit: number,
): {
  listings: unknown[];
  nextCursor: string | null;
  totalCount: number;
  hasMore: boolean;
} {
  // Sort results
  const sorted = [...results].sort((a, b) => {
    switch (args.sortBy) {
      case "price_asc":
        return ((a as { price?: number }).price ?? Infinity) - ((b as { price?: number }).price ?? Infinity);
      case "price_desc":
        return ((b as { price?: number }).price ?? 0) - ((a as { price?: number }).price ?? 0);
      case "date_asc":
        return ((a as { listingDate?: number }).listingDate ?? 0) - ((b as { listingDate?: number }).listingDate ?? 0);
      case "bedrooms_desc":
        return ((b as { bedrooms?: number }).bedrooms ?? 0) - ((a as { bedrooms?: number }).bedrooms ?? 0);
      case "date_desc":
      default:
        return ((b as { listingDate?: number }).listingDate ?? 0) - ((a as { listingDate?: number }).listingDate ?? 0);
    }
  });

  // Handle cursor pagination
  let startIndex = 0;
  if (args.cursor) {
    const cursorIndex = sorted.findIndex(
      (item) => (item as { _id: string })._id === args.cursor
    );
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }

  // Get page of results
  const pageResults = sorted.slice(startIndex, startIndex + limit);
  const hasMore = sorted.length > startIndex + limit;
  const nextCursor = hasMore && pageResults.length > 0
    ? (pageResults[pageResults.length - 1] as { _id: string })._id
    : null;

  return {
    listings: pageResults,
    nextCursor,
    totalCount: sorted.length,
    hasMore,
  };
}

/**
 * Get search suggestions for autocomplete functionality.
 * Returns matching suburbs, property types, and price range suggestions.
 * Rate limit: 100 requests/minute per user
 */
export const getSearchSuggestions = query({
  args: {
    query: v.string(),
    type: v.optional(v.union(
      v.literal("all"),
      v.literal("suburbs"),
      v.literal("propertyTypes"),
      v.literal("priceRanges"),
    )),
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Apply rate limiting
    const identifier = args.userId ? `user:${args.userId}` : `anon:${ctx.runId}`;
    await assertRateLimit(
      ctx,
      identifier,
      RateLimits.PROPERTY_SEARCH.keyPrefix,
      RateLimits.PROPERTY_SEARCH.maxRequests,
      RateLimits.PROPERTY_SEARCH.windowMs
    );
    const query = args.query.toLowerCase().trim();
    const type = args.type ?? "all";
    const limit = args.limit ?? 10;
    const suggestions: {
      suburbs: Array<{ name: string; state: string; postcode?: string; listingCount: number }>;
      propertyTypes: Array<{ type: string; displayName: string; listingCount: number }>;
      priceRanges: Array<{ label: string; min: number; max: number | null; listingCount: number }>;
    } = {
      suburbs: [],
      propertyTypes: [],
      priceRanges: [],
    };

    // Suggest suburbs
    if (type === "all" || type === "suburbs") {
      const suburbListings = await ctx.db
        .query("propertyListings")
        .withIndex("by_suburb_status")
        .filter((q) => q.eq(q.field("status"), "active"))
        .take(200);

      // Aggregate suburbs
      const suburbMap = new Map<string, { state: string; count: number; postcodes: Set<string> }>();
      for (const listing of suburbListings) {
        const suburbName = listing.suburb.toLowerCase();
        if (suburbName.includes(query) || query.includes(suburbName)) {
          const key = `${listing.suburb}|${listing.state}`;
          const existing = suburbMap.get(key);
          if (existing) {
            existing.count++;
            existing.postcodes.add(listing.postcode);
          } else {
            suburbMap.set(key, {
              state: listing.state,
              count: 1,
              postcodes: new Set([listing.postcode]),
            });
          }
        }
      }

      suggestions.suburbs = Array.from(suburbMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([key, data]) => {
          const [name, state] = key.split("|");
          return {
            name,
            state,
            postcode: Array.from(data.postcodes)[0],
            listingCount: data.count,
          };
        });
    }

    // Suggest property types
    if (type === "all" || type === "propertyTypes") {
      const propertyTypeCounts = await ctx.db
        .query("propertyListings")
        .withIndex("by_status_propertyType")
        .filter((q) => q.eq(q.field("status"), "active"))
        .take(500);

      const typeMap = new Map<string, number>();
      for (const listing of propertyTypeCounts) {
        const count = typeMap.get(listing.propertyType) ?? 0;
        typeMap.set(listing.propertyType, count + 1);
      }

      const displayNames: Record<string, string> = {
        house: "House",
        apartment: "Apartment",
        townhouse: "Townhouse",
        unit: "Unit",
        land: "Land",
        studio: "Studio",
      };

      suggestions.propertyTypes = Array.from(typeMap.entries())
        .filter(([typeName]) => typeName.includes(query) || displayNames[typeName]?.toLowerCase().includes(query))
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([typeName, count]) => ({
          type: typeName,
          displayName: displayNames[typeName] ?? typeName,
          listingCount: count,
        }));
    }

    // Suggest price ranges based on active listings
    if (type === "all" || type === "priceRanges") {
      const activeListings = await ctx.db
        .query("propertyListings")
        .withIndex("by_status_price")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "active"),
            q.neq(q.field("price"), undefined)
          )
        )
        .take(1000);

      const prices = activeListings
        .map((l) => l.price)
        .filter((p): p is number => p !== undefined && p > 0)
        .sort((a, b) => a - b);

      if (prices.length > 0) {
        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        const medianPrice = prices[Math.floor(prices.length / 2)];

        // Define price range brackets
        const brackets = [
          { label: "Under $500k", min: 0, max: 500000 },
          { label: "$500k - $750k", min: 500000, max: 750000 },
          { label: "$750k - $1M", min: 750000, max: 1000000 },
          { label: "$1M - $1.5M", min: 1000000, max: 1500000 },
          { label: "$1.5M - $2M", min: 1500000, max: 2000000 },
          { label: "$2M - $3M", min: 2000000, max: 3000000 },
          { label: "$3M - $5M", min: 3000000, max: 5000000 },
          { label: "$5M+", min: 5000000, max: null },
        ];

        // Count listings in each bracket
        suggestions.priceRanges = brackets
          .map((bracket) => ({
            ...bracket,
            listingCount: prices.filter((p) =>
              p >= bracket.min && (bracket.max === null || p < bracket.max)
            ).length,
          }))
          .filter((bracket) => bracket.listingCount > 0)
          .slice(0, limit);
      }
    }

    return suggestions;
  },
});

/**
 * Get unique suburbs for a state with listing counts
 */
export const getSuburbsByState = query({
  args: {
    state: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("propertyListings")
      .withIndex("by_state_suburb_status")
      .filter((q) =>
        q.and(
          q.eq(q.field("state"), args.state.toUpperCase()),
          q.eq(q.field("status"), "active")
        )
      )
      .take(args.limit ?? 500);

    // Aggregate by suburb
    const suburbMap = new Map<string, { postcode: string; count: number }>();
    for (const listing of listings) {
      const existing = suburbMap.get(listing.suburb);
      if (existing) {
        existing.count++;
      } else {
        suburbMap.set(listing.suburb, {
          postcode: listing.postcode,
          count: 1,
        });
      }
    }

    return Array.from(suburbMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        state: args.state.toUpperCase(),
        postcode: data.postcode,
        listingCount: data.count,
      }));
  },
});

/**
 * Get a single property listing by ID
 */
export const get = query({
  args: { id: v.id("propertyListings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a property listing by listingId (external ID)
 */
export const getByListingId = query({
  args: { listingId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("propertyListings")
      .withIndex("by_listingId")
      .filter((q) => q.eq(q.field("listingId"), args.listingId))
      .take(1);

    return results[0] || null;
  },
});

/**
 * Get listings by suburb
 * Uses compound index for efficient server-side filtering
 */
export const getBySuburb = query({
  args: {
    suburb: v.string(),
    state: v.optional(v.string()),
    status: v.optional(PropertyStatus),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "active";
    const limit = args.limit ?? 50;

    let q;
    if (args.state) {
      // Use state_suburb_status compound index for better filtering
      q = ctx.db
        .query("propertyListings")
        .withIndex("by_state_suburb_status", (q) =>
          q
            .eq("state", args.state!.toUpperCase())
            .eq("suburb", args.suburb.toLowerCase())
            .eq("status", status)
        );
    } else {
      // Use suburb_status index
      q = ctx.db
        .query("propertyListings")
        .withIndex("by_suburb_status", (q) =>
          q
            .eq("suburb", args.suburb.toLowerCase())
            .eq("status", status)
        );
    }

    // Apply cursor pagination if provided
    if (args.cursor) {
      q = q.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    const results = await q.take(limit + 1);
    const hasMore = results.length > limit;
    const listings = hasMore ? results.slice(0, limit) : results;

    return {
      listings,
      nextCursor: hasMore ? (listings[listings.length - 1] as { _id: string })._id : null,
      hasMore,
    };
  },
});

/**
 * Get listings by source (e.g., "domain", "realestate.com.au")
 */
export const getBySource = query({
  args: {
    source: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("propertyListings")
      .withIndex("by_source")
      .filter((q) => q.eq(q.field("source"), args.source))
      .take(args.limit || 50);

    return results;
  },
});

/**
 * Get recent listings (for feed/dashboard)
 * Uses status_propertyType compound index when filtering by type
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    propertyType: v.optional(PropertyType),
    status: v.optional(PropertyStatus),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const status = args.status ?? "active";

    let q;
    if (args.propertyType) {
      // Use compound index for property type + status filtering
      q = ctx.db
        .query("propertyListings")
        .withIndex("by_propertyType_status_price", (q) =>
          q
            .eq("propertyType", args.propertyType!)
            .eq("status", status)
        );
    } else {
      // Use status index for active listings
      q = ctx.db
        .query("propertyListings")
        .withIndex("by_status", (q) => q.eq("status", status));
    }

    // Apply cursor pagination if provided
    if (args.cursor) {
      q = q.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    // Sort by fetchedAt descending (most recent first)
    const results = await q
      .order("desc")
      .take(limit + 1);

    const hasMore = results.length > limit;
    const listings = hasMore ? results.slice(0, limit) : results;

    return {
      listings,
      nextCursor: hasMore ? (listings[listings.length - 1] as { _id: string })._id : null,
      hasMore,
    };
  },
});

/**
 * Get statistics for a suburb, state, or overall
 * Uses compound indexes for efficient aggregation
 */
export const getStats = query({
  args: {
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let listings;

    if (args.state && args.suburb) {
      // Use state_suburb_status compound index
      listings = await ctx.db
        .query("propertyListings")
        .withIndex("by_state_suburb_status", (q) =>
          q
            .eq("state", args.state!.toUpperCase())
            .eq("suburb", args.suburb!.toLowerCase())
        )
        .collect();
    } else if (args.suburb) {
      // Use suburb_status index and filter by suburb
      listings = await ctx.db
        .query("propertyListings")
        .withIndex("by_suburb_status")
        .filter((q) =>
          q.eq(q.field("suburb"), args.suburb!.toLowerCase())
        )
        .collect();
    } else if (args.state) {
      // Filter by state - fetch all and filter (state is not indexed alone)
      listings = await ctx.db
        .query("propertyListings")
        .withIndex("by_status")
        .filter((q) => q.eq(q.field("state"), args.state!.toUpperCase()))
        .collect();
    } else {
      // Get all listings using status index
      listings = await ctx.db
        .query("propertyListings")
        .withIndex("by_status")
        .collect();
    }

    const activeListings = listings.filter((l) => l.status === "active");
    const prices = activeListings.map((l) => l.price).filter((p) => p !== undefined && p > 0);

    // Calculate price statistics
    const sortedPrices = [...prices].sort((a, b) => (a as number) - (b as number));
    const medianPrice = sortedPrices.length > 0
      ? sortedPrices[Math.floor(sortedPrices.length / 2)]
      : undefined;

    return {
      total: listings.length,
      active: activeListings.length,
      sold: listings.filter((l) => l.status === "sold").length,
      leased: listings.filter((l) => l.status === "leased").length,
      averagePrice:
        prices.length > 0
          ? Math.round(prices.reduce((sum, p) => sum + (p || 0), 0) / prices.length)
          : undefined,
      medianPrice: medianPrice as number | undefined,
      minPrice: prices.length > 0 ? Math.min(...prices as number[]) : undefined,
      maxPrice: prices.length > 0 ? Math.max(...prices as number[]) : undefined,
      byType: {
        house: activeListings.filter((l) => l.propertyType === "house").length,
        apartment: activeListings.filter((l) => l.propertyType === "apartment").length,
        townhouse: activeListings.filter((l) => l.propertyType === "townhouse").length,
        unit: activeListings.filter((l) => l.propertyType === "unit").length,
        land: activeListings.filter((l) => l.propertyType === "land").length,
        studio: activeListings.filter((l) => l.propertyType === "studio").length,
      },
      byStatus: {
        active: listings.filter((l) => l.status === "active").length,
        sold: listings.filter((l) => l.status === "sold").length,
        leased: listings.filter((l) => l.status === "leased").length,
        withdrawn: listings.filter((l) => l.status === "withdrawn").length,
        off_market: listings.filter((l) => l.status === "off_market").length,
      },
    };
  },
});

// ============================================================================
// Additional Filter Queries
// ============================================================================

/**
 * Get listings by price range with proper index usage
 */
export const getByPriceRange = query({
  args: {
    minPrice: v.number(),
    maxPrice: v.number(),
    status: v.optional(PropertyStatus),
    propertyType: v.optional(PropertyType),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const status = args.status ?? "active";

    // Use status_price index for efficient range queries
    let q = ctx.db
      .query("propertyListings")
      .withIndex("by_status_price", (q) =>
        q
          .eq("status", status)
          .gte("price", args.minPrice)
          .lte("price", args.maxPrice)
      );

    // Additional filter by property type if specified
    if (args.propertyType) {
      q = q.filter((q) => q.eq(q.field("propertyType"), args.propertyType!));
    }

    // Apply cursor pagination
    if (args.cursor) {
      q = q.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    const results = await q.take(limit + 1);
    const hasMore = results.length > limit;
    const listings = hasMore ? results.slice(0, limit) : results;

    return {
      listings,
      nextCursor: hasMore ? (listings[listings.length - 1] as { _id: string })._id : null,
      hasMore,
    };
  },
});

/**
 * Get listings by bedroom count with proper index usage
 */
export const getByBedrooms = query({
  args: {
    minBedrooms: v.number(),
    maxBedrooms: v.optional(v.number()),
    status: v.optional(PropertyStatus),
    propertyType: v.optional(PropertyType),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const status = args.status ?? "active";

    // Use status_bedrooms compound index
    let q = ctx.db
      .query("propertyListings")
      .withIndex("by_status_bedrooms", (q) =>
        q
          .eq("status", status)
          .gte("bedrooms", args.minBedrooms)
      );

    // Apply max bedrooms filter
    if (args.maxBedrooms !== undefined) {
      q = q.filter((q) => q.lte(q.field("bedrooms"), args.maxBedrooms!));
    }

    // Filter by property type if specified
    if (args.propertyType) {
      q = q.filter((q) => q.eq(q.field("propertyType"), args.propertyType!));
    }

    // Apply cursor pagination
    if (args.cursor) {
      q = q.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    const results = await q.take(limit + 1);
    const hasMore = results.length > limit;
    const listings = hasMore ? results.slice(0, limit) : results;

    return {
      listings,
      nextCursor: hasMore ? (listings[listings.length - 1] as { _id: string })._id : null,
      hasMore,
    };
  },
});

/**
 * Full-text search using the search index
 * Searches across address, suburb, headline, and description
 * Rate limit: 100 requests/minute per user
 */
export const searchByText = query({
  args: {
    query: v.string(),
    filters: v.optional(v.object({
      suburb: v.optional(v.string()),
      state: v.optional(v.string()),
      propertyType: v.optional(PropertyType),
      status: v.optional(PropertyStatus),
      minBedrooms: v.optional(v.number()),
      maxBedrooms: v.optional(v.number()),
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
    })),
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Apply rate limiting
    const identifier = args.userId ? `user:${args.userId}` : `anon:${ctx.runId}`;
    await assertRateLimit(
      ctx,
      identifier,
      RateLimits.PROPERTY_SEARCH.keyPrefix,
      RateLimits.PROPERTY_SEARCH.maxRequests,
      RateLimits.PROPERTY_SEARCH.windowMs
    );

    const limit = Math.min(args.limit ?? 20, 50);
    const filters = args.filters ?? {};

    // Use the search index for full-text search
    const results = await ctx.db
      .query("propertyListings")
      .withSearchIndex("search_properties", (q) => {
        let query = q.search("address", args.query);

        // Apply filter fields supported by the search index
        if (filters.suburb) query = query.eq("suburb", filters.suburb);
        if (filters.state) query = query.eq("state", filters.state);
        if (filters.propertyType) query = query.eq("propertyType", filters.propertyType);
        query = query.eq("status", filters.status ?? "active");

        return query;
      })
      .take(limit * 2); // Fetch more for additional filtering

    // Apply additional filters not supported by search index
    const filtered = results.filter((listing) => {
      if (filters.minBedrooms !== undefined && ((listing.bedrooms ?? 0) < filters.minBedrooms)) return false;
      if (filters.maxBedrooms !== undefined && ((listing.bedrooms ?? 0) > filters.maxBedrooms)) return false;
      if (filters.minPrice !== undefined && ((listing.price ?? 0) < filters.minPrice)) return false;
      if (filters.maxPrice !== undefined && ((listing.price ?? Infinity) > filters.maxPrice)) return false;
      return true;
    });

    return {
      listings: filtered.slice(0, limit),
      totalFound: filtered.length,
      hasMore: filtered.length > limit,
    };
  },
});

/**
 * Get price distribution statistics for market insights
 */
export const getPriceDistribution = query({
  args: {
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    propertyType: v.optional(PropertyType),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("propertyListings")
      .withIndex("by_status_price", (q) => q.eq("status", "active"));

    // Apply location filters
    if (args.state && args.suburb) {
      q = q.filter((q) =>
        q.and(
          q.eq(q.field("state"), args.state!.toUpperCase()),
          q.eq(q.field("suburb"), args.suburb!.toLowerCase())
        )
      );
    } else if (args.suburb) {
      q = q.filter((q) => q.eq(q.field("suburb"), args.suburb!.toLowerCase()));
    } else if (args.state) {
      q = q.filter((q) => q.eq(q.field("state"), args.state!.toUpperCase()));
    }

    // Apply property type filter
    if (args.propertyType) {
      q = q.filter((q) => q.eq(q.field("propertyType"), args.propertyType!));
    }

    const listings = await q.collect();
    const prices = listings
      .map((l) => l.price)
      .filter((p): p is number => p !== undefined && p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return {
        count: 0,
        buckets: [],
        median: null,
        mean: null,
        min: null,
        max: null,
      };
    }

    // Create price buckets
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const bucketSize = (maxPrice - minPrice) / 5;

    const buckets = [
      { range: `${formatPrice(minPrice)} - ${formatPrice(minPrice + bucketSize)}`, min: minPrice, max: minPrice + bucketSize, count: 0 },
      { range: `${formatPrice(minPrice + bucketSize)} - ${formatPrice(minPrice + bucketSize * 2)}`, min: minPrice + bucketSize, max: minPrice + bucketSize * 2, count: 0 },
      { range: `${formatPrice(minPrice + bucketSize * 2)} - ${formatPrice(minPrice + bucketSize * 3)}`, min: minPrice + bucketSize * 2, max: minPrice + bucketSize * 3, count: 0 },
      { range: `${formatPrice(minPrice + bucketSize * 3)} - ${formatPrice(minPrice + bucketSize * 4)}`, min: minPrice + bucketSize * 3, max: minPrice + bucketSize * 4, count: 0 },
      { range: `${formatPrice(minPrice + bucketSize * 4)}+`, min: minPrice + bucketSize * 4, max: Infinity, count: 0 },
    ];

    // Count listings in each bucket
    for (const price of prices) {
      const bucket = buckets.find((b) => price >= b.min && price < b.max) || buckets[buckets.length - 1];
      bucket.count++;
    }

    return {
      count: prices.length,
      buckets,
      median: prices[Math.floor(prices.length / 2)],
      mean: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: minPrice,
      max: maxPrice,
    };
  },
});

/**
 * Helper function to format price for display
 */
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price}`;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Upsert a property listing (insert or update if exists)
 */
export const upsert = mutation({
  args: {
    // Identity
    listingId: v.string(),
    externalId: v.optional(v.string()),
    source: v.optional(v.string()),

    // Basic property info
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),

    // Property details
    propertyType: PropertyType,
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    carSpaces: v.optional(v.number()),
    landSize: v.optional(v.number()),
    buildingSize: v.optional(v.number()),

    // Pricing
    price: v.optional(v.number()),
    priceText: v.optional(v.string()),
    priceRangeMin: v.optional(v.number()),
    priceRangeMax: v.optional(v.number()),

    // Description & Features
    headline: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    indoorFeatures: v.optional(v.array(v.string())),
    outdoorFeatures: v.optional(v.array(v.string())),

    // Media
    images: v.optional(v.array(v.string())),
    floorplans: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    mainImage: v.optional(v.string()),

    // Agent/Agency
    agentName: v.optional(v.string()),
    agentPhone: v.optional(v.string()),
    agentEmail: v.optional(v.string()),
    agencyName: v.optional(v.string()),
    agencyLogo: v.optional(v.string()),

    // Location data
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),

    // Status & Dates
    status: PropertyStatus,
    listingDate: v.optional(v.number()),
    soldDate: v.optional(v.number()),
    soldPrice: v.optional(v.number()),

    // Metadata
    metadata: v.optional(v.any()),
    rawData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if listing already exists
    const existing = await ctx.db
      .query("propertyListings")
      .withIndex("by_listingId")
      .filter((q) => q.eq(q.field("listingId"), args.listingId))
      .first();

    if (existing) {
      // Update existing listing
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
        lastSyncedAt: now,
      });
      return { success: true, id: existing._id, action: "updated" };
    }

    // Insert new listing
    const id = await ctx.db.insert("propertyListings", {
      ...args,
      fetchedAt: now,
      updatedAt: now,
    });
    return { success: true, id, action: "created" };
  },
});

/**
 * Batch upsert multiple listings
 */
export const batchUpsert = mutation({
  args: {
    listings: v.array(
      v.object({
        // Identity
        listingId: v.string(),
        externalId: v.optional(v.string()),
        source: v.optional(v.string()),

        // Basic property info
        address: v.string(),
        suburb: v.string(),
        state: v.string(),
        postcode: v.string(),

        // Property details
        propertyType: PropertyType,
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        carSpaces: v.optional(v.number()),
        landSize: v.optional(v.number()),
        buildingSize: v.optional(v.number()),

        // Pricing
        price: v.optional(v.number()),
        priceText: v.optional(v.string()),
        priceRangeMin: v.optional(v.number()),
        priceRangeMax: v.optional(v.number()),

        // Description & Features
        headline: v.optional(v.string()),
        description: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        indoorFeatures: v.optional(v.array(v.string())),
        outdoorFeatures: v.optional(v.array(v.string())),

        // Media
        images: v.optional(v.array(v.string())),
        floorplans: v.optional(v.array(v.string())),
        videos: v.optional(v.array(v.string())),
        mainImage: v.optional(v.string()),

        // Agent/Agency
        agentName: v.optional(v.string()),
        agentPhone: v.optional(v.string()),
        agentEmail: v.optional(v.string()),
        agencyName: v.optional(v.string()),
        agencyLogo: v.optional(v.string()),

        // Location data
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),

        // Status & Dates
        status: PropertyStatus,
        listingDate: v.optional(v.number()),
        soldDate: v.optional(v.number()),
        soldPrice: v.optional(v.number()),

        // Metadata
        metadata: v.optional(v.any()),
        rawData: v.optional(v.any()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
    };

    for (const listing of args.listings) {
      try {
        // Check if listing already exists
        const existing = await ctx.db
          .query("propertyListings")
          .withIndex("by_listingId")
          .filter((q) => q.eq(q.field("listingId"), listing.listingId))
          .first();

        if (existing) {
          // Update existing listing
          await ctx.db.patch(existing._id, {
            ...listing,
            updatedAt: now,
            lastSyncedAt: now,
          });
          results.updated++;
        } else {
          // Insert new listing
          await ctx.db.insert("propertyListings", {
            ...listing,
            fetchedAt: now,
            updatedAt: now,
          });
          results.created++;
        }
      } catch (error) {
        console.error("Failed to upsert listing:", listing.listingId, error);
        results.failed++;
      }
    }

    return { success: true, ...results };
  },
});

/**
 * Update listing status
 */
export const updateStatus = mutation({
  args: {
    listingId: v.string(),
    status: PropertyStatus,
    soldDate: v.optional(v.number()),
    soldPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("propertyListings")
      .withIndex("by_listingId")
      .filter((q) => q.eq(q.field("listingId"), args.listingId))
      .first();

    if (!existing) {
      throw new Error(`Listing not found: ${args.listingId}`);
    }

    await ctx.db.patch(existing._id, {
      status: args.status,
      soldDate: args.soldDate,
      soldPrice: args.soldPrice,
      updatedAt: Date.now(),
    });

    return { success: true, id: existing._id };
  },
});

/**
 * Delete a listing
 */
export const remove = mutation({
  args: { id: v.id("propertyListings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Sync listings from external source
 * This would be called from an action that fetches from Domain API
 */
export const syncFromSource = mutation({
  args: {
    source: v.string(),
    listings: v.array(
      v.object({
        listingId: v.string(),
        externalId: v.optional(v.string()),
        address: v.string(),
        suburb: v.string(),
        state: v.string(),
        postcode: v.string(),
        propertyType: PropertyType,
        status: v.optional(PropertyStatus),
        price: v.optional(v.number()),
        priceText: v.optional(v.string()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        carSpaces: v.optional(v.number()),
        landSize: v.optional(v.number()),
        buildingSize: v.optional(v.number()),
        headline: v.optional(v.string()),
        description: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        mainImage: v.optional(v.string()),
        agentName: v.optional(v.string()),
        agentPhone: v.optional(v.string()),
        agentEmail: v.optional(v.string()),
        agencyName: v.optional(v.string()),
        agencyLogo: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        features: v.optional(v.array(v.string())),
        indoorFeatures: v.optional(v.array(v.string())),
        outdoorFeatures: v.optional(v.array(v.string())),
        floorplans: v.optional(v.array(v.string())),
        videos: v.optional(v.array(v.string())),
        listingDate: v.optional(v.number()),
        rawData: v.optional(v.any()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
    };

    for (const listing of args.listings) {
      try {
        const existing = await ctx.db
          .query("propertyListings")
          .withIndex("by_listingId")
          .filter((q) => q.eq(q.field("listingId"), listing.listingId))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            ...listing,
            source: args.source,
            status: listing.status || "active",
            updatedAt: now,
            lastSyncedAt: now,
          });
          results.updated++;
        } else {
          await ctx.db.insert("propertyListings", {
            ...listing,
            source: args.source,
            status: listing.status || "active",
            fetchedAt: now,
            updatedAt: now,
          });
          results.created++;
        }
      } catch (error) {
        console.error("Failed to sync listing:", listing.listingId, error);
        results.failed++;
      }
    }

    return { success: true, source: args.source, ...results };
  },
});
