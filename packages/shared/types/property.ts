/**
 * Shared Property Types for HAUS Platform
 *
 * Single source of truth for property type definitions.
 * Used by: web app (@v1/app), mobile app (@haus/mobile), backend (@v1/backend)
 *
 * @module @v1/shared/types/property
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROPERTY TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Standard property types supported across the HAUS platform
 */
export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "townhouse",
  "unit",
  "land",
  "studio",
  "commercial",
  "rural",
] as const;

/**
 * Property type union type
 */
export type PropertyType = (typeof PROPERTY_TYPES)[number];

/**
 * Check if a value is a valid PropertyType
 */
export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === "string" && PROPERTY_TYPES.includes(value as PropertyType);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROPERTY TYPE METADATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Display configuration for each property type
 */
export interface PropertyTypeConfig {
  /** Machine-readable type identifier */
  type: PropertyType;
  /** Human-readable display label */
  label: string;
  /** Plural form of the label */
  labelPlural: string;
  /** Lucide icon name */
  icon: string;
  /** Alternative icon for active/selected state */
  iconActive?: string;
  /** Search aliases and alternative names */
  aliases: string[];
  /** Category grouping for UI organization */
  category: "residential" | "commercial" | "land" | "specialty";
  /** Whether this type typically has a dwelling structure */
  hasDwelling: boolean;
  /** Default sort order for UI display */
  sortOrder: number;
}

/**
 * Complete configuration for all property types
 */
export const PROPERTY_TYPE_CONFIGS: Record<PropertyType, PropertyTypeConfig> = {
  house: {
    type: "house",
    label: "House",
    labelPlural: "Houses",
    icon: "Home",
    iconActive: "Home",
    aliases: ["home", "detached", "detached house", "family home", "residence", "villa"],
    category: "residential",
    hasDwelling: true,
    sortOrder: 1,
  },
  apartment: {
    type: "apartment",
    label: "Apartment",
    labelPlural: "Apartments",
    icon: "Building2",
    iconActive: "Building2",
    aliases: ["flat", "apt", "unit", "condo", "condominium", "high-rise", "tower"],
    category: "residential",
    hasDwelling: true,
    sortOrder: 2,
  },
  townhouse: {
    type: "townhouse",
    label: "Townhouse",
    labelPlural: "Townhouses",
    icon: "House",
    iconActive: "House",
    aliases: ["town home", "townhome", "terrace", "terraced house", "row house", "duplex", "triplex"],
    category: "residential",
    hasDwelling: true,
    sortOrder: 3,
  },
  unit: {
    type: "unit",
    label: "Unit",
    labelPlural: "Units",
    icon: "Building",
    iconActive: "Building",
    aliases: ["flat", "apartment", "studio", "bedsit", "bedsitter"],
    category: "residential",
    hasDwelling: true,
    sortOrder: 4,
  },
  land: {
    type: "land",
    label: "Land",
    labelPlural: "Land",
    icon: "Mountain",
    iconActive: "Mountain",
    aliases: ["block", "lot", "vacant land", "empty block", "plot", "acreage", "site"],
    category: "land",
    hasDwelling: false,
    sortOrder: 5,
  },
  studio: {
    type: "studio",
    label: "Studio",
    labelPlural: "Studios",
    icon: "BedSingle",
    iconActive: "BedSingle",
    aliases: ["studio apartment", "bachelor", "bachelor apartment", "bedsit", "loft"],
    category: "specialty",
    hasDwelling: true,
    sortOrder: 6,
  },
  commercial: {
    type: "commercial",
    label: "Commercial",
    labelPlural: "Commercial",
    icon: "Store",
    iconActive: "Store",
    aliases: ["office", "retail", "shop", "warehouse", "industrial", "showroom", "medical"],
    category: "commercial",
    hasDwelling: false,
    sortOrder: 7,
  },
  rural: {
    type: "rural",
    label: "Rural",
    labelPlural: "Rural",
    icon: "Trees",
    iconActive: "Trees",
    aliases: ["farm", "acreage", "homestead", "lifestyle", "grazing", "rural property", "hobby farm"],
    category: "land",
    hasDwelling: true,
    sortOrder: 8,
  },
};

