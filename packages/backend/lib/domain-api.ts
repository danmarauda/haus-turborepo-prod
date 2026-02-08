/**
 * Domain.com.au API Client
 *
 * TypeScript client for Domain.com.au property listings.
 * Provides search and detail functions with data normalization
 * for the HAUS propertyListings schema.
 *
 * Based on the Python domain_scraper.py patterns from haus-appraisal.
 *
 * @module lib/domain-api
 */

import { logger } from "./logger.ts";

// ============================================================================
// Types
// ============================================================================

/**
 * Property type enum matching Convex schema
 */
export type DomainPropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "unit"
  | "land"
  | "studio";

/**
 * Listing status enum matching Convex schema
 */
export type DomainListingStatus =
  | "active"
  | "sold"
  | "leased"
  | "withdrawn"
  | "off_market";

/**
 * Search parameters for Domain.com.au
 */
export interface DomainSearchParams {
  /** Suburb name (e.g., "Bondi Beach") */
  suburb: string;
  /** State abbreviation (e.g., "NSW", "VIC") */
  state: string;
  /** Property type filter */
  propertyType?: DomainPropertyType;
  /** Minimum price in dollars */
  minPrice?: number;
  /** Maximum price in dollars */
  maxPrice?: number;
  /** Minimum bedrooms */
  minBedrooms?: number;
  /** Maximum bedrooms */
  maxBedrooms?: number;
  /** Minimum bathrooms */
  minBathrooms?: number;
  /** Maximum bathrooms */
  maxBathrooms?: number;
  /** Maximum number of results (default: 50) */
  maxResults?: number;
  /** Include surrounding suburbs */
  includeSurrounding?: boolean;
}

/**
 * Raw Domain.com.au listing response (from API or scraped HTML)
 */
export interface DomainListingRaw {
  id: string;
  url?: string;
  title?: string;
  headline?: string;
  description?: string;
  price?: number;
  priceText?: string;
  displayPrice?: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
  };
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  parkingSpaces?: number;
  landSize?: number;
  buildingSize?: number;
  floorSize?: number;
  yearBuilt?: number;
  features?: string[];
  indoorFeatures?: string[];
  outdoorFeatures?: string[];
  images?: string[];
  floorplans?: string[];
  videos?: string[];
  mainImage?: string;
  agent?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  agency?: {
    name?: string;
    logo?: string;
  };
  status?: string;
  listingDate?: string;
  soldDate?: string;
  soldPrice?: number;
  rawData?: unknown;
}

/**
 * Normalized property listing matching Convex propertyListings schema
 */
export interface DomainListingNormalized {
  // Identity
  listingId: string;
  externalId?: string;
  source: string;

  // Basic property info
  address: string;
  suburb: string;
  state: string;
  postcode: string;

  // Property details
  propertyType: DomainPropertyType;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  landSize?: number;
  buildingSize?: number;

  // Pricing
  price?: number;
  priceText?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;

  // Description & Features
  headline?: string;
  description?: string;
  features?: string[];
  indoorFeatures?: string[];
  outdoorFeatures?: string[];

  // Media
  images?: string[];
  floorplans?: string[];
  videos?: string[];
  mainImage?: string;

  // Agent/Agency
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  agencyName?: string;
  agencyLogo?: string;

  // Location data
  latitude?: number;
  longitude?: number;

  // Status & Dates
  status: DomainListingStatus;
  listingDate?: number;
  soldDate?: number;
  soldPrice?: number;

  // Metadata
  metadata?: Record<string, unknown>;
  rawData?: unknown;

  // Timestamps
  fetchedAt: number;
  updatedAt: number;
}

/**
 * Search result response
 */
export interface DomainSearchResult {
  listings: DomainListingNormalized[];
  totalFound?: number;
  searchParams: DomainSearchParams;
  fetchedAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const DOMAIN_BASE_URL = "https://www.domain.com.au";
const DOMAIN_SEARCH_URL = `${DOMAIN_BASE_URL}/search`;
const DOMAIN_API_URL = "https://api.domain.com.au/v1";

// Default request headers to mimic browser
const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
};

