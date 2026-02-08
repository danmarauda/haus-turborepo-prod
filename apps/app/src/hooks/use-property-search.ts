/**
 * Property Search Hook
 *
 * Fetches real property data from Convex instead of using mock data.
 * Uses reactive state management for filters, pagination, and loading states.
 *
 * @module hooks/use-property-search
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { useConvex } from "convex/react"
import { api } from "@v1/backend/convex/_generated/api"
import type { Id } from "@v1/backend/convex/_generated/dataModel"
import type { Property, SearchParameters } from "../types/property"

// Re-export types for convenience
export type { Property, SearchParameters }

// Extended filters interface for UI state
// Note: We omit fields that have different types in the UI vs SearchParameters
export interface Filters extends Omit<SearchParameters, 'amenities' | 'listingType'> {
  /** Listing type - includes "all" for UI convenience */
  listingType?: "all" | "for-sale" | "for-rent" | "sold" | "off-market"
  /** Sort option */
  sortBy?: "newest" | "price-low" | "price-high" | "beds-high" | "size-high" | "relevance"
  /** Page number */
  page?: number
  /** Items per page */
  pageSize?: number
  /** Amenities filter */
  amenities?: string[]
  /** HOA fees filter */
  hoaFees?: {
    max?: number
  }
  /** Property tax filter */
  propertyTax?: {
    max?: number
  }
  /** Open house scheduled filter */
  openHouseScheduled?: boolean
}

// Property status mapping between UI and backend
const STATUS_MAPPING: Record<string, "active" | "sold" | "leased" | "withdrawn" | "off_market" | undefined> = {
  "for-sale": "active",
  "for-rent": "active",
  "sold": "sold",
  "off-market": "off_market",
}

// Property type mapping between UI and backend
const PROPERTY_TYPE_MAPPING: Record<string, "house" | "apartment" | "townhouse" | "unit" | "land" | "studio" | undefined> = {
  "house": "house",
  "apartment": "apartment",
  "condo": "apartment",
  "townhouse": "townhouse",
  "loft": "apartment",
  "studio": "studio",
  "penthouse": "apartment",
  "duplex": "house",
  "land": "land",
  "commercial": undefined,
}

// ============================================================================
// Types
// ============================================================================

export interface PropertySearchResult {
  /** List of properties matching the search criteria */
  properties: Property[]
  /** Total number of matching properties */
  totalCount: number
  /** Current page number */
  page: number
  /** Number of results per page */
  pageSize: number
  /** Whether there are more results */
  hasMore: boolean
  /** Cursor for next page (for Convex pagination) */
  nextCursor?: string
}

export interface UsePropertySearchReturn {
  /** Current search results */
  data: Property[]
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Trigger a search with current or new filters */
  search: (filters?: Partial<Filters>) => Promise<void>
  /** Current filters */
  filters: Filters
  /** Update filters (merges with current) */
  updateFilters: (filters: Partial<Filters>) => void
  /** Reset filters to defaults */
  resetFilters: () => void
  /** Pagination info */
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
  }
  /** Set page number */
  setPage: (page: number) => Promise<void>
  /** Get a single property by ID */
  getProperty: (id: string) => Promise<Property | null>
  /** Get recent listings */
  getRecent: (limit?: number, propertyType?: string) => Promise<Property[]>
  /** Get listings by suburb */
  getBySuburb: (suburb: string, limit?: number) => Promise<Property[]>
  /** Get listings by external listing ID */
  getByListingId: (listingId: string) => Promise<Property | null>
  /** Get featured listings */
  getFeatured: (limit?: number) => Promise<Property[]>
}

