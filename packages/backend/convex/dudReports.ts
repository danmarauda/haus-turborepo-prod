/**
 * DUD Reports - Trust/Safety Database Functions
 * 
 * Query and mutation functions for the DUD (Developer/Builder/Tradesperson)
 * reports table. Provides trust scoring and risk assessment for service providers.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single DUD report by slug
 */
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dudReports")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get a single DUD report by ID
 */
export const getById = query({
  args: { id: v.id("dudReports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List DUD reports with optional filters
 */
export const list = query({
  args: {
    category: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    highProfile: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("dudReports");

    // Apply category filter
    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }

    // Apply country filter
    if (args.country) {
      q = q.withIndex("by_country", (q) => q.eq("country", args.country));
    }

    // Apply high profile filter
    if (args.highProfile !== undefined) {
      q = q.withIndex("by_high_profile", (q) => q.eq("highProfile", args.highProfile));
    }

    // Default limit
    const limit = args.limit ?? 50;
    return await q.take(limit);
  },
});

/**
 * Search DUD reports by name or location
 * Note: For production, consider using Convex search indexes
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("dudReports").collect();
    const query = args.query.toLowerCase();
    
    return all.filter((report) =>
      report.name.toLowerCase().includes(query) ||
      report.location.toLowerCase().includes(query) ||
      report.category.toLowerCase().includes(query)
    );
  },
});

/**
 * Get high-risk reports
 */
export const getHighRisk = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("dudReports").collect();
    
    return all
      .filter((report) => report.riskScore && report.riskScore > 70)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, args.limit ?? 10);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new DUD report
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    category: v.string(),
    location: v.string(),
    rating: v.number(),
    headline: v.optional(v.string()),
    riskScore: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
    issues: v.optional(v.array(v.string())),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate slug
    const existing = await ctx.db
      .query("dudReports")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Report with slug "${args.slug}" already exists`);
    }

    return await ctx.db.insert("dudReports", {
      ...args,
      reviewCount: 0,
      issues: args.issues || [],
      status: "active",
      lastReported: new Date().toISOString().split("T")[0],
      regulatorRefs: [],
      nextSteps: [],
      evidence: [],
      redFlags: [],
      highProfile: false,
    });
  },
});

/**
 * Update a DUD report
 */
export const update = mutation({
  args: {
    id: v.id("dudReports"),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    riskScore: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
    status: v.optional(v.string()),
    headline: v.optional(v.string()),
    issues: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Add evidence to a report
 */
export const addEvidence = mutation({
  args: {
    id: v.id("dudReports"),
    evidence: v.object({
      dateLabel: v.string(),
      title: v.string(),
      description: v.string(),
      sourceLabel: v.string(),
      confidence: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found");
    }

    const newEvidence = {
      id: crypto.randomUUID(),
      ...args.evidence,
    };

    await ctx.db.patch(args.id, {
      evidence: [...(report.evidence || []), newEvidence],
    });

    return newEvidence;
  },
});

/**
 * Add a red flag to a report
 */
export const addRedFlag = mutation({
  args: {
    id: v.id("dudReports"),
    redFlag: v.object({
      label: v.string(),
      severity: v.string(),
      icon: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(args.id, {
      redFlags: [...(report.redFlags || []), args.redFlag],
    });

    return args.redFlag;
  },
});

/**
 * Increment review count
 */
export const incrementReviewCount = mutation({
  args: { id: v.id("dudReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(args.id, {
      reviewCount: report.reviewCount + 1,
    });

    return report.reviewCount + 1;
  },
});

/**
 * Delete a DUD report (admin only)
 */
export const remove = mutation({
  args: { id: v.id("dudReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample DUD reports
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleReports = [
      {
        name: "ABC Construction Pty Ltd",
        slug: "abc-construction",
        category: "builder",
        location: "Sydney, NSW",
        country: "Australia",
        region: "NSW",
        rating: 2.5,
        headline: "Multiple complaints regarding structural defects",
        riskScore: 75,
        riskLevel: "high",
        issues: ["structural defects", "delayed completion", "poor communication"],
        status: "active",
        highProfile: true,
        redFlags: [
          { label: "Multiple lawsuits", severity: "high", icon: "gavel" },
          { label: "License suspended", severity: "critical", icon: "ban" },
        ],
      },
      {
        name: "Premier Homes Development",
        slug: "premier-homes",
        category: "developer",
        location: "Melbourne, VIC",
        country: "Australia",
        region: "VIC",
        rating: 3.5,
        headline: "Mixed reviews, some quality concerns",
        riskScore: 45,
        riskLevel: "medium",
        issues: ["quality concerns", "communication delays"],
        status: "active",
        highProfile: false,
      },
    ];

    const ids = [];
    for (const report of sampleReports) {
      const id = await ctx.db.insert("dudReports", {
        ...report,
        reportNumber: Math.floor(Math.random() * 10000),
        reviewCount: Math.floor(Math.random() * 50),
        lastReported: new Date().toISOString().split("T")[0],
        regulatorRefs: [],
        nextSteps: [],
        evidence: [],
        blueKeyProperties: [],
      });
      ids.push(id);
    }

    return { inserted: ids.length, ids };
  },
});
