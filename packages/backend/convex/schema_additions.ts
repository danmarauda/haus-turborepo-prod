/**
 * Schema Additions for HAUS Migration
 * 
 * Copy the table definitions from this file into schema.ts
 * Place them before the closing brace of defineSchema()
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// 1. DUD Reports (Trust/Safety Database)
// ============================================================================
export const dudReportsTable = defineTable({
  reportNumber: v.optional(v.number()),
  name: v.string(),
  slug: v.string(),
  category: v.string(),
  country: v.optional(v.string()),
  region: v.optional(v.string()),
  location: v.string(),
  rating: v.number(),
  reviewCount: v.number(),
  headline: v.optional(v.string()),
  riskScore: v.optional(v.number()),
  riskLevel: v.optional(v.string()),
  issues: v.array(v.string()),
  lastReported: v.string(),
  status: v.string(),
  regulatorRefs: v.optional(
    v.array(v.object({ name: v.string(), url: v.optional(v.string()) }))
  ),
  nextSteps: v.optional(
    v.array(v.object({ title: v.string(), description: v.string() }))
  ),
  evidence: v.optional(
    v.array(
      v.object({
        id: v.optional(v.string()),
        dateLabel: v.string(),
        title: v.string(),
        description: v.string(),
        sourceLabel: v.string(),
        confidence: v.string(),
      })
    )
  ),
  redFlags: v.optional(
    v.array(
      v.object({ label: v.string(), severity: v.string(), icon: v.string() })
    )
  ),
  providerIds: v.optional(v.array(v.id("providers"))),
  highProfile: v.optional(v.boolean()),
  caseStudy: v.optional(
    v.object({
      title: v.string(),
      damages: v.string(),
      inspector: v.string(),
      videoViews: v.string(),
      defects: v.number(),
    })
  ),
  blueKeyProperties: v.optional(
    v.array(
      v.object({
        projectName: v.string(),
        location: v.string(),
        issues: v.array(v.string()),
        rating: v.number(),
      })
    )
  ),
})
  .index("by_slug", ["slug"])
  .index("by_report_number", ["reportNumber"])
  .index("by_country", ["country"])
  .index("by_region", ["region"])
  .index("by_category", ["category"])
  .index("by_category_country", ["category", "country"])
  .index("by_high_profile", ["highProfile"]);

// ============================================================================
// 2. Providers (Marketplace Service Providers)
// ============================================================================
export const providersTable = defineTable({
  businessName: v.string(),
  slug: v.string(),
  category: v.string(),
  description: v.string(),
  shortDescription: v.string(),
  country: v.optional(v.string()),
  regions: v.optional(v.array(v.string())),
  rating: v.number(),
  reviewCount: v.number(),
  completedJobs: v.number(),
  responseTime: v.string(),
  pricing: v.optional(
    v.object({
      type: v.string(),
      startingFrom: v.number(),
      currency: v.string(),
    })
  ),
  verificationLevel: v.string(),
  badges: v.array(v.string()),
  featured: v.optional(v.boolean()),
  teamSize: v.number(),
  availableForUrgent: v.optional(v.boolean()),
  services: v.optional(v.array(v.string())),
  certifications: v.optional(v.array(v.string())),
})
  .index("by_slug", ["slug"])
  .index("by_category", ["category"])
  .index("by_country", ["country"])
  .index("by_category_country", ["category", "country"])
  .index("by_verification", ["verificationLevel"])
  .index("by_featured", ["featured"]);

// ============================================================================
// 3. Compass Listings (Map-based Property Search)
// ============================================================================
export const compassListingsTable = defineTable({
  title: v.string(),
  address: v.string(),
  suburb: v.string(),
  postcode: v.string(),
  state: v.string(),
  coordinates: v.object({ lat: v.number(), lng: v.number() }),
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
  isFavorite: v.boolean(),
  isNew: v.boolean(),
  isPremium: v.boolean(),
  rating: v.optional(v.number()),
  reviewCount: v.optional(v.number()),
  daysOnMarket: v.number(),
  inspectionTimes: v.optional(v.array(v.string())),
  auctionDate: v.optional(v.string()),
})
  .index("by_listingMode", ["listingMode"])
  .index("by_propertyType", ["propertyType"])
  .index("by_suburb", ["suburb"])
  .index("by_price", ["price"]);

// ============================================================================
// 4. Market Categories
// ============================================================================
export const marketCategoriesTable = defineTable({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  icon: v.string(),
  description: v.string(),
  stats: v.optional(
    v.object({
      providers: v.number(),
      avgRating: v.number(),
      completedJobs: v.number(),
    })
  ),
}).index("by_slug", ["slug"]);

// ============================================================================
// 5. User Progress (Gamification)
// ============================================================================
export const userProgressTable = defineTable({
  userId: v.string(),
  xp: v.number(),
  level: v.number(),
  streak: v.number(),
  lastActiveDate: v.string(),
  completedLessons: v.array(v.string()),
  completedAchievements: v.array(v.string()),
  stats: v.optional(
    v.object({
      propertiesViewed: v.number(),
      searchesMade: v.number(),
      reportsGenerated: v.number(),
      documentsUploaded: v.number(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]);

// ============================================================================
// 6. Achievements
// ============================================================================
export const achievementsTable = defineTable({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  icon: v.string(),
  xpReward: v.number(),
  category: v.string(),
  requirement: v.object({
    type: v.string(),
    target: v.number(),
    metric: v.optional(v.string()),
  }),
}).index("by_category", ["category"]);

// ============================================================================
// 7. Lessons (Academy Content)
// ============================================================================
export const lessonsTable = defineTable({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  category: v.string(),
  duration: v.number(),
  xpReward: v.number(),
  order: v.number(),
  content: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  courseId: v.optional(v.string()),
})
  .index("by_category", ["category"])
  .index("by_order", ["order"]);

// ============================================================================
// 8. Tenders (Document Management)
// ============================================================================
export const tendersTable = defineTable({
  name: v.string(),
  clientName: v.string(),
  deadline: v.float64(),
  value: v.optional(v.float64()),
  status: v.optional(v.string()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_clientName", ["clientName"])
  .index("by_deadline", ["deadline"]);

// ============================================================================
// 9. Tender Documents
// ============================================================================
export const tenderDocumentsTable = defineTable({
  name: v.string(),
  tenderId: v.id("tenders"),
  type: v.string(),
  content: v.string(),
  fileUrl: v.optional(v.string()),
  storageId: v.optional(v.id("_storage")),
  uploadedAt: v.number(),
})
  .index("by_tenderId", ["tenderId"])
  .index("by_type", ["type"]);