/** Convex property listing document type (from schema) */
interface ConvexPropertyListing {
  _id: Id<"propertyListings">
  _creationTime: number
  listingId: string
  externalId?: string
  source?: string
  address: string
  suburb: string
  state: string
  postcode: string
  propertyType: "house" | "apartment" | "townhouse" | "unit" | "land" | "studio"
  bedrooms?: number
  bathrooms?: number
  carSpaces?: number
  landSize?: number
  buildingSize?: number
  price?: number
  priceText?: string
  priceRangeMin?: number
  priceRangeMax?: number
  headline?: string
  description?: string
  features?: string[]
  indoorFeatures?: string[]
  outdoorFeatures?: string[]
  images?: string[]
  floorplans?: string[]
  videos?: string[]
  mainImage?: string
  agentName?: string
  agentPhone?: string
  agentEmail?: string
  agencyName?: string
  agencyLogo?: string
  latitude?: number
  longitude?: number
  status: "active" | "sold" | "leased" | "withdrawn" | "off_market"
  listingDate?: number
  soldDate?: number
  soldPrice?: number
  metadata?: Record<string, unknown>
  rawData?: Record<string, unknown>
  fetchedAt: number
  updatedAt: number
  lastSyncedAt?: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a Convex property listing document to the UI Property format
 */
function convertToProperty(listing: ConvexPropertyListing): Property {
  // Build features array from indoor and outdoor features
  const allFeatures = [
    ...(listing.indoorFeatures || []),
    ...(listing.outdoorFeatures || []),
    ...(listing.features || []),
  ]

  // Determine listing type based on status and price text
  let listingType: Property["listingType"] = "for-sale"
  if (listing.status === "leased") {
    listingType = "for-rent"
  } else if (listing.status === "sold") {
    listingType = "sold"
  } else if (listing.priceText?.toLowerCase().includes("week") || listing.priceText?.toLowerCase().includes("pw")) {
    listingType = "for-rent"
  }

  // Build lastPriceChange if sold info available
  let lastPriceChange: Property["lastPriceChange"]
  if (listing.soldPrice && listing.soldDate) {
    lastPriceChange = {
      date: new Date(listing.soldDate).toISOString(),
      previousPrice: listing.price || listing.soldPrice,
      currentPrice: listing.soldPrice,
    }
  }

  return {
    id: listing._id,
    title: listing.headline || `${listing.bedrooms || "?"} Bed ${listing.propertyType} in ${listing.suburb}`,
    description: listing.description || "",
    location: `${listing.address}, ${listing.suburb}, ${listing.state} ${listing.postcode}`,
    price: listing.price || 0,
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    propertyType: listing.propertyType,
    // Handle both images array and legacy imageUrl
    images: listing.images?.length ? listing.images : listing.mainImage ? [listing.mainImage] : [],
    imageUrl: listing.mainImage || listing.images?.[0],
    features: allFeatures,
    amenities: allFeatures,
    agent: listing.agentName
      ? {
          name: listing.agentName,
          phone: listing.agentPhone,
          email: listing.agentEmail,
        }
      : undefined,
    listingType,
    lastPriceChange,
    squareFootage: listing.buildingSize,
    lotSize: listing.landSize,
  }
}

/**
 * Build search args for Convex query from UI filters
 */
function buildSearchArgs(filters: Filters) {
  const args: {
    suburb?: string
    state?: string
    propertyType?: "house" | "apartment" | "townhouse" | "unit" | "land" | "studio"
    status?: "active" | "sold" | "leased" | "withdrawn" | "off_market"
    minPrice?: number
    maxPrice?: number
    minBedrooms?: number
    maxBedrooms?: number
    source?: string
    limit?: number
    cursor?: string
  } = {}

  // Location filter - split into suburb and state if possible
  if (filters.location) {
    const parts = filters.location.split(",").map((p) => p.trim())
    if (parts.length >= 2) {
      args.suburb = parts[0]
      // Try to extract state from second part (e.g., "NSW" or "Sydney NSW")
      const stateMatch = parts[1]?.match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i)
      if (stateMatch) {
        args.state = stateMatch[1]!.toUpperCase()
      }
    } else {
      args.suburb = filters.location
    }
  }

  // Property type
  if (filters.propertyType) {
    args.propertyType = PROPERTY_TYPE_MAPPING[filters.propertyType]
  }

  // Listing type (maps to status)
  if (filters.listingType && filters.listingType !== "all") {
    args.status = STATUS_MAPPING[filters.listingType]
  }

  // Price range
  if (filters.priceRange) {
    args.minPrice = filters.priceRange.min
    args.maxPrice = filters.priceRange.max
  }

  // Bedrooms
  if (filters.bedrooms) {
    args.minBedrooms = filters.bedrooms
    // Don't set max bedrooms to allow for more flexibility
  }

  // Pagination
  args.limit = filters.pageSize || 24

  return args
}

// Default filters
const defaultFilters: Filters = {
  page: 1,
  pageSize: 24,
  sortBy: "newest",
  listingType: "all",
}

// ============================================================================
// Hook
// ============================================================================