// Property type mapping from Domain to standard types
const PROPERTY_TYPE_MAP: Record<string, DomainPropertyType> = {
  house: "house",
  home: "house",
  townhouse: "townhouse",
  unit: "unit",
  apartment: "apartment",
  flat: "apartment",
  studio: "studio",
  land: "land",
  acreage: "land",
  rural: "land",
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse price text to integer value
 * Handles ranges, millions notation, currency symbols
 */
function parsePriceText(priceText: string): number | undefined {
  if (!priceText) {
    return undefined;
  }

  // Remove currency symbols and whitespace
  const cleaned = priceText
    .replace(/[$\s,]/g, "")
    .replace(/AUD/gi, "")
    .trim();

  // Handle "Contact Agent" or similar non-numeric prices
  if (!/[\d.]/.test(cleaned)) {
    return undefined;
  }

  // Handle ranges (e.g., "800000-900000" or "$800k-$900k")
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    try {
      const low = parseSinglePrice(parts[0]);
      const high = parseSinglePrice(parts[1]);
      if (low !== undefined && high !== undefined) {
        return Math.round((low + high) / 2);
      }
    } catch {
      // Fall through to single price parsing
    }
  }

  return parseSinglePrice(cleaned);
}

/**
 * Parse a single price value (handles k, m suffixes)
 */
function parseSinglePrice(priceStr: string): number | undefined {
  const cleaned = priceStr.replace(/[^\d.km]/gi, "").toLowerCase();

  if (!cleaned) {
    return undefined;
  }

  const match = cleaned.match(/^([\d.]+)([km]?)/);
  if (!match) {
    return undefined;
  }

  const value = Number.parseFloat(match[1]);
  const suffix = match[2];

  if (Number.isNaN(value)) {
    return undefined;
  }

  // Handle thousands/millions suffixes
  if (suffix === "k") {
    return Math.round(value * 1_000);
  }
  if (suffix === "m") {
    return Math.round(value * 1_000_000);
  }

  return Math.round(value);
}

/**
 * Extract numeric value from a string (e.g., "450" from "450m²")
 */
function extractNumericValue(text: string): number | undefined {
  if (!text) {
    return undefined;
  }

  const match = text.toString().match(/([\d.]+)/);
  if (!match) {
    return undefined;
  }

  const value = Number.parseFloat(match[1]);
  return Number.isNaN(value) ? undefined : value;
}

/**
 * Parse property type from Domain data to standard type
 */
function normalizePropertyType(
  propertyType?: string,
): DomainPropertyType {
  if (!propertyType) {
    return "house";
  }

  const normalized = propertyType.toLowerCase().trim();
  return PROPERTY_TYPE_MAP[normalized] || "house";
}

/**
 * Parse listing status to standard status
 */
function normalizeListingStatus(status?: string): DomainListingStatus {
  if (!status) {
    return "active";
  }

  const normalized = status.toLowerCase().trim();

  if (normalized.includes("sold")) {
    return "sold";
  }
  if (normalized.includes("leased") || normalized.includes("rented")) {
    return "leased";
  }
  if (normalized.includes("withdrawn") || normalized.includes("removed")) {
    return "withdrawn";
  }
  if (normalized.includes("off") && normalized.includes("market")) {
    return "off_market";
  }

  return "active";
}

/**
 * Parse date string to timestamp
 */
function parseTimestamp(dateStr?: string): number | undefined {
  if (!dateStr) {
    return undefined;
  }

  try {
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  } catch {
    // Invalid date
  }

  return undefined;
}

/**
 * Build full address from components
 */
function buildFullAddress(street?: string, suburb?: string, state?: string, postcode?: string): string {
  const parts: string[] = [];

  if (street) {
    parts.push(street);
  }

  const localityParts: string[] = [];
  if (suburb) {
    localityParts.push(suburb);
  }
  if (state) {
    localityParts.push(state);
  }
  if (postcode) {
    localityParts.push(postcode);
  }

  if (localityParts.length > 0) {
    parts.push(localityParts.join(" "));
  }

  return parts.length > 0 ? parts.join(", ") : "Unknown Address";
}

// ============================================================================
// Main API Client
// ============================================================================

/**
 * Domain.com.au API Client
 *
 * Note: Domain.com.au does not provide a public API.
 * This client simulates API behavior by parsing HTML responses.
 * For production use, consider using the Domain Partner API if available.
 */
