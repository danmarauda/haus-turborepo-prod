/**
 * Property Sync Actions
 *
 * Convex actions that scrape property listings from external sources
 * (Domain.com.au, Realestate.com.au) and sync them to the database.
 *
 * These actions run server-side and can be called:
 * - From HTTP endpoints (convex/http.ts)
 * - From cron jobs or scheduled functions
 * - Manually from the Convex dashboard
 *
 * @module convex/actions/property-sync
 */

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// ============================================================================
// Types for Sync Results
// ============================================================================

export interface PropertySyncResult {
  success: boolean;
  source: string;
  created: number;
  updated: number;
  failed: number;
  duration: number;
  error?: string;
}

// ============================================================================
// Public Actions (called from client)
// ============================================================================

/**
 * Sync properties from Realestate.com.au
 *
 * Scrapes the Realestate.com.au website for property listings
 * matching the given search parameters and syncs them to Convex.
 *
 * @example
 * ```tsx
 * const result = await ctx.runAction(api.actions.propertySync.syncRealestate, {
 *   query: "Bondi Beach",
 *   state: "NSW",
 *   maxPages: 3
 * });
 * ```
 */
export const syncRealestate = action({
  args: {
    query: v.optional(v.string()),
    state: v.optional(v.string()),
    suburb: v.optional(v.string()),
    postcode: v.optional(v.string()),
    listingType: v.optional(v.string()),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Import scraper dynamically (only when needed)
      const { RealestateComAuScraper } = await import("../lib/realestate-com-au");

      const scraper = new RealestateComAuScraper({
        timeout: 30000,
        maxRetries: 3,
        requestDelay: 2000, // 2 second delay between requests
        debug: false,
      });

      // Build search params
      const searchParams: Record<string, unknown> = {};
      if (args.query) searchParams.query = args.query;
      if (args.state) searchParams.state = args.state;
      if (args.suburb) searchParams.suburb = args.suburb;
      if (args.postcode) searchParams.postcode = args.postcode;
      if (args.listingType) searchParams.listingType = args.listingType;

      // Scrape all pages up to maxPages
      const maxPages = args.maxPages ?? 3;
      const listings = [];

      for (let page = 1; page <= maxPages; page++) {
        const results = await scraper.search({
          ...searchParams,
          page,
        });

        if (!results.success || results.listings.length === 0) {
          break;
        }

        listings.push(...results.listings);
      }

      // Convert to Convex format
      const convexListings = listings.map((listing) =>
        scraper.toConvexFormat(listing)
      );

      // Batch upsert to Convex
      const syncResult = await ctx.runMutation(
        internal.propertyListings.batchUpsert,
        {
          source: "realestate.com.au",
          listings: convexListings,
        }
      );

      return {
        success: true,
        source: "realestate.com.au",
        created: syncResult.created ?? 0,
        updated: syncResult.updated ?? 0,
        failed: syncResult.failed ?? 0,
        duration: Date.now() - startTime,
      } satisfies PropertySyncResult;
    } catch (error) {
      return {
        success: false,
        source: "realestate.com.au",
        created: 0,
        updated: 0,
        failed: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      } satisfies PropertySyncResult;
    }
  },
});

/**
 * Sync properties from Domain.com.au API
 *
 * Fetches property listings from Domain.com.au (if API access available)
 * or scrapes their website, then syncs to Convex.
 *
 * @example
 * ```tsx
 * const result = await ctx.runAction(api.actions.propertySync.syncDomain, {
 *   suburb: "Bondi Beach",
 *   state: "NSW",
 *   propertyType: "house"
 * });
 * ```
 */
export const syncDomain = action({
  args: {
    suburb: v.string(),
    state: v.string(),
    propertyType: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minBedrooms: v.optional(v.number()),
    maxBedrooms: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Import Domain API client
      const { searchDomainListings } = await import("../lib/domain-api");

      // Search for listings
      const results = await searchDomainListings({
        suburb: args.suburb,
        state: args.state,
        propertyType: args.propertyType as any,
        minPrice: args.minPrice,
        maxPrice: args.maxPrice,
        minBedrooms: args.minBedrooms,
        maxBedrooms: args.maxBedrooms,
      });

      if (!results.success) {
        return {
          success: false,
          source: "domain.com.au",
          created: 0,
          updated: 0,
          failed: 0,
          duration: Date.now() - startTime,
          error: results.error,
        } satisfies PropertySyncResult;
      }

      // Batch upsert to Convex
      const syncResult = await ctx.runMutation(
        internal.propertyListings.batchUpsert,
        {
          source: "domain",
          listings: results.listings,
        }
      );

      return {
        success: true,
        source: "domain.com.au",
        created: syncResult.created ?? 0,
        updated: syncResult.updated ?? 0,
        failed: syncResult.failed ?? 0,
        duration: Date.now() - startTime,
      } satisfies PropertySyncResult;
    } catch (error) {
      return {
        success: false,
        source: "domain.com.au",
        created: 0,
        updated: 0,
        failed: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      } satisfies PropertySyncResult;
    }
  },
});

/**
 * Sync properties from all available sources
 *
 * Runs sync from both Realestate.com.au and Domain.com.au
 * for the given location parameters.
 *
 * @example
 * ```tsx
 * const result = await ctx.runAction(api.actions.propertySync.syncAllSources, {
 *   suburb: "Bondi Beach",
 *   state: "NSW",
 *   maxPages: 2
 * });
 * ```
 */
export const syncAllSources = action({
  args: {
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    query: v.optional(v.string()),
    maxPages: v.optional(v.number()),
    listingType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const results: PropertySyncResult[] = [];

    // Sync from Realestate.com.au
    try {
      const realestateResult = await ctx.runAction(
        api.propertySync.syncRealestate,
        {
          query: args.query,
          state: args.state,
          suburb: args.suburb,
          listingType: args.listingType,
          maxPages: args.maxPages,
        }
      );
      results.push(realestateResult);
    } catch (error) {
      results.push({
        success: false,
        source: "realestate.com.au",
        created: 0,
        updated: 0,
        failed: 0,
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Sync from Domain.com.au (if suburb provided)
    if (args.suburb && args.state) {
      try {
        const domainResult = await ctx.runAction(
          api.propertySync.syncDomain,
          {
            suburb: args.suburb,
            state: args.state,
          }
        );
        results.push(domainResult);
      } catch (error) {
        results.push({
          success: false,
          source: "domain.com.au",
          created: 0,
          updated: 0,
          failed: 0,
          duration: 0,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Aggregate results
    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const hasErrors = results.some((r) => !r.success && r.error);

    return {
      success: !hasErrors,
      source: "all",
      created: totalCreated,
      updated: totalUpdated,
      failed: totalFailed,
      duration: Date.now() - startTime,
      details: results,
    } satisfies PropertySyncResult & { details?: PropertySyncResult[] };
  },
});

// ============================================================================
// HTTP Endpoints (for external triggering)
// ============================================================================

/**
 * HTTP endpoint to trigger property sync
 *
 * POST /api/properties/sync
 * Body: { suburb, state, query, maxPages?, listingType? }
 *
 * This allows triggering sync from:
 * - Web hooks
 * - Admin dashboard
 * - Cron jobs
 * - Manual testing
 */
