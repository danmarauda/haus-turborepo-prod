/**
 * Market Categories - Marketplace Category Functions
 *
 * Query and mutation functions for marketplace service categories.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single market category by slug
 */
export const getCategory = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * List all market categories with optional limit
 */
export const listCategories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("marketCategories").take(args.limit ?? 100);
    return results;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new market category
 */
export const createCategory = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate slug
    const existing = await ctx.db
      .query("marketCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Category with slug "${args.slug}" already exists`);
    }

    return await ctx.db.insert("marketCategories", {
      ...args,
      stats: {
        providers: 0,
        avgRating: 0,
        completedJobs: 0,
      },
    });
  },
});

/**
 * Update category stats
 */
export const updateCategoryStats = mutation({
  args: {
    id: v.id("marketCategories"),
    stats: v.object({
      providers: v.number(),
      avgRating: v.number(),
      completedJobs: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(args.id, { stats: args.stats });
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample market categories
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleCategories = [
      {
        id: "cat-conveyancing",
        name: "Conveyancing",
        slug: "conveyancing",
        icon: "Scale",
        description: "Legal services for property transactions including contract review and settlement.",
      },
      {
        id: "cat-inspection",
        name: "Building Inspection",
        slug: "inspection",
        icon: "Search",
        description: "Pre-purchase building and pest inspections to identify issues before you buy.",
      },
      {
        id: "cat-finance",
        name: "Mortgage & Finance",
        slug: "finance",
        icon: "DollarSign",
        description: "Mortgage brokers and financial advisors to help secure your property loan.",
      },
      {
        id: "cat-legal",
        name: "Property Law",
        slug: "legal",
        icon: "Gavel",
        description: "Specialist property lawyers for complex transactions and disputes.",
      },
      {
        id: "cat-insurance",
        name: "Insurance",
        slug: "insurance",
        icon: "Shield",
        description: "Home, contents, and landlord insurance for your property protection.",
      },
      {
        id: "cat-removals",
        name: "Removalists",
        slug: "removals",
        icon: "Truck",
        description: "Professional moving services for local and interstate relocations.",
      },
      {
        id: "cat-cleaning",
        name: "Cleaning Services",
        slug: "cleaning",
        icon: "Sparkles",
        description: "End of lease, pre-sale, and regular property cleaning services.",
      },
      {
        id: "cat-renovation",
        name: "Renovations",
        slug: "renovation",
        icon: "Hammer",
        description: "Builders and tradespeople for property improvements and renovations.",
      },
    ];

    const ids = [];
    for (const category of sampleCategories) {
      const existing = await ctx.db
        .query("marketCategories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("marketCategories", {
          ...category,
          stats: {
            providers: 0,
            avgRating: 0,
            completedJobs: 0,
          },
        });
        ids.push(id);
      }
    }

    return { inserted: ids.length, ids };
  },
});
