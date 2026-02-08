/**
 * Compass Listings - Map-based Property Search Functions
 *
 * Query and mutation functions for map-based property listings
 * Optimized for map views with geospatial coordinates.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single compass listing by ID
 */
export const get = query({
  args: { id: v.id("compassListings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a single compass listing by ID (alias for get)
 */
export const getById = query({
  args: { id: v.id("compassListings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List compass listings with optional filters
 */
export const list = query({
  args: {
    listingMode: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    suburb: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("compassListings");

    // Apply listing mode filter (rent/sale)
    if (args.listingMode) {
      q = q.withIndex("by_listingMode", (q) => q.eq("listingMode", args.listingMode));
    }

    // Apply property type filter
    if (args.propertyType) {
      q = q.withIndex("by_propertyType", (q) => q.eq("propertyType", args.propertyType));
    }

    // Apply suburb filter
    if (args.suburb) {
      q = q.withIndex("by_suburb", (q) => q.eq("suburb", args.suburb));
    }

    const limit = args.limit ?? 100;
    const results = await q.take(limit);

    // Client-side price filtering
    return results.filter((listing) => {
      if (args.minPrice && listing.price < args.minPrice) return false;
      if (args.maxPrice && listing.price > args.maxPrice) return false;
      return true;
    });
  },
});

/**
 * Get listings by suburb
 */
export const getBySuburb = query({
  args: {
    suburb: v.string(),
    listingMode: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("compassListings")
      .withIndex("by_suburb", (q) => q.eq("suburb", args.suburb));

    const results = await q.collect();

    // Apply additional filters client-side
    return results
      .filter((listing) => {
        if (args.listingMode && listing.listingMode !== args.listingMode) return false;
        if (args.propertyType && listing.propertyType !== args.propertyType) return false;
        return true;
      })
      .slice(0, args.limit ?? 50);
  },
});

/**
 * Search listings by address, suburb, or title
 * Note: For production, consider using Convex search indexes
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const results = await ctx.db.query("compassListings").collect();

    return results
      .filter(
        (listing) =>
          listing.address.toLowerCase().includes(searchTerm) ||
          listing.suburb.toLowerCase().includes(searchTerm) ||
          listing.title.toLowerCase().includes(searchTerm)
      )
      .slice(0, args.limit ?? 20);
  },
});

/**
 * Get listings by bounding box (for map view)
 * Uses client-side filtering for coordinates
 */
export const searchByBounds = query({
  args: {
    north: v.number(),
    south: v.number(),
    east: v.number(),
    west: v.number(),
    listingMode: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all listings and filter by bounds
    // In production, consider using a spatial index or grid-based approach
    let q = ctx.db.query("compassListings");

    if (args.listingMode) {
      q = q.withIndex("by_listingMode", (q) => q.eq("listingMode", args.listingMode));
    }

    const results = await q.take(args.limit ?? 500);

    // Filter by bounding box
    return results.filter((listing) => {
      const lat = listing.coordinates.lat;
      const lng = listing.coordinates.lng;
      const inBounds = lat <= args.north && lat >= args.south && lng <= args.east && lng >= args.west;

      if (!inBounds) return false;
      if (args.propertyType && listing.propertyType !== args.propertyType) return false;

      return true;
    });
  },
});

/**
 * Get listings near a point with radius
 */
export const getNearby = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radiusKm: v.optional(v.number()),
    listingMode: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm ?? 5;
    const limit = args.limit ?? 50;

    // Get listings and filter by distance
    let q = ctx.db.query("compassListings");

    if (args.listingMode) {
      q = q.withIndex("by_listingMode", (q) => q.eq("listingMode", args.listingMode));
    }

    const results = await q.collect();

    // Calculate distance and filter
    const nearby = results
      .map((listing) => {
        const distance = calculateDistance(
          args.lat,
          args.lng,
          listing.coordinates.lat,
          listing.coordinates.lng
        );
        return { ...listing, distance };
      })
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearby;
  },
});

/**
 * Get premium/featured listings
 */
export const getFeatured = query({
  args: {
    limit: v.optional(v.number()),
    listingMode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("compassListings").collect();

    return results
      .filter((listing) => {
        if (!listing.isPremium) return false;
        if (args.listingMode && listing.listingMode !== args.listingMode) return false;
        return true;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, args.limit ?? 10);
  },
});

/**
 * Get new listings
 */
export const getNew = query({
  args: {
    limit: v.optional(v.number()),
    daysThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("compassListings").collect();

    return results
      .filter((listing) => listing.isNew)
      .slice(0, args.limit ?? 20);
  },
});

/**
 * Get listings by agent name
 */
export const getByAgent = query({
  args: {
    agentName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("compassListings").collect();

    return results
      .filter((listing) => listing.agent.name.toLowerCase() === args.agentName.toLowerCase())
      .slice(0, args.limit ?? 50);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new compass listing
 */
export const create = mutation({
  args: {
    title: v.string(),
    address: v.string(),
    suburb: v.string(),
    postcode: v.string(),
    state: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    price: v.number(),
    priceLabel: v.string(),
    listingMode: v.string(),
    propertyType: v.string(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    parkingSpaces: v.number(),
    landSize: v.optional(v.number()),
    images: v.array(v.string()),
    features: v.array(v.string()),
    agent: v.object({
      name: v.string(),
      agency: v.string(),
      avatar: v.string(),
      phone: v.string(),
    }),
    inspectionTimes: v.optional(v.array(v.string())),
    auctionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("compassListings", {
      ...args,
      isFavorite: false,
      isNew: true,
      isPremium: false,
      rating: 0,
      reviewCount: 0,
      daysOnMarket: 0,
    });
  },
});

/**
 * Update a compass listing
 */
export const update = mutation({
  args: {
    id: v.id("compassListings"),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    suburb: v.optional(v.string()),
    price: v.optional(v.number()),
    priceLabel: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    agent: v.optional(
      v.object({
        name: v.string(),
        agency: v.string(),
        avatar: v.string(),
        phone: v.string(),
      })
    ),
    isFavorite: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    inspectionTimes: v.optional(v.array(v.string())),
    auctionDate: v.optional(v.string()),
    daysOnMarket: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

/**
 * Toggle favorite status
 */
export const toggleFavorite = mutation({
  args: {
    id: v.id("compassListings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(args.id, {
      isFavorite: !listing.isFavorite,
    });

    return { isFavorite: !listing.isFavorite };
  },
});

/**
 * Mark listing as no longer new (after viewing)
 */
export const markAsSeen = mutation({
  args: {
    id: v.id("compassListings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(args.id, {
      isNew: false,
    });
    return { success: true };
  },
});

/**
 * Delete a compass listing
 */
export const remove = mutation({
  args: { id: v.id("compassListings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Seed with sample compass listings
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleListings = [
      {
        title: "Modern Family Home",
        address: "123 Bondi Road",
        suburb: "Bondi",
        postcode: "2026",
        state: "NSW",
        coordinates: { lat: -33.8936, lng: 151.2744 },
        price: 2500000,
        priceLabel: "$2,500,000",
        listingMode: "sale",
        propertyType: "house",
        bedrooms: 4,
        bathrooms: 2,
        parkingSpaces: 2,
        landSize: 450,
        images: ["https://example.com/image1.jpg"],
        features: ["pool", "garden", "aircon", "garage"],
        agent: {
          name: "John Smith",
          agency: "Bondi Real Estate",
          avatar: "https://example.com/avatar1.jpg",
          phone: "+61 2 1234 5678",
        },
        isFavorite: false,
        isNew: true,
        isPremium: true,
        rating: 4.5,
        reviewCount: 12,
        daysOnMarket: 5,
        inspectionTimes: ["Saturday 10:00 AM", "Saturday 2:00 PM"],
      },
      {
        title: "Luxury Beachfront Apartment",
        address: "45 Beach Road",
        suburb: "Bondi Beach",
        postcode: "2026",
        state: "NSW",
        coordinates: { lat: -33.8915, lng: 151.2767 },
        price: 1800000,
        priceLabel: "$1,800,000",
        listingMode: "sale",
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        landSize: undefined,
        images: ["https://example.com/image2.jpg"],
        features: ["ocean view", "gym", "concierge", "swimming pool"],
        agent: {
          name: "Sarah Johnson",
          agency: "Coastal Properties",
          avatar: "https://example.com/avatar2.jpg",
          phone: "+61 2 9876 5432",
        },
        isFavorite: false,
        isNew: false,
        isPremium: true,
        rating: 4.8,
        reviewCount: 8,
        daysOnMarket: 15,
        auctionDate: "2026-03-15T14:00:00Z",
      },
      {
        title: "Charming Terrace House",
        address: "78 Paddington Street",
        suburb: "Paddington",
        postcode: "2021",
        state: "NSW",
        coordinates: { lat: -33.8842, lng: 151.2285 },
        price: 3200000,
        priceLabel: "$3,200,000",
        listingMode: "sale",
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 1,
        landSize: 220,
        images: ["https://example.com/image3.jpg"],
        features: ["heritage", "renovated", "courtyard", "fireplace"],
        agent: {
          name: "Michael Chen",
          agency: "Paddington Premier",
          avatar: "https://example.com/avatar3.jpg",
          phone: "+61 2 4567 8901",
        },
        isFavorite: false,
        isNew: true,
        isPremium: false,
        rating: 4.2,
        reviewCount: 5,
        daysOnMarket: 3,
        inspectionTimes: ["Saturday 11:00 AM"],
      },
      {
        title: "Spacious Family Rental",
        address: "256 Queen Street",
        suburb: "Rose Bay",
        postcode: "2029",
        state: "NSW",
        coordinates: { lat: -33.8731, lng: 151.2655 },
        price: 1200,
        priceLabel: "$1,200/week",
        listingMode: "rent",
        propertyType: "house",
        bedrooms: 4,
        bathrooms: 3,
        parkingSpaces: 2,
        landSize: 600,
        images: ["https://example.com/image4.jpg"],
        features: ["pool", "modern kitchen", "pet friendly", "garden"],
        agent: {
          name: "Emma Williams",
          agency: "Rose Bay Realty",
          avatar: "https://example.com/avatar4.jpg",
          phone: "+61 2 7890 1234",
        },
        isFavorite: false,
        isNew: true,
        isPremium: true,
        rating: 4.6,
        reviewCount: 18,
        daysOnMarket: 2,
        inspectionTimes: ["Wednesday 5:00 PM", "Saturday 10:00 AM"],
      },
      {
        title: "Modern Studio Apartment",
        address: "42 Market Street",
        suburb: "Surry Hills",
        postcode: "2010",
        state: "NSW",
        coordinates: { lat: -33.8798, lng: 151.2093 },
        price: 550,
        priceLabel: "$550/week",
        listingMode: "rent",
        propertyType: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        parkingSpaces: 0,
        landSize: undefined,
        images: ["https://example.com/image5.jpg"],
        features: ["furnished", "balcony", "gym access", "public transport"],
        agent: {
          name: "David Lee",
          agency: "Urban Living",
          avatar: "https://example.com/avatar5.jpg",
          phone: "+61 2 3456 7890",
        },
        isFavorite: false,
        isNew: false,
        isPremium: false,
        rating: 3.9,
        reviewCount: 24,
        daysOnMarket: 21,
      },
      {
        title: "Waterfront Mansion",
        address: "1 Harbour View",
        suburb: "Vaucluse",
        postcode: "2030",
        state: "NSW",
        coordinates: { lat: -33.8555, lng: 151.2758 },
        price: 8500000,
        priceLabel: "$8,500,000",
        listingMode: "sale",
        propertyType: "house",
        bedrooms: 6,
        bathrooms: 5,
        parkingSpaces: 4,
        landSize: 1200,
        images: ["https://example.com/image6.jpg"],
        features: ["waterfront", "pool", "tennis court", "wine cellar", "home cinema"],
        agent: {
          name: "Victoria Sterling",
          agency: "Luxury Estates",
          avatar: "https://example.com/avatar6.jpg",
          phone: "+61 2 9999 8888",
        },
        isFavorite: false,
        isNew: true,
        isPremium: true,
        rating: 5.0,
        reviewCount: 3,
        daysOnMarket: 1,
        inspectionTimes: ["By Appointment"],
      },
      {
        title: "Renovated Art Deco Unit",
        address: "15 Hall Street",
        suburb: "Bondi Beach",
        postcode: "2026",
        state: "NSW",
        coordinates: { lat: -33.8895, lng: 151.2725 },
        price: 950,
        priceLabel: "$950/week",
        listingMode: "rent",
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        parkingSpaces: 1,
        landSize: undefined,
        images: ["https://example.com/image7.jpg"],
        features: ["art deco", "renovated", "beach proximity", "sunroom"],
        agent: {
          name: "Sarah Johnson",
          agency: "Coastal Properties",
          avatar: "https://example.com/avatar2.jpg",
          phone: "+61 2 9876 5432",
        },
        isFavorite: false,
        isNew: true,
        isPremium: false,
        rating: 4.3,
        reviewCount: 11,
        daysOnMarket: 4,
        inspectionTimes: ["Thursday 6:00 PM", "Saturday 12:00 PM"],
      },
      {
        title: "Contemporary Townhouse",
        address: "33 Glenmore Road",
        suburb: "Paddington",
        postcode: "2021",
        state: "NSW",
        coordinates: { lat: -33.8825, lng: 151.2305 },
        price: 2100000,
        priceLabel: "$2,100,000",
        listingMode: "sale",
        propertyType: "townhouse",
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 2,
        landSize: 180,
        images: ["https://example.com/image8.jpg"],
        features: ["modern", "rooftop terrace", "study", "double garage"],
        agent: {
          name: "Michael Chen",
          agency: "Paddington Premier",
          avatar: "https://example.com/avatar3.jpg",
          phone: "+61 2 4567 8901",
        },
        isFavorite: false,
        isNew: false,
        isPremium: true,
        rating: 4.7,
        reviewCount: 15,
        daysOnMarket: 12,
        auctionDate: "2026-03-22T11:00:00Z",
      },
    ];

    const ids = [];
    for (const listing of sampleListings) {
      const id = await ctx.db.insert("compassListings", listing);
      ids.push(id);
    }

    return { inserted: ids.length, ids };
  },
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
