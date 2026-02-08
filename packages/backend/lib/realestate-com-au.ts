/**
 * Realestate.com.au Property Scraper
 *
 * Scrapes property listings from Realestate.com.au for Australian real estate data.
 * Implements anti-bot measures, rate limiting, and comprehensive data extraction.
 *
 * Architecture:
 * - Uses Cheerio for HTML parsing
 * - Implements exponential backoff for rate limiting
 * - Supports multiple listing types (buy, rent, sold)
 * - Handles pagination and search filters
 * - Returns data matching Convex propertyListings schema
 */

import { load } from "cheerio";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Property Listing Type (matches Convex propertyListings schema)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PropertyType = "house" | "apartment" | "townhouse" | "unit" | "land" | "studio";
type ListingStatus = "active" | "sold" | "leased" | "withdrawn" | "off_market";

export interface PropertyListing {
  // Identity
  listingId: string;
  externalId?: string;
  source?: string;

  // Basic property info
  address: string;
  suburb: string;
  state: string;
  postcode: string;

  // Property details
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  landSize?: number; // in sqm
  buildingSize?: number; // in sqm

  // Pricing
  price?: number;
  priceText?: string; // Display text like "Contact Agent"
  priceRangeMin?: number;
  priceRangeMax?: number;

  // Description & Features
  headline?: string;
  description?: string;
  features?: string[];
  indoorFeatures?: string[];
  outdoorFeatures?: string[];

  // Media
  images?: string[]; // URLs
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
  status: ListingStatus;
  listingDate?: number;
  soldDate?: number;
  soldPrice?: number;

  // Metadata
  metadata?: unknown;
  rawData?: unknown; // Original source data

