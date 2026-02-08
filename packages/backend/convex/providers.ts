/**
 * Providers - Marketplace Service Providers Functions
 * 
 * Query and mutation functions for the service providers marketplace.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single provider by slug
 */
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get a single provider by ID
 */
export const getById = query({
  args: { id: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List providers with optional filters
 */
export const list = query({
  args: {
    category: v.optional(v.string()),
    country: v.optional(v.string()),
    verificationLevel: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("providers");

    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }

    if (args.featured) {
      q = q.withIndex("by_featured", (q) => q.eq("featured", true));
    }

    const limit = args.limit ?? 50;
    return await q.take(limit);
  },
});

/**
 * Search providers by name or service
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("providers").collect();
    const query = args.query.toLowerCase();

    return all.filter(
      (provider) =>
        provider.businessName.toLowerCase().includes(query) ||
        provider.description.toLowerCase().includes(query) ||
        (provider.services || []).some((s) => s.toLowerCase().includes(query))
    );
  },
});

/**
 * Get featured providers
 */
export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(args.limit ?? 10);
  },
});

/**
 * Get providers by category with stats
 */
export const getByCategory = query({
  args: {
    category: v.string(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("providers")
      .withIndex("by_category", (q) => q.eq("category", args.category));

    const providers = await q.collect();

    // Calculate stats
    const stats = {
      total: providers.length,
      avgRating:
        providers.reduce((sum, p) => sum + p.rating, 0) / providers.length || 0,
      verified: providers.filter((p) => p.verificationLevel === "verified")
        .length,
    };

    return { providers, stats };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new provider
 */
export const create = mutation({
  args: {
    businessName: v.string(),
    slug: v.string(),
    category: v.string(),
    description: v.string(),
    shortDescription: v.string(),
    country: v.optional(v.string()),
    regions: v.optional(v.array(v.string())),
    pricing: v.optional(
      v.object({
        type: v.string(),
        startingFrom: v.number(),
        currency: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check for duplicate slug
    const existing = await ctx.db
      .query("providers")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Provider with slug "${args.slug}" already exists`);
    }

    return await ctx.db.insert("providers", {
      ...args,
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      responseTime: "< 24 hours",
      verificationLevel: "unverified",
      badges: [],
      teamSize: 1,
      availableForUrgent: false,
      services: [],
      certifications: [],
      featured: false,
    });
  },
});

/**
 * Update a provider
 */
export const update = mutation({
  args: {
    id: v.id("providers"),
    businessName: v.optional(v.string()),
    description: v.optional(v.string()),
    pricing: v.optional(
      v.object({
        type: v.string(),
        startingFrom: v.number(),
        currency: v.string(),
      })
    ),
    services: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    teamSize: v.optional(v.number()),
    availableForUrgent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Provider not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Update provider rating
 */
export const updateRating = mutation({
  args: {
    id: v.id("providers"),
    newRating: v.number(),
  },
  handler: async (ctx, args) => {
    const provider = await ctx.db.get(args.id);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const newReviewCount = provider.reviewCount + 1;
    const newAvgRating =
      (provider.rating * provider.reviewCount + args.newRating) /
      newReviewCount;

    await ctx.db.patch(args.id, {
      rating: Math.round(newAvgRating * 10) / 10,
      reviewCount: newReviewCount,
    });

    return { rating: newAvgRating, reviewCount: newReviewCount };
  },
});

/**
 * Verify a provider
 */
export const verify = mutation({
  args: {
    id: v.id("providers"),
    level: v.string(), // "basic", "verified", "premium"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verificationLevel: args.level,
    });

    return { success: true, level: args.level };
  },
});

/**
 * Feature/unfeature a provider
 */
export const setFeatured = mutation({
  args: {
    id: v.id("providers"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      featured: args.featured,
    });

    return { success: true, featured: args.featured };
  },
});

/**
 * Add a badge to a provider
 */
export const addBadge = mutation({
  args: {
    id: v.id("providers"),
    badge: v.string(),
  },
  handler: async (ctx, args) => {
    const provider = await ctx.db.get(args.id);
    if (!provider) {
      throw new Error("Provider not found");
    }

    if (!provider.badges.includes(args.badge)) {
      await ctx.db.patch(args.id, {
        badges: [...provider.badges, args.badge],
      });
    }

    return { success: true };
  },
});

/**
 * Increment completed jobs count
 */
export const incrementJobs = mutation({
  args: { id: v.id("providers") },
  handler: async (ctx, args) => {
    const provider = await ctx.db.get(args.id);
    if (!provider) {
      throw new Error("Provider not found");
    }

    await ctx.db.patch(args.id, {
      completedJobs: provider.completedJobs + 1,
    });

    return provider.completedJobs + 1;
  },
});

/**
 * Delete a provider
 */
export const remove = mutation({
  args: { id: v.id("providers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample providers
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleProviders = [
      {
        businessName: "Sydney Conveyancing Experts",
        slug: "sydney-conveyancing-experts",
        category: "conveyancing",
        description:
          "Professional conveyancing services for property buyers and sellers in Sydney. Fixed fee, no hidden costs.",
        shortDescription: "Fixed-fee conveyancing in Sydney",
        country: "Australia",
        regions: ["Sydney", "NSW"],
        rating: 4.8,
        reviewCount: 156,
        completedJobs: 1200,
        responseTime: "< 2 hours",
        pricing: { type: "fixed", startingFrom: 800, currency: "AUD" },
        verificationLevel: "verified",
        badges: ["top-rated", "fast-response"],
        teamSize: 8,
        availableForUrgent: true,
        services: [
          "Property purchase",
          "Property sale",
          "Contract review",
          "Settlement",
        ],
        certifications: ["Licensed Conveyancer", "Law Society Member"],
        featured: true,
      },
      {
        businessName: "Elite Building Inspectors",
        slug: "elite-building-inspectors",
        category: "inspection",
        description:
          "Comprehensive pre-purchase building and pest inspections. Same-day reports with photos and recommendations.",
        shortDescription: "Same-day building inspections",
        country: "Australia",
        regions: ["Sydney", "Melbourne", "Brisbane"],
        rating: 4.9,
        reviewCount: 89,
        completedJobs: 850,
        responseTime: "< 4 hours",
        pricing: { type: "fixed", startingFrom: 450, currency: "AUD" },
        verificationLevel: "verified",
        badges: ["verified", "premium"],
        teamSize: 12,
        availableForUrgent: true,
        services: [
          "Pre-purchase inspection",
          "Building inspection",
          "Pest inspection",
          "Dilapidation report",
        ],
        certifications: ["Licensed Builder", "Pest License"],
        featured: true,
      },
      {
        businessName: "First Home Finance",
        slug: "first-home-finance",
        category: "finance",
        description:
          "Mortgage broking specializing in first home buyers. Access to 40+ lenders. Free initial consultation.",
        shortDescription: "First home buyer specialists",
        country: "Australia",
        regions: ["NSW", "VIC", "QLD"],
        rating: 4.6,
        reviewCount: 234,
        completedJobs: 1500,
        responseTime: "< 24 hours",
        pricing: { type: "free", startingFrom: 0, currency: "AUD" },
        verificationLevel: "verified",
        badges: ["top-rated"],
        teamSize: 15,
        availableForUrgent: false,
        services: [
          "Home loans",
          "Refinancing",
          "Investment loans",
          "Pre-approval",
        ],
        certifications: ["MFAA Accredited", "Credit License"],
        featured: false,
      },
    ];

    const ids = [];
    for (const provider of sampleProviders) {
      const id = await ctx.db.insert("providers", provider);
      ids.push(id);
    }

    return { inserted: ids.length, ids };
  },
});