/**
 * Get configuration for a specific property type
 */
export function getPropertyTypeConfig(type: PropertyType): PropertyTypeConfig {
  return PROPERTY_TYPE_CONFIGS[type];
}

/**
 * Get all property types as an array
 */
export function getAllPropertyTypes(): PropertyType[] {
  return [...PROPERTY_TYPES];
}

/**
 * Get property types filtered by category
 */
export function getPropertyTypesByCategory(category: PropertyTypeConfig["category"]): PropertyType[] {
  return PROPERTY_TYPES.filter((type) => PROPERTY_TYPE_CONFIGS[type].category === category);
}

/**
 * Get display label for a property type
 */
export function getPropertyTypeLabel(type: PropertyType, plural = false): string {
  const config = PROPERTY_TYPE_CONFIGS[type];
  return plural ? config.labelPlural : config.label;
}

/**
 * Get icon name for a property type
 */
export function getPropertyTypeIcon(type: PropertyType, active = false): string {
  const config = PROPERTY_TYPE_CONFIGS[type];
  return active && config.iconActive ? config.iconActive : config.icon;
}

/**
 * Find property type by alias (case-insensitive)
 */
export function findPropertyTypeByAlias(alias: string): PropertyType | null {
  const normalizedAlias = alias.toLowerCase().trim();

  for (const type of PROPERTY_TYPES) {
    const config = PROPERTY_TYPE_CONFIGS[type];
    if (
      type.toLowerCase() === normalizedAlias ||
      config.label.toLowerCase() === normalizedAlias ||
      config.aliases.some((a) => a.toLowerCase() === normalizedAlias)
    ) {
      return type;
    }
  }

  return null;
}

/**
 * Normalize a property type string to a standard type
 */
