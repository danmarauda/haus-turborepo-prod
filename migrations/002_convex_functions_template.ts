/**
 * Migration 002: Convex Functions for New Tables
 * 
 * These are the query and mutation functions for the 9 new tables.
 * Copy these into packages/backend/convex/ as separate files or combine.
 */

// ============================================================================
// DUD REPORTS FUNCTIONS
// ============================================================================

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Queries ---

export const getDudReport = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dudReports")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listDudReports = query({
  args: {
    category: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("dudReports");
    
    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }
    
    if (args.country) {
      q = q.withIndex("by_country", (q) => q.eq("country", args.country));
    }
    
    const items = await q.take(args.limit ?? 50);
    return { items, cursor: null }; // Implement pagination as needed
  },
});

export const searchDudReports = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // Note: For full-text search, use Convex search indexes
    // This is a simple contains search
    const all = await ctx.db.query("dudReports").collect();
    return all.filter(r => 
      r.name.toLowerCase().includes(args.query.toLowerCase()) ||
      r.location.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

// --- Mutations ---

export const createDudReport = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    category: v.string(),
    location: v.string(),
    rating: v.number(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dudReports", {
      ...args,
      reviewCount: 0,
      issues: [],
      status: "active",
    });
  },
});

// ============================================================================
// PROVIDERS FUNCTIONS
// ============================================================================

export const getProvider = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listProviders = query({
  args: {
    category: v.optional(v.string()),
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
    
    return await q.take(args.limit ?? 50);
  },
});

export const createProvider = mutation({
  args: {
    businessName: v.string(),
    slug: v.string(),
    category: v.string(),
    description: v.string(),
    // ... other required fields
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("providers", {
      ...args,
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      teamSize: 1,
      badges: [],
      verificationLevel: "unverified",
    });
  },
});

// ============================================================================
// COMPASS LISTINGS FUNCTIONS
// ============================================================================

export const getCompassListing = query({
  args: { id: v.id("compassListings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchCompassListings = query({
  args: {
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    }),
    filters: v.optional(v.object({
      listingMode: v.optional(v.string()),
      propertyType: v.optional(v.string()),
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get all listings (in production, use spatial indexing)
    const all = await ctx.db.query("compassListings").collect();
    
    return all.filter(listing => {
      const lat = listing.coordinates.lat;
      const lng = listing.coordinates.lng;
      
      // Bounds check
      if (lat < args.bounds.south || lat > args.bounds.north) return false;
      if (lng < args.bounds.west || lng > args.bounds.east) return false;
      
      // Filter check
      if (args.filters) {
        if (args.filters.listingMode && listing.listingMode !== args.filters.listingMode) return false;
        if (args.filters.propertyType && listing.propertyType !== args.filters.propertyType) return false;
        if (args.filters.minPrice && listing.price < args.filters.minPrice) return false;
        if (args.filters.maxPrice && listing.price > args.filters.maxPrice) return false;
        if (args.filters.bedrooms && listing.bedrooms < args.filters.bedrooms) return false;
      }
      
      return true;
    });
  },
});

export const seedCompassListings = mutation({
  args: { listings: v.array(v.any()) },
  handler: async (ctx, args) => {
    const ids = [];
    for (const listing of args.listings) {
      const id = await ctx.db.insert("compassListings", listing);
      ids.push(id);
    }
    return ids;
  },
});

// ============================================================================
// MARKET CATEGORIES FUNCTIONS
// ============================================================================

export const getMarketCategory = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listMarketCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("marketCategories").collect();
  },
});

// ============================================================================
// USER PROGRESS FUNCTIONS (Gamification)
// ============================================================================

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const createUserProgress = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("userProgress", {
      userId: args.userId,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      completedAchievements: [],
      stats: {
        propertiesViewed: 0,
        searchesMade: 0,
        reportsGenerated: 0,
        documentsUploaded: 0,
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addXp = mutation({
  args: { userId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!progress) return null;
    
    const newXp = progress.xp + args.amount;
    const newLevel = Math.floor(newXp / 1000) + 1; // Simple level formula
    
    await ctx.db.patch(progress._id, {
      xp: newXp,
      level: newLevel,
      updatedAt: Date.now(),
    });
    
    return { newXp, newLevel };
  },
});

export const completeLesson = mutation({
  args: { userId: v.string(), lessonId: v.string(), xpReward: v.number() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!progress || progress.completedLessons.includes(args.lessonId)) {
      return null;
    }
    
    await ctx.db.patch(progress._id, {
      completedLessons: [...progress.completedLessons, args.lessonId],
      xp: progress.xp + args.xpReward,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});

// ============================================================================
// ACHIEVEMENTS FUNCTIONS
// ============================================================================

export const getAchievements = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("achievements");
    
    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }
    
    return await q.collect();
  },
});

export const seedAchievements = mutation({
  args: { achievements: v.array(v.any()) },
  handler: async (ctx, args) => {
    const ids = [];
    for (const achievement of args.achievements) {
      const id = await ctx.db.insert("achievements", achievement);
      ids.push(id);
    }
    return ids;
  },
});

// ============================================================================
// LESSONS FUNCTIONS
// ============================================================================

export const getLesson = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
  },
});

export const listLessons = query({
  args: {
    category: v.optional(v.string()),
    courseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("lessons");
    
    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }
    
    const lessons = await q.collect();
    
    if (args.courseId) {
      return lessons.filter(l => l.courseId === args.courseId);
    }
    
    return lessons;
  },
});

// ============================================================================
// TENDERS FUNCTIONS
// ============================================================================

export const getTender = query({
  args: { id: v.id("tenders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listTenders = query({
  args: {
    status: v.optional(v.string()),
    clientName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("tenders");
    
    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    
    if (args.clientName) {
      q = q.withIndex("by_clientName", (q) => q.eq("clientName", args.clientName));
    }
    
    return await q.collect();
  },
});

export const createTender = mutation({
  args: {
    name: v.string(),
    clientName: v.string(),
    deadline: v.float64(),
    value: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tenders", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTenderDocuments = query({
  args: { tenderId: v.id("tenders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenderDocuments")
      .withIndex("by_tenderId", (q) => q.eq("tenderId", args.tenderId))
      .collect();
  },
});

export const addTenderDocument = mutation({
  args: {
    tenderId: v.id("tenders"),
    name: v.string(),
    type: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tenderDocuments", {
      ...args,
      uploadedAt: Date.now(),
    });
  },
});