  // Timestamps
  fetchedAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types & Interfaces
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RealestateComAuSearchParams {
  /** Search query (suburb, postcode, or state) */
  query?: string;
  /** State filter (NSW, VIC, QLD, WA, SA, TAS, NT, ACT) */
  state?: string;
  /** Listing type */
  listingType?: "buy" | "rent" | "sold";
  /** Property type filter */
  propertyType?: "house" | "apartment" | "townhouse" | "unit" | "land" | "studio";
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Minimum bedrooms */
  minBedrooms?: number;
  /** Minimum bathrooms */
  minBathrooms?: number;
  /** Minimum car spaces */
  minCarSpaces?: number;
  /** Page number (starts at 1) */
  page?: number;
  /** Results per page */
  pageSize?: number;
}

export interface RealestateComAuScrapeOptions {
  /** User agent for requests */
  userAgent?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retries for failed requests */
  maxRetries?: number;
  /** Delay between requests in milliseconds */
  requestDelay?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface RealestateComAuListing {
  /** External listing ID from Realestate.com.au */
  listingId: string;
  /** Property URL */
  url: string;
  /** Property address */
  address: string;
  /** Suburb name */
  suburb: string;
  /** State code */
  state: string;
  /** Postcode */
  postcode: string;
  /** Property type */
  propertyType: "house" | "apartment" | "townhouse" | "unit" | "land" | "studio";
  /** Number of bedrooms */
  bedrooms?: number;
  /** Number of bathrooms */
  bathrooms?: number;
  /** Number of car spaces */
  carSpaces?: number;
  /** Land size in square meters */
  landSize?: number;
  /** Building size in square meters */
  buildingSize?: number;
  /** Price (numeric, if available) */
  price?: number;
  /** Price display text */
  priceText?: string;
  /** Price range minimum */
  priceRangeMin?: number;
  /** Price range maximum */
  priceRangeMax?: number;
  /** Property headline/title */
  headline?: string;
  /** Property description */
  description?: string;
  /** Key features */
  features?: string[];
  /** Indoor features */
  indoorFeatures?: string[];
  /** Outdoor features */
  /** Outdoor features */
  outdoorFeatures?: string[];
  /** Image URLs */
  images?: string[];
  /** Floor plan URLs */
  floorplans?: string[];
  /** Video URLs */
  videos?: string[];
  /** Main image URL */
  mainImage?: string;
  /** Agent name */
  agentName?: string;
  /** Agent phone */
  agentPhone?: string;
  /** Agent email */
  agentEmail?: string;
  /** Agency name */
  agencyName?: string;
  /** Agency logo URL */
  agencyLogo?: string;
  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;
  /** Listing status */
  status: "active" | "sold" | "leased" | "withdrawn" | "off_market";
  /** Listing date timestamp */
  listingDate?: number;
  /** Sold date timestamp (for sold listings) */
  soldDate?: number;
  /** Sold price (for sold listings) */
  soldPrice?: number;
  /** Raw data from source */
  rawData?: unknown;
}

export interface RealestateComAuScrapeResult {
  /** Scraped listings */
  listings: RealestateComAuListing[];
  /** Total results available */
  totalCount: number;
  /** Current page number */
  currentPage: number;
  /** Total pages available */
  totalPages: number;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Search parameters used */
  searchParams: RealestateComAuSearchParams;
  /** Scrape duration in milliseconds */
  duration: number;
  /** Timestamp of scrape */
  timestamp: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = "https://www.realestate.com.au";
const SEARCH_URL = `${BASE_URL}/buy`;

const DEFAULT_OPTIONS: Required<RealestateComAuScrapeOptions> = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  timeout: 30000,
  maxRetries: 3,
  requestDelay: 2000,
  debug: false,
};

const STATE_MAP: Record<string, string> = {
  nsw: "NSW",
  "new south wales": "NSW",
  vic: "VIC",
  victoria: "VIC",
  qld: "QLD",
  queensland: "QLD",
  wa: "WA",
  "western australia": "WA",
  sa: "SA",
  "south australia": "SA",
  tas: "TAS",
  tasmania: "TAS",
  nt: "NT",
  "northern territory": "NT",
  act: "ACT",
  "australian capital territory": "ACT",
};

const PROPERTY_TYPE_MAP: Record<string, "house" | "apartment" | "townhouse" | "unit" | "land" | "studio"> = {
  house: "house",
  home: "house",
  apartment: "apartment",
  unit: "unit",
  flat: "unit",
  townhouse: "townhouse",
  terrace: "townhouse",
  land: "land",
  acreage: "land",
  rural: "land",
  studio: "studio",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeState(state: string | undefined): string | undefined {
  if (!state) return undefined;
  const normalized = state.toLowerCase().trim();
  return STATE_MAP[normalized] || state.toUpperCase();
}

function normalizePropertyType(type: string | undefined): "house" | "apartment" | "townhouse" | "unit" | "land" | "studio" | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase().trim();
  return PROPERTY_TYPE_MAP[normalized] || undefined;
}

function parsePrice(priceText: string): { price?: number; priceRangeMin?: number; priceRangeMax?: number } {
  const result: { price?: number; priceRangeMin?: number; priceRangeMax?: number } = {};

  // Remove common currency symbols and whitespace
  const cleanText = priceText.replace(/[$,\s]/g, "").toUpperCase();

  // Match exact price: "$500,000" -> 500000
  const exactMatch = cleanText.match(/^(\d+)$/);
  if (exactMatch) {
    result.price = Number.parseInt(exactMatch[1], 10);
    return result;
  }

  // Match price range: "$500,000 - $600,000" or "500K-600K"
  const rangeMatch = cleanText.match(/(\d+)K?\s*[-–]\s*(\d+)K?/);
  if (rangeMatch) {
    result.priceRangeMin = Number.parseInt(rangeMatch[1], 10) * (rangeMatch[1].endsWith("K") ? 1000 : 1);
    result.priceRangeMax = Number.parseInt(rangeMatch[2], 10) * (rangeMatch[2].endsWith("K") ? 1000 : 1);
    result.price = (result.priceRangeMin + result.priceRangeMax) / 2;
    return result;
  }

  // Match "From $X" or "Over $X"
  const fromMatch = cleanText.match(/(?:FROM|OVER)\s*(\d+)K?/);
  if (fromMatch) {
    result.priceRangeMin = Number.parseInt(fromMatch[1], 10) * (fromMatch[1].endsWith("K") ? 1000 : 1);
    return result;
  }

  // Match "Under $X" or "Up to $X"
  const underMatch = cleanText.match(/(?:UNDER|UP\s+TO)\s*(\d+)K?/);
  if (underMatch) {
    result.priceRangeMax = Number.parseInt(underMatch[1], 10) * (underMatch[1].endsWith("K") ? 1000 : 1);
    return result;
  }

  return result;
}

function extractListingId(url: string): string {
  // Extract ID from URL like: /property/12345678
  const match = url.match(/property\/(\d+)/);
  return match ? match[1] : url;
}

function extractPostcode(address: string): string {
  // Australian postcodes are 4 digits
  const match = address.match(/\b(\d{4})\b/);
  return match ? match[1] : "";
}

function extractSuburbAndState(locationText: string): { suburb: string; state: string; postcode: string } {
  const parts = locationText.split(",").map((p) => p.trim());
  const postcode = extractPostcode(locationText);

  // Typical format: "Suburb, NSW 2000" or "Suburb, NSW"
  let suburb = "";
  let state = "";

  if (parts.length >= 2) {
    suburb = parts[0];
    // State is usually in the last part before postcode
    const lastPart = parts[parts.length - 1];
    state = normalizeState(lastPart.replace(/\d{4}/g, "").trim()) || "";
  } else if (parts.length === 1) {
    // Try to split suburb and state
    const words = parts[0].split(/\s+/);
    if (words.length >= 2) {
      const potentialState = words[words.length - 1].toUpperCase();
      if (Object.values(STATE_MAP).includes(potentialState as never)) {
        state = potentialState;
        suburb = words.slice(0, -1).join(" ");
      } else {
        suburb = parts[0];
      }
    }
  }

  return { suburb, state, postcode };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP Client with Anti-Bot Measures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function fetchWithRetry(
  url: string,
  options: Required<RealestateComAuScrapeOptions>,
  retryCount = 0,
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    const response = await fetch(url, {
      headers: {
        "User-Agent": options.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-AU,en-GB;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Check for CAPTCHA or blocking
    if (html.includes("captcha") || html.includes("CAPTCHA") || html.includes("Access denied")) {
      throw new Error("Request blocked by CAPTCHA or access control");
    }

    return html;
  } catch (error) {
    if (retryCount >= options.maxRetries) {
      throw new Error(`Max retries exceeded: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Exponential backoff
    const backoffDelay = options.requestDelay * 2 ** retryCount;
    if (options.debug) {
      console.log(`[Realestate.com.au] Retry ${retryCount + 1}/${options.maxRetries} after ${backoffDelay}ms`);
    }
    await sleep(backoffDelay);

    return fetchWithRetry(url, options, retryCount + 1);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTML Parsing Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseListingCard($: CheerioAPI, element: CheerioElement): RealestateComAuListing | null {
  const $el = $(element);

  // Extract listing URL
  const linkEl = $el.find("a[data-testid='listing-card-link']").first();
  const relativeUrl = linkEl.attr("href");
  if (!relativeUrl) return null;

  const url = relativeUrl.startsWith("http") ? relativeUrl : `${BASE_URL}${relativeUrl}`;
  const listingId = extractListingId(url);

  // Extract address
  const addressEl = $el.find("[data-testid='listing-card-address']");
  const address = addressEl.text().trim() || $el.find(".address").text().trim();
  if (!address) return null;

  const { suburb, state, postcode } = extractSuburbAndState(address);

  // Extract price
  const priceEl = $el.find("[data-testid='listing-card-price']");
  const priceText = priceEl.text().trim() || $el.find(".price").text().trim();
  const priceData = parsePrice(priceText);

  // Extract headline
  const headlineEl = $el.find("[data-testid='listing-card-title']");
  const headline = headlineEl.text().trim() || undefined;

  // Extract property features (beds, baths, cars)
  const featuresText = $el.find("[data-testid='listing-card-features']").text();
  const bedsMatch = featuresText.match(/(\d+)\s*bed/i);
  const bathsMatch = featuresText.match(/(\d+)\s*bath/i);
  const carsMatch = featuresText.match(/(\d+)\s*(?:car|park)/i);

  const bedrooms = bedsMatch ? Number.parseInt(bedsMatch[1], 10) : undefined;
  const bathrooms = bathsMatch ? Number.parseInt(bathsMatch[1], 10) : undefined;
  const carSpaces = carsMatch ? Number.parseInt(carsMatch[1], 10) : undefined;

  // Extract main image
  const imageEl = $el.find("img[data-testid='listing-card-image']");
  const mainImage = imageEl.attr("src") || imageEl.attr("data-src") || undefined;

  // Extract property type from badges or tags
  const typeText = $el.find(".property-type, [data-testid='listing-card-type']").text().toLowerCase();
  const propertyType = normalizePropertyType(typeText) || "house";

  // Determine status from URL or badges
  const isSold = url.includes("/sold/") || $el.find(".sold-badge, [data-testid*='sold']").length > 0;
  const status: "active" | "sold" | "leased" | "withdrawn" | "off_market" = isSold ? "sold" : "active";

  return {
    listingId,
    url,
    address,
    suburb,
    state,
    postcode,
    propertyType,
    bedrooms,
    bathrooms,
    carSpaces,
    price: priceData.price,
    priceText: priceText || undefined,
    priceRangeMin: priceData.priceRangeMin,
    priceRangeMax: priceData.priceRangeMax,
    headline,
    mainImage,
    status,
    images: mainImage ? [mainImage] : undefined,
  };
}

async function parseListingDetail(
  html: string,
  url: string,
): Promise<RealestateComAuListing | null> {
  const $ = load(html);

  // Basic info extraction
  const listingId = extractListingId(url);

  const addressEl = $("[data-testid='property-details-address'], h1.property-address");
  const address = addressEl.text().trim() || $("h1").first().text().trim();
  if (!address) return null;

  const { suburb, state, postcode } = extractSuburbAndState(address);

  // Price
  const priceEl = $("[data-testid='property-details-price'], .price");
  const priceText = priceEl.first().text().trim();
  const priceData = parsePrice(priceText);

  // Property type
  const typeText = $("[data-testid='property-details-type'], .property-type").text().toLowerCase();
  const propertyType = normalizePropertyType(typeText) || "house";

  // Features
  const bedrooms = extractFeature($, "bed");
  const bathrooms = extractFeature($, "bath");
  const carSpaces = extractFeature($, "car", "park");

  // Land and building size
  const landSize = extractSize($, "land");
  const buildingSize = extractSize($, "building");

  // Headline and description
  const headline = $("[data-testid='property-details-headline'], h1.title, .headline").first().text().trim() || undefined;
  const description = $("[data-testid='property-details-description'], .description, .property-description")
    .first()
    .text()
    .trim() || undefined;

  // Features lists
  const features = extractFeatureList($, "general-features");
  const indoorFeatures = extractFeatureList($, "indoor-features");
  const outdoorFeatures = extractFeatureList($, "outdoor-features");

  // Images
  const images: string[] = [];
  $("img[data-testid='property-image'], .gallery-image, .property-image").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && !src.includes("placeholder") && !images.includes(src)) {
      images.push(src);
    }
  });

  const mainImage = images[0] || undefined;

  // Floor plans
  const floorplans: string[] = [];
  $("a[href*='floorplan'], .floorplan-link").each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      floorplans.push(href.startsWith("http") ? href : `${BASE_URL}${href}`);
    }
  });

  // Agent information
  const agentName = $("[data-testid='agent-name'], .agent-name").first().text().trim() || undefined;
  const agentPhone = $("[data-testid='agent-phone'], .agent-phone").first().text().trim() || undefined;
  const agentEmail = $("[data-testid='agent-email'], a[href^='mailto:']").first().attr("href")?.replace("mailto:", "") || undefined;
  const agencyName = $("[data-testid='agency-name'], .agency-name").first().text().trim() || undefined;
  const agencyLogo = $("[data-testid='agency-logo'], .agency-logo img").first().attr("src") || undefined;

  // Coordinates from map
  const latitude = extractCoordinate($, "lat");
  const longitude = extractCoordinate($, "lng");

  // Status
  const isSold = url.includes("/sold/") || $(".sold-badge, [data-testid*='sold']").length > 0;
  const status: "active" | "sold" | "leased" | "withdrawn" | "off_market" = isSold ? "sold" : "active";

  // Dates
  const listingDateText = $("[data-testid='listing-date'], .listed-date").first().text().trim();
  const listingDate = listingDateText ? parseDate(listingDateText) : undefined;

  const soldDateText = $("[data-testid='sold-date'], .sold-date").first().text().trim();
  const soldDate = soldDateText ? parseDate(soldDateText) : undefined;

  const soldPriceText = $("[data-testid='sold-price'], .sold-price").first().text().trim();
  const soldPrice = soldPriceText ? parsePrice(soldPriceText).price : undefined;

  return {
    listingId,
    url,
    address,
    suburb,
    state,
    postcode,
    propertyType,
    bedrooms,
    bathrooms,
    carSpaces,
    landSize,
    buildingSize,
    price: priceData.price,
    priceText: priceText || undefined,
    priceRangeMin: priceData.priceRangeMin,
    priceRangeMax: priceData.priceRangeMax,
    headline,
    description,
    features,
    indoorFeatures,
    outdoorFeatures,
    images,
    floorplans,
    mainImage,
    agentName,
    agentPhone,
    agentEmail,
    agencyName,
    agencyLogo,
    latitude,
    longitude,
    status,
    listingDate,
    soldDate,
    soldPrice,
  };
}

function extractFeature($: CheerioAPI, ...keywords: string[]): number | undefined {
  for (const keyword of keywords) {
    const el = $(`[data-testid*='${keyword}'], .${keyword}, [class*='${keyword}']`).first();
    const text = el.text().trim();
    const match = text.match(/(\d+)/);
    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }
  return undefined;
}

function extractSize($: CheerioAPI, type: string): number | undefined {
  const el = $(`[data-testid*='${type}-size'], .${type}-size, [class*='${type}Size']`).first();
  const text = el.text().trim();
  // Match patterns like "500m²", "500 sqm", "500m"
  const match = text.match(/(\d+)\s*(?:m²|m\s*2|sqm|sq\s*m)/i);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

function extractFeatureList($: CheerioAPI, dataTestid: string): string[] | undefined {
  const features: string[] = [];
  $(`[data-testid='${dataTestid}'] li, [data-testid='${dataTestid}'] .feature`).each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      features.push(text);
    }
  });
  return features.length > 0 ? features : undefined;
}

function extractCoordinate($: CheerioAPI, type: "lat" | "lng"): number | undefined {
  // Look for coordinates in data attributes or map containers
  const mapContainer = $("[data-testid='map'], .map-container, .property-map").first();
  const value = mapContainer.attr(`data-${type}`) || mapContainer.attr(`data-${type === "lat" ? "latitude" : "longitude"}`);
  return value ? Number.parseFloat(value) : undefined;
}

function parseDate(dateText: string): number | undefined {
  // Parse various date formats
  const now = Date.now();
  const lowerText = dateText.toLowerCase();

  // Relative dates
  if (lowerText.includes("today")) {
    return now;
  }
  if (lowerText.includes("yesterday")) {
    return now - 86_400_000; // 1 day ago
  }
  if (lowerText.includes("days ago")) {
    const match = lowerText.match(/(\d+)\s*days?\s*ago/);
    if (match) {
      return now - Number.parseInt(match[1], 10) * 86_400_000;
    }
  }

  // Absolute dates (DD/MM/YYYY, etc.)
  const dateMatch = dateText.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const fullYear = year.length === 2 ? 2000 + Number.parseInt(year, 10) : Number.parseInt(year, 10);
    return new Date(fullYear, Number.parseInt(month, 10) - 1, Number.parseInt(day, 10)).getTime();
  }

  return undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Scraper Class
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class RealestateComAuScraper {
  private options: Required<RealestateComAuScrapeOptions>;
  private lastRequestTime = 0;

  constructor(options: RealestateComAuScrapeOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Build search URL from parameters
   */
  private buildSearchUrl(params: RealestateComAuSearchParams): string {
    const url = new URL(SEARCH_URL);

    // Add location query
    if (params.query) {
      url.searchParams.set("query", params.query);
    }

    // Add state filter
    if (params.state) {
      const normalizedState = normalizeState(params.state);
      if (normalizedState) {
        url.searchParams.set("state", normalizedState);
      }
    }

    // Add listing type (affects base URL)
    let baseUrl = SEARCH_URL;
    if (params.listingType === "rent") {
      baseUrl = `${BASE_URL}/rent`;
    } else if (params.listingType === "sold") {
      baseUrl = `${BASE_URL}/sold`;
    }

    // Rebuild URL with correct base
    const finalUrl = new URL(baseUrl.slice(0, baseUrl.indexOf("/", 8)) || SEARCH_URL);
    Object.entries(url.searchParams.entries()).forEach(([key, value]) => {
      finalUrl.searchParams.set(key, value);
    });

    // Add property type filter
    if (params.propertyType) {
      finalUrl.searchParams.set("propertyType", params.propertyType);
    }

    // Add price filters
    if (params.minPrice) {
      finalUrl.searchParams.set("minPrice", params.minPrice.toString());
    }
    if (params.maxPrice) {
      finalUrl.searchParams.set("maxPrice", params.maxPrice.toString());
    }

    // Add feature filters
    if (params.minBedrooms) {
      finalUrl.searchParams.set("bedrooms", params.minBedrooms.toString());
    }
    if (params.minBathrooms) {
      finalUrl.searchParams.set("bathrooms", params.minBathrooms.toString());
    }
    if (params.minCarSpaces) {
      finalUrl.searchParams.set("carSpaces", params.minCarSpaces.toString());
    }

    // Add pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    finalUrl.searchParams.set("page", page.toString());

    return finalUrl.toString();
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.options.requestDelay) {
      const delayNeeded = this.options.requestDelay - timeSinceLastRequest;
      if (this.options.debug) {
        console.log(`[Realestate.com.au] Rate limiting: waiting ${delayNeeded}ms`);
      }
      await sleep(delayNeeded);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Scrape search results page
   */
  async search(params: RealestateComAuSearchParams): Promise<RealestateComAuScrapeResult> {
    const startTime = Date.now();
    const url = this.buildSearchUrl(params);

    if (this.options.debug) {
      console.log(`[Realestate.com.au] Searching: ${url}`);
    }

    await this.enforceRateLimit();

    try {
      const html = await fetchWithRetry(url, this.options);
      const $ = load(html);

      // Parse listing cards
      const listings: RealestateComAuListing[] = [];
      $("[data-testid='listing-card'], .listing-card, .property-listing").each((_, el) => {
        const listing = parseListingCard($, el);
        if (listing) {
          listings.push(listing);
        }
      });

      // Extract pagination info
      const totalCountText = $(".results-count, [data-testid='results-count']").text();
      const totalCountMatch = totalCountText.match(/(\d+(?:,\d+)*)/);
      const totalCount = totalCountMatch ? Number.parseInt(totalCountMatch[1].replace(/,/g, ""), 10) : listings.length;

      const currentPage = params.page || 1;
      const totalPages = Math.ceil(totalCount / (params.pageSize || 20));
      const hasNextPage = currentPage < totalPages;

      const result: RealestateComAuScrapeResult = {
        listings,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        searchParams: params,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };

      if (this.options.debug) {
        console.log(`[Realestate.com.au] Found ${listings.length} listings of ${totalCount} total`);
      }

      return result;
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Scrape all pages for a search
   */
  async searchAll(params: RealestateComAuSearchParams): Promise<RealestateComAuListing[]> {
    const allListings: RealestateComAuListing[] = [];
    let currentPage = params.page || 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.search({ ...params, page: currentPage });
      allListings.push(...result.listings);
      hasMore = result.hasNextPage && result.listings.length > 0;
      currentPage++;

      // Safety limit to prevent infinite loops
      if (currentPage > 100) {
        console.warn("[Realestate.com.au] Reached maximum page limit (100)");
        break;
      }
    }

    return allListings;
  }

  /**
   * Scrape a single listing's detail page
   */
  async scrapeListing(url: string): Promise<RealestateComAuListing | null> {
    if (this.options.debug) {
      console.log(`[Realestate.com.au] Scraping listing: ${url}`);
    }

    await this.enforceRateLimit();

    try {
      const html = await fetchWithRetry(url, this.options);
      return await parseListingDetail(html, url);
    } catch (error) {
      console.error(`[Realestate.com.au] Failed to scrape listing: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Convert scraped listing to Convex propertyListings schema format
   */
  toConvexFormat(listing: RealestateComAuListing): PropertyListing {
    return {
      listingId: listing.listingId,
      externalId: listing.listingId,
      source: "realestate.com.au",
      address: listing.address,
      suburb: listing.suburb,
      state: listing.state,
      postcode: listing.postcode,
      propertyType: listing.propertyType,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      carSpaces: listing.carSpaces,
      landSize: listing.landSize,
      buildingSize: listing.buildingSize,
      price: listing.price,
      priceText: listing.priceText,
      priceRangeMin: listing.priceRangeMin,
      priceRangeMax: listing.priceRangeMax,
      headline: listing.headline,
      description: listing.description,
      features: listing.features,
      indoorFeatures: listing.indoorFeatures,
      outdoorFeatures: listing.outdoorFeatures,
      images: listing.images,
      floorplans: listing.floorplans,
      videos: listing.videos,
      mainImage: listing.mainImage,
      agentName: listing.agentName,
      agentPhone: listing.agentPhone,
      agentEmail: listing.agentEmail,
      agencyName: listing.agencyName,
      agencyLogo: listing.agencyLogo,
      latitude: listing.latitude,
      longitude: listing.longitude,
      status: listing.status,
      listingDate: listing.listingDate,
      soldDate: listing.soldDate,
      soldPrice: listing.soldPrice,
      rawData: listing.rawData,
      fetchedAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Search and return results in Convex format
   */
  async searchForConvex(params: RealestateComAuSearchParams): Promise<PropertyListing[]> {
    const result = await this.search(params);
    return result.listings.map((l) => this.toConvexFormat(l));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Convenience Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quick search function for Realestate.com.au listings
 */
export async function searchRealestateComAu(
  params: RealestateComAuSearchParams,
  options?: RealestateComAuScrapeOptions,
): Promise<RealestateComAuScrapeResult> {
  const scraper = new RealestateComAuScraper(options);
  return scraper.search(params);
}

/**
 * Search and return in Convex format
 */
export async function searchRealestateComAuForConvex(
  params: RealestateComAuSearchParams,
  options?: RealestateComAuScrapeOptions,
): Promise<PropertyListing[]> {
  const scraper = new RealestateComAuScraper(options);
  return scraper.searchForConvex(params);
}

/**
 * Scrape a single listing URL
 */
export async function scrapeListing(
  url: string,
  options?: RealestateComAuScrapeOptions,
): Promise<RealestateComAuListing | null> {
  const scraper = new RealestateComAuScraper(options);
  return scraper.scrapeListing(url);
}