export class DomainClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private delay: number;
  private apiKey?: string;

  constructor(options?: {
    baseUrl?: string;
    apiKey?: string;
    delay?: number;
    headers?: Record<string, string>;
  }) {
    this.baseUrl = options?.baseUrl || DOMAIN_BASE_URL;
    this.apiKey = options?.apiKey;
    this.delay = options?.delay || 2000; // 2 second default delay
    this.headers = { ...DEFAULT_HEADERS, ...options?.headers };

    if (this.apiKey) {
      this.headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
  }

  /**
   * Search Domain.com.au for property listings
   *
   * Note: This is a simplified implementation. In production, you would need
   * to either:
   * 1. Use the Domain Partner API (requires authentication)
   * 2. Implement proper HTML parsing with Cheerio or similar
   * 3. Use a proxy service to handle scraping
   */
  async search(params: DomainSearchParams): Promise<DomainSearchResult> {
    logger.info("[DomainClient] Searching Domain.com.au", {
      suburb: params.suburb,
      state: params.state,
      propertyType: params.propertyType,
    });

    try {
      // Build search URL parameters
      const searchParams = new URLSearchParams();

      // Query parameter
      searchParams.append("query", `${params.suburb} ${params.state}`);

      // Property type filter
      if (params.propertyType) {
        searchParams.append("type", params.propertyType);
      }

      // Price range
      if (params.minPrice || params.maxPrice) {
        const priceParam = `${params.minPrice || ""}-${params.maxPrice || ""}`;
        searchParams.append("price", priceParam);
      }

      // Bedroom range
      if (params.minBedrooms || params.maxBedrooms) {
        const bedsParam = `${params.minBedrooms || ""}-${params.maxBedrooms || ""}`;
        searchParams.append("bedrooms", bedsParam);
      }

      // Bathroom range (if supported)
      if (params.minBathrooms || params.maxBathrooms) {
        const bathsParam = `${params.minBathrooms || ""}-${params.maxBathrooms || ""}`;
        searchParams.append("bathrooms", bathsParam);
      }

      // Include surrounding suburbs
      if (params.includeSurrounding) {
        searchParams.append("includeSurrounding", "true");
      }

      // For now, return empty results with a note
      // In production, this would make an HTTP request and parse the response
      logger.warn(
        "[DomainClient] Direct scraping not implemented. Use Domain Partner API or integrate with the Python scraper.",
      );

      return {
        listings: [],
        totalFound: 0,
        searchParams: params,
        fetchedAt: Date.now(),
      };

      /*
      // Production implementation would look like this:

      const response = await fetch(
        `${DOMAIN_SEARCH_URL}?${searchParams.toString()}`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Domain search failed: ${response.status}`);
      }

      const html = await response.text();
      const listings = this.parseSearchResults(html, params);

      return {
        listings,
        totalFound: listings.length,
        searchParams: params,
        fetchedAt: Date.now(),
      };
      */
    } catch (error) {
      logger.error("[DomainClient] Search failed", error);
      return {
        listings: [],
        totalFound: 0,
        searchParams: params,
        fetchedAt: Date.now(),
      };
    }
  }

  /**
   * Get detailed information for a single listing
   *
   * @param listingId - The Domain.com.au listing ID
   * @param listingUrl - Optional full URL to the listing
   */
  async getListing(listingId: string, listingUrl?: string): Promise<DomainListingNormalized | null> {
    logger.info("[DomainClient] Fetching listing details", { listingId });

    if (!listingUrl) {
      listingUrl = `${this.baseUrl}/${listingId}`;
    }

    try {
      // For now, return null
      logger.warn(
        "[DomainClient] Direct scraping not implemented. Use Domain Partner API or integrate with the Python scraper.",
      );
      return null;

      /*
      // Production implementation:
      const response = await fetch(listingUrl, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.status}`);
      }

      const html = await response.text();
      const listing = this.parseListingDetail(html, listingId);

      return listing;
      */
    } catch (error) {
      logger.error("[DomainClient] Failed to fetch listing", error, { listingId });
      return null;
    }
  }

  /**
   * Normalize a raw Domain listing to the Convex schema format
   *
   * This can be used with data from any source (Python scraper, API, etc.)
   */
  normalizeListing(raw: DomainListingRaw): DomainListingNormalized {
    const now = Date.now();

    // Extract address components
    const street = raw.address?.street || raw.title || "";
    const suburb = raw.address?.suburb || "";
    const state = raw.address?.state || "";
    const postcode = raw.address?.postcode || "";
    const address = buildFullAddress(street, suburb, state, postcode);

    // Parse pricing
    const priceText = raw.priceText || raw.displayPrice || "";
    const price = raw.price || parsePriceText(priceText);
    const priceRangeMin = raw.price ? undefined : price; // If we have a fixed price, no range
    const priceRangeMax = raw.price ? undefined : price;

    // Extract features
    const features = raw.features || [];
    const indoorFeatures = raw.indoorFeatures || [];
    const outdoorFeatures = raw.outdoorFeatures || [];

    // Media
    const images = raw.images || [];
    const floorplans = raw.floorplans || [];
    const videos = raw.videos || [];
    const mainImage = raw.mainImage || (images.length > 0 ? images[0] : undefined);

    // Agent/Agency
    const agentName = raw.agent?.name;
    const agentPhone = raw.agent?.phone;
    const agentEmail = raw.agent?.email;
    const agencyName = raw.agency?.name;
    const agencyLogo = raw.agency?.logo;

    // Location
    const latitude = raw.address?.latitude;
    const longitude = raw.address?.longitude;

    // Status and dates
    const status = normalizeListingStatus(raw.status);
    const listingDate = parseTimestamp(raw.listingDate);
    const soldDate = parseTimestamp(raw.soldDate);
    const soldPrice = raw.soldPrice;

    // Property details
    const propertyType = normalizePropertyType(raw.propertyType);
    const bedrooms = raw.bedrooms;
    const bathrooms = raw.bathrooms;
    const carSpaces = raw.carSpaces || raw.parkingSpaces;
    const landSize = raw.landSize || extractNumericValue(raw.landSize?.toString());
    const buildingSize = raw.buildingSize || raw.floorSize || extractNumericValue(raw.buildingSize?.toString());

    // Description
    const headline = raw.headline || raw.title;
    const description = raw.description;

    return {
      // Identity
      listingId: raw.id,
      externalId: raw.id,
      source: "domain",

      // Basic property info
      address,
      suburb,
      state,
      postcode,

      // Property details
      propertyType,
      bedrooms,
      bathrooms,
      carSpaces,
      landSize,
      buildingSize,

      // Pricing
      price,
      priceText,
      priceRangeMin,
      priceRangeMax,

      // Description & Features
      headline,
      description,
      features,
      indoorFeatures,
      outdoorFeatures,

      // Media
      images,
      floorplans,
      videos,
      mainImage,

      // Agent/Agency
      agentName,
      agentPhone,
      agentEmail,
      agencyName,
      agencyLogo,

      // Location data
      latitude,
      longitude,

      // Status & Dates
      status,
      listingDate,
      soldDate,
      soldPrice,

      // Metadata
      metadata: {
        url: raw.url,
        originalPropertyType: raw.propertyType,
        originalStatus: raw.status,
      },
      rawData: raw.rawData || raw,

      // Timestamps
      fetchedAt: now,
      updatedAt: now,
    };
  }

  /**
   * Normalize multiple listings in batch
   */
  normalizeListings(rawListings: DomainListingRaw[]): DomainListingNormalized[] {
    return rawListings.map((raw) => this.normalizeListing(raw));
  }

  /**
   * Parse search results from HTML (placeholder for production implementation)
   *
   * In production, this would use Cheerio or similar HTML parser
   * to extract listing data from Domain.com.au search results
   */
  private parseSearchResults(_html: string, params: DomainSearchParams): DomainListingNormalized[] {
    // Placeholder implementation
    // In production, use Cheerio or similar to parse HTML:
    //
    // import * as cheerio from 'cheerio';
    // const $ = cheerio.load(html);
    // const listings: DomainListingRaw[] = [];
    // $('[data-testid="listing-card"]').each((_, elem) => {
    //   const $elem = $(elem);
    //   // Extract data from HTML elements...
    // });
    // return this.normalizeListings(listings);

    logger.warn("[DomainClient] HTML parsing not implemented", {
      suburb: params.suburb,
      state: params.state,
    });

    return [];
  }

  /**
   * Parse listing detail from HTML (placeholder for production implementation)
   */
  private parseListingDetail(_html: string, listingId: string): DomainListingNormalized | null {
    logger.warn("[DomainClient] Listing detail parsing not implemented", { listingId });
    return null;
  }
}

// ============================================================================
// Factory & Helpers
// ============================================================================

/**
 * Create a Domain API client with default configuration
 */
export function createDomainClient(options?: {
  apiKey?: string;
  delay?: number;
  baseUrl?: string;
}): DomainClient {
  return new DomainClient(options);
}

/**
 * Default singleton client instance
 */
export const domainClient = new DomainClient();

/**
 * Shorthand for searching with the default client
 */
export async function searchDomainListings(
  params: DomainSearchParams,
): Promise<DomainSearchResult> {
  return domainClient.search(params);
}

/**
 * Shorthand for getting a single listing with the default client
 */
export async function getDomainListing(
  listingId: string,
  listingUrl?: string,
): Promise<DomainListingNormalized | null> {
  return domainClient.getListing(listingId, listingUrl);
}

/**
 * Normalize a raw listing (useful for data from other sources like the Python scraper)
 */
export function normalizeDomainListing(raw: DomainListingRaw): DomainListingNormalized {
  return domainClient.normalizeListing(raw);
}

/**
 * Normalize multiple listings in batch
 */
export function normalizeDomainListings(rawListings: DomainListingRaw[]): DomainListingNormalized[] {
  return domainClient.normalizeListings(rawListings);
}