export function usePropertySearch(): UsePropertySearchReturn {
  const convex = useConvex()

  // State management
  const [data, setData] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 24,
    totalCount: 0,
    hasMore: false,
  })

  /**
   * Search for properties with filters
   */
  const doSearch = useCallback(
    async (searchFilters: Filters): Promise<PropertySearchResult> => {
      const currentPage = searchFilters.page || 1
      const currentPageSize = searchFilters.pageSize || 24
      const sortBy = searchFilters.sortBy || "newest"

      const args = buildSearchArgs(searchFilters)

      // Call Convex search query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await convex.query(api.propertyListings.search, {
        suburb: args.suburb,
        state: args.state,
        propertyType: args.propertyType,
        status: args.status,
        minPrice: args.minPrice,
        maxPrice: args.maxPrice,
        minBedrooms: args.minBedrooms,
        maxBedrooms: args.maxBedrooms,
        source: args.source,
        limit: currentPageSize,
        cursor: currentPage > 1 ? String((currentPage - 1) * currentPageSize) : undefined,
      })

      // Handle paginated response format
      const results: ConvexPropertyListing[] = Array.isArray(response) ? response : response?.listings || []

      // Convert to UI format
      const properties = results.map((listing: ConvexPropertyListing) => convertToProperty(listing))

      // Apply client-side sorting
      let sortedProperties = [...properties]
      switch (sortBy) {
        case "price-low":
          sortedProperties.sort((a, b) => (a.price || 0) - (b.price || 0))
          break
        case "price-high":
          sortedProperties.sort((a, b) => (b.price || 0) - (a.price || 0))
          break
        case "beds-high":
          sortedProperties.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0))
          break
        case "newest":
        case "relevance":
        default:
          // Keep default order from Convex
          break
      }

      return {
        properties: sortedProperties,
        totalCount: sortedProperties.length,
        page: currentPage,
        pageSize: currentPageSize,
        hasMore: Array.isArray(response) ? results.length === currentPageSize : (response?.hasMore ?? false),
      }
    },
    [convex]
  )

  /**
   * Trigger a search with current or new filters
   */
  const search = useCallback(
    async (newFilters?: Partial<Filters>) => {
      setIsLoading(true)
      setError(null)

      try {
        const mergedFilters = newFilters ? { ...filters, ...newFilters } : filters
        const result = await doSearch(mergedFilters)

        setData(result.properties)
        setPagination({
          page: result.page,
          pageSize: result.pageSize,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
        })

        if (newFilters) {
          setFilters(mergedFilters)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Search failed"))
        console.error("Property search failed:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [filters, doSearch]
  )

  /**
   * Update filters (merges with current)
   */
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...newFilters }))
  }, [])

  /**
   * Set page number
   */
  const setPage = useCallback(
    async (page: number) => {
      await search({ page })
    },
    [search]
  )

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setPagination({
      page: 1,
      pageSize: 24,
      totalCount: 0,
      hasMore: false,
    })
  }, [])

  /**
   * Get a single property by its Convex ID
   */
  const getProperty = useCallback(
    async (id: string): Promise<Property | null> => {
      const listing = await convex.query(api.propertyListings.get, {
        id: id as Id<"propertyListings">,
      })

      if (!listing) {
        return null
      }

      return convertToProperty(listing as ConvexPropertyListing)
    },
    [convex]
  )

  /**
   * Get a property by its external listing ID
   */
  const getByListingId = useCallback(
    async (listingId: string): Promise<Property | null> => {
      const listing = await convex.query(api.propertyListings.getByListingId, {
        listingId,
      })

      if (!listing) {
        return null
      }

      return convertToProperty(listing as ConvexPropertyListing)
    },
    [convex]
  )

  /**
   * Get recent listings
   */
  const getRecent = useCallback(
    async (limit = 20, propertyType?: string): Promise<Property[]> => {
      const mappedType = propertyType ? PROPERTY_TYPE_MAPPING[propertyType] : undefined

      const response = await convex.query(api.propertyListings.getRecent, {
        limit,
        propertyType: mappedType,
        status: "active",
      })

      const results = Array.isArray(response) ? response : response.listings || []
      return results.map((listing: ConvexPropertyListing) => convertToProperty(listing))
    },
    [convex]
  )

  /**
   * Get listings by suburb
   */
  const getBySuburb = useCallback(
    async (suburb: string, limit = 50): Promise<Property[]> => {
      const response = await convex.query(api.propertyListings.getBySuburb, {
        suburb,
        status: "active",
        limit,
      })

      const results = Array.isArray(response) ? response : response.listings || []
      return results.map((listing: ConvexPropertyListing) => convertToProperty(listing))
    },
    [convex]
  )

  /**
   * Get featured listings
   */
  const getFeatured = useCallback(
    async (limit = 6): Promise<Property[]> => {
      const response = await convex.query(api.propertyListings.getRecent, {
        limit,
        status: "active",
      })

      const results = Array.isArray(response) ? response : response.listings || []
      return results.map((listing: ConvexPropertyListing) => convertToProperty(listing))
    },
    [convex]
  )

  // Initial search on mount
  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return useMemo(
    () => ({
      data,
      isLoading,
      error,
      search,
      filters,
      updateFilters,
      resetFilters,
      pagination,
      setPage,
      getProperty,
      getRecent,
      getBySuburb,
      getByListingId,
      getFeatured,
    }),
    [
      data,
      isLoading,
      error,
      search,
      filters,
      updateFilters,
      resetFilters,
      pagination,
      setPage,
      getProperty,
      getRecent,
      getBySuburb,
      getByListingId,
      getFeatured,
    ]
  )
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Utility to format price for display
 */
export function formatPrice(price: number | undefined, currency = "AUD"): string {
  if (price === undefined || price === null) {
    return "Contact Agent"
  }

  const formatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })

  return formatter.format(price)
}

/**
 * Utility to format property address
 */
export function formatAddress(
  address: string,
  suburb: string,
  state: string,
  postcode: string
): string {
  return `${address}, ${suburb}, ${state} ${postcode}`
}

/**
 * Utility to get property type icon name
 */
export function getPropertyTypeIcon(propertyType: string): string {
  const iconMap: Record<string, string> = {
    house: "home",
    apartment: "building",
    townhouse: "home",
    unit: "building",
    land: "trees",
    studio: "door-open",
  }

  return iconMap[propertyType] || "home"
}