export function normalizePropertyType(value: string): PropertyType | null {
  const normalized = value.toLowerCase().trim();

  // Direct match
  if (isPropertyType(normalized)) {
    return normalized;
  }

  // Try aliases
  return findPropertyTypeByAlias(normalized);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTING TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Standard listing types
 */
export const LISTING_TYPES = ["sale", "rent", "auction", "offmarket"] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_TYPE_CONFIGS: Record<ListingType, { label: string; icon: string }> = {
  sale: { label: "For Sale", icon: "Tag" },
  rent: { label: "For Rent", icon: "Key" },
  auction: { label: "Auction", icon: "Gavel" },
  offmarket: { label: "Off Market", icon: "EyeOff" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE PROPERTY INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Geographic location data
 */
export interface Location {
  /** Full street address */
  address: string;
  /** Suburb or city name */
  suburb: string;
  /** State or territory code */
  state: string;
  /** Postal code */
  postcode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country?: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
}

/**
 * Property features and amenities
 */
export interface PropertyFeatures {
  /** Number of bedrooms */
  bedrooms?: number;
  /** Number of bathrooms */
  bathrooms?: number;
  /** Number of parking spaces */
  parkingSpaces?: number;
  /** Number of car spaces (alias for parkingSpaces) */
  carSpaces?: number;
  /** Land size in square meters */
  landSize?: number;
  /** Building/floor size in square meters */
  buildingSize?: number;
  /** Year the property was built */
  yearBuilt?: number;
  /** Whether the property has a pool */
  hasPool?: boolean;
  /** Whether the property has air conditioning */
  hasAirConditioning?: boolean;
  /** Whether the property has a garden */
  hasGarden?: boolean;
  /** Whether the property has a balcony */
  hasBalcony?: boolean;
  /** Energy efficiency rating */
  energyRating?: number;
}

/**
 * Media item (image, video, etc.)
 */
export interface PropertyMedia {
  /** Unique identifier */
  id: string;
  /** Media type */
  type: "image" | "video" | "3d" | "floorplan";
  /** URL to the media */
  url: string;
  /** Thumbnail URL (for videos) */
  thumbnail?: string;
  /** Caption or description */
  caption?: string;
  /** Display order */
  order?: number;
}

/**
 * Property pricing information
 */
export interface PropertyPrice {
  /** Price amount (if fixed) */
  amount?: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Price type */
  type: "fixed" | "range" | "auction" | "contact";
  /** Minimum price (for ranges) */
  minAmount?: number;
  /** Maximum price (for ranges) */
  maxAmount?: number;
  /** Display text (e.g., "Contact Agent", "Offers Over $500k") */
  displayText?: string;
  /** Rental period (if applicable) */
  rentalPeriod?: "weekly" | "monthly";
}

/**
 * Real estate agent information
 */
export interface Agent {
  /** Agent unique identifier */
  id: string;
  /** Agent full name */
  name: string;
  /** Contact phone number */
  phone?: string;
  /** Contact email */
  email?: string;
  /** Agency/brokerage name */
  agency?: string;
  /** Agency logo URL */
  agencyLogo?: string;
  /** Agent profile image URL */
  profileImage?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PROPERTY INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Core property listing interface
 * Used across web, mobile, and backend
 */
export interface Property {
  /** Unique identifier */
  id: string;
  /** Property title/headline */
  title: string;
  /** Property description */
  description?: string;
  /** Property type */
  propertyType: PropertyType;
  /** Listing type (sale, rent, etc.) */
  listingType: ListingType;
  /** Location information */
  location: Location;
  /** Property features */
  features?: PropertyFeatures;
  /** Media items (images, videos) */
  media?: PropertyMedia[];
  /** Pricing information */
  price?: PropertyPrice;
  /** Listing agent */
  agent?: Agent;
  /** Listing status */
  status?: "active" | "sold" | "leased" | "withdrawn" | "off_market";
  /** Is this a new listing? */
  isNew?: boolean;
  /** Is this an exclusive listing? */
  isExclusive?: boolean;
  /** Is this a premium listing? */
  isPremium?: boolean;
  /** Creation timestamp */
  createdAt: string | number;
  /** Last update timestamp */
  updatedAt: string | number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH & FILTER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Property search parameters
 * 
 * This interface supports both legacy (singular) and new (plural/array) field names
 * for backward compatibility during the migration period.
 */
export interface PropertySearchParams {
  /** Text search query */
  query?: string;
  /** Location filter */
  location?: string;
  /** Suburb filter */
  suburb?: string;
  /** State filter */
  state?: string;
  /** Country code */
  country?: "AU" | "NZ";
  /** Property types to include (new plural form) */
  propertyTypes?: PropertyType[];
  /** Property type (legacy singular form) */
  propertyType?: 
    | "house"
    | "apartment"
    | "condo"
    | "townhouse"
    | "loft"
    | "studio"
    | "penthouse"
    | "duplex"
    | "land"
    | "commercial";
  /** Listing types (new plural form) */
  listingTypes?: ListingType[];
  /** Listing type (legacy form) */
  listingType?: "for-sale" | "for-rent" | "sold" | "off-market";
  /** Price range */
  priceRange?: {
    min?: number;
    max?: number;
  };
  /** Bedroom range (new form) */
  bedrooms?: {
    min?: number;
    max?: number;
  };
  /** Bedroom count (legacy singular form) */
  bedroomCount?: number;
  /** Bathroom range (new form) */
  bathrooms?: {
    min?: number;
    max?: number;
  };
  /** Bathroom count (legacy singular form) */
  bathroomCount?: number;
  /** Parking spaces range (new form) */
  parkingSpaces?: {
    min?: number;
    max?: number;
  };
  /** Parking spaces count (legacy singular form) */
  parkingCount?: number;
  /** Square footage / building size range (legacy) */
  squareFootage?: {
    min?: number;
    max?: number;
  };
  /** Year built range (legacy) */
  yearBuilt?: {
    min?: number;
    max?: number;
  };
  /** Features filter (new form) */
  features?: string[];
  /** Features filter (legacy form) */
  feature?: PropertyFeature[];
  /** Amenities filter (legacy) */
  amenities?: AmenityType[];
  /** Property condition (legacy) */
  condition?: PropertyCondition | "fixer-upper";
  /** Virtual tour available (legacy) */
  virtualTourAvailable?: boolean;
  /** New listing filter (legacy) */
  newListing?: boolean;
  /** Price reduced filter (legacy) */
  priceReduced?: boolean;
  /** Open house scheduled (legacy) */
  openHouseScheduled?: boolean;
  /** HOA fees range (legacy) */
  hoaFees?: {
    min?: number;
    max?: number;
  };
  /** Property tax range (legacy) */
  propertyTax?: {
    min?: number;
    max?: number;
  };
  /** Sort order */
  sortBy?: "price_asc" | "price_desc" | "date_desc" | "relevance";
  /** Pagination */
  limit?: number;
  offset?: number;
}

/**
 * Voice search result
 */
export interface VoiceSearchResult {
  /** Extracted search parameters */
  parameters: PropertySearchParams;
  /** Original transcribed text */
  sourceText: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Parameter extraction sources */
  parameterSources?: Record<string, string>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BACKEND-SPECIFIC TYPES (Convex Schema Helpers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Property type literals for Convex schema
 * Use these when defining Convex validators
 */
export const CONVEX_PROPERTY_TYPE_LITERALS = [
  "house",
  "apartment",
  "townhouse",
  "unit",
  "land",
  "studio",
  "commercial",
  "rural",
] as const;

/**
 * Convex-compatible property type validator values
 */
export type ConvexPropertyType = (typeof CONVEX_PROPERTY_TYPE_LITERALS)[number];

/**
 * Property status literals for Convex schema
 */
export const CONVEX_PROPERTY_STATUS_LITERALS = [
  "active",
  "sold",
  "leased",
  "withdrawn",
  "off_market",
] as const;

export type ConvexPropertyStatus = (typeof CONVEX_PROPERTY_STATUS_LITERALS)[number];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE CONVERSION UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Convert any property type variant to standard PropertyType
 * Handles legacy type names and aliases
 */
export function toStandardPropertyType(type: string): PropertyType | null {
  const normalized = type.toLowerCase().trim();

  // Direct mapping for common legacy types
  const legacyMap: Record<string, PropertyType> = {
    // Legacy names
    condo: "apartment",
    condominium: "apartment",
    flat: "apartment",
    "detached house": "house",
    villa: "house",
    duplex: "townhouse",
    triplex: "townhouse",
    terrace: "townhouse",
    "terraced house": "townhouse",
    bedsit: "studio",
    bedsitter: "studio",
    loft: "studio",
    block: "land",
    lot: "land",
    "vacant land": "land",
    farm: "rural",
    acreage: "rural",
    homestead: "rural",
    lifestyle: "rural",
    office: "commercial",
    retail: "commercial",
    shop: "commercial",
    warehouse: "commercial",
    industrial: "commercial",
  };

  // Check legacy map first
  if (legacyMap[normalized]) {
    return legacyMap[normalized];
  }

  // Then check standard types
  if (isPropertyType(normalized)) {
    return normalized;
  }

  // Finally try alias matching
  return findPropertyTypeByAlias(normalized);
}

/**
 * Convert a Property to a simplified summary
 */
export function toPropertySummary(property: Property): {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  price: string;
  bedrooms?: number;
  bathrooms?: number;
} {
  const location = `${property.location.suburb}, ${property.location.state}`;
  const price = property.price?.displayText || property.price?.amount?.toString() || "Contact Agent";

  return {
    id: property.id,
    title: property.title,
    type: property.propertyType,
    location,
    price,
    bedrooms: property.features?.bedrooms,
    bathrooms: property.features?.bathrooms,
  };
}

/**
 * Create a property display string
 */
export function formatPropertyDisplay(property: Property): string {
  const parts: string[] = [];

  // Type
  parts.push(getPropertyTypeLabel(property.propertyType));

  // Bedrooms
  if (property.features?.bedrooms !== undefined) {
    parts.push(`${property.features.bedrooms} bed`);
  }

  // Bathrooms
  if (property.features?.bathrooms !== undefined) {
    parts.push(`${property.features.bathrooms} bath`);
  }

  // Location
  parts.push(`in ${property.location.suburb}`);

  return parts.join(" ");
}

/**
 * Format price for display
 */
export function formatPropertyPrice(price?: PropertyPrice): string {
  if (!price) return "Price on request";

  if (price.displayText) {
    return price.displayText;
  }

  if (price.type === "contact") {
    return "Contact Agent";
  }

  if (price.type === "auction") {
    return "Auction";
  }

  const currency = price.currency === "AUD" ? "$" : price.currency;

  if (price.type === "range" && price.minAmount !== undefined && price.maxAmount !== undefined) {
    return `${currency}${formatNumber(price.minAmount)} - ${currency}${formatNumber(price.maxAmount)}`;
  }

  if (price.amount !== undefined) {
    const period = price.rentalPeriod === "weekly" ? "/week" : price.rentalPeriod === "monthly" ? "/month" : "";
    return `${currency}${formatNumber(price.amount)}${period}`;
  }

  return "Price on request";
}

/** Format number with commas */
function formatNumber(num: number): string {
  return num.toLocaleString("en-AU");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Australian states and territories */
export const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

/** New Zealand regions */
export const NZ_REGIONS = [
  "Auckland",
  "Wellington",
  "Christchurch",
  "Hamilton",
  "Tauranga",
  "Dunedin",
  "Palmerston North",
  "Napier",
  "Nelson",
  "Rotorua",
  "New Plymouth",
  "Whangarei",
  "Invercargill",
  "Whanganui",
  "Gisborne",
] as const;

/** Maximum search radius options (km) */
export const SEARCH_RADIUS_OPTIONS = [1, 2, 5, 10, 20, 50, 100] as const;

/** Default search radius */
export const DEFAULT_SEARCH_RADIUS = 10;

/** Maximum number of search results per page */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum number of search results */
export const MAX_SEARCH_RESULTS = 1000;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY TYPE ALIASES (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Amenity type options
 * @deprecated Use features array in PropertyFeatures instead
 */
export type AmenityType =
  | "pool"
  | "spa"
  | "gym"
  | "tennis-court"
  | "garage"
  | "carport"
  | "covered-parking"
  | "garden"
  | "backyard"
  | "balcony"
  | "terrace"
  | "fireplace"
  | "air-conditioning"
  | "heating"
  | "dishwasher"
  | "laundry"
  | "walk-in-closet"
  | "built-in-wardrobes"
  | "study"
  | "security-system"
  | "intercom"
  | "elevator"
  | "pet-friendly"
  | "furnished"
  | "solar-panels"
  | "smart-home";

/**
 * Property feature options
 * @deprecated Use features array in PropertyFeatures instead
 */
export type PropertyFeature =
  | "corner-lot"
  | "waterfront"
  | "mountain-view"
  | "city-view"
  | "gated-community"
  | "new-construction"
  | "recently-renovated"
  | "wheelchair-accessible"
  | "single-story"
  | "basement"
  | "wine-cellar";

/**
 * Property condition options
 * @deprecated Use condition field in PropertyFeatures instead
 */
export type PropertyCondition = "excellent" | "good" | "fair" | "needs-work";

/** All amenity types as array */
export const AMENITY_TYPES: AmenityType[] = [
  "pool",
  "spa",
  "gym",
  "tennis-court",
  "garage",
  "carport",
  "covered-parking",
  "garden",
  "backyard",
  "balcony",
  "terrace",
  "fireplace",
  "air-conditioning",
  "heating",
  "dishwasher",
  "laundry",
  "walk-in-closet",
  "built-in-wardrobes",
  "study",
  "security-system",
  "intercom",
  "elevator",
  "pet-friendly",
  "furnished",
  "solar-panels",
  "smart-home",
];

/** All property features as array */
export const PROPERTY_FEATURES: PropertyFeature[] = [
  "corner-lot",
  "waterfront",
  "mountain-view",
  "city-view",
  "gated-community",
  "new-construction",
  "recently-renovated",
  "wheelchair-accessible",
  "single-story",
  "basement",
  "wine-cellar",
];
