/**
 * Property Types for HAUS Backend
 *
 * Type definitions matching the Convex propertyListings schema
 * for use in backend services and scrapers.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Re-exports from scraper module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  PropertyListing,
  RealestateComAuSearchParams,
  RealestateComAuScrapeOptions,
  RealestateComAuListing,
  RealestateComAuScrapeResult,
} from "./realestate-com-au.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Property Listing Types (matches Convex schema)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type PropertyType = "house" | "apartment" | "townhouse" | "unit" | "land" | "studio";

export type ListingStatus = "active" | "sold" | "leased" | "withdrawn" | "off_market";

export type ListingSource = "domain" | "realestate.com.au" | "manual" | "api";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Search & Filter Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PropertySearchFilters {
  /** Suburb name to filter by */
  suburb?: string;
  /** State to filter by */
  state?: string;
  /** Postcode to filter by */
  postcode?: string;
  /** Property type filter */
  propertyType?: PropertyType;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Minimum bedrooms */
  minBedrooms?: number;
  /** Maximum bedrooms */
  maxBedrooms?: number;
  /** Minimum bathrooms */
  minBathrooms?: number;
  /** Listing status filter */
  status?: ListingStatus;
  /** Source filter */
  source?: ListingSource;
  /** Latitude for geo search */
  latitude?: number;
  /** Longitude for geo search */
  longitude?: number;
  /** Search radius in kilometers */
  radiusKm?: number;
}

export interface PropertySearchResult {
  /** Matching listings */
  listings: PropertyListing[];
  /** Total count (for pagination) */
  totalCount: number;
  /** Current page */
  page?: number;
  /** Page size */
  pageSize?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scraping Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ScraperConfig {
  /** Enable/disable scraper */
  enabled: boolean;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Maximum retries for failed requests */
  maxRetries: number;
  /** Delay between requests in milliseconds */
  requestDelay: number;
  /** User agent string */
  userAgent: string;
  /** Debug logging */
  debug: boolean;
}

export interface ScraperResult<T = PropertyListing> {
  /** Scraped listings */
  listings: T[];
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp */
  timestamp: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain.com.au Types (for future Domain scraper)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DomainComAuSearchParams {
  /** Search query (suburb, postcode, or state) */
  query?: string;
  /** State filter */
  state?: string;
  /** Listing type */
  listingType?: "buy" | "rent" | "sold";
  /** Property type filter */
  propertyType?: PropertyType;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Minimum bedrooms */
  minBedrooms?: number;
  /** Page number */
  page?: number;
}
