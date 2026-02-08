/**
 * Property Types for HAUS Web App (@v1/app)
 *
 * Re-exports shared types from @v1/shared/types/property
 * Add web-specific extensions here.
 *
 * @deprecated Import from @v1/shared/types/property directly for new code
 */

// Re-export all shared types
export {
  // Core types
  PROPERTY_TYPES,
  type PropertyType,
  isPropertyType,
  
  // Type metadata
  PROPERTY_TYPE_CONFIGS,
  type PropertyTypeConfig,
  getPropertyTypeConfig,
  getAllPropertyTypes,
  getPropertyTypesByCategory,
  getPropertyTypeLabel,
  getPropertyTypeIcon,
  findPropertyTypeByAlias,
  normalizePropertyType,
  
  // Listing types
  LISTING_TYPES,
  LISTING_TYPE_CONFIGS,
  type ListingType,
  
  // Core interfaces
  type Location,
  type PropertyFeatures,
  type PropertyMedia,
  type PropertyPrice,
  type Agent,
  type Property,
  
  // Search types
  type PropertySearchParams,
  type VoiceSearchResult,
  
  // Backend types
  CONVEX_PROPERTY_TYPE_LITERALS,
  CONVEX_PROPERTY_STATUS_LITERALS,
  type ConvexPropertyType,
  type ConvexPropertyStatus,
  
  // Utilities
  toStandardPropertyType,
  toPropertySummary,
  formatPropertyDisplay,
  formatPropertyPrice,
  
  // Constants
  AUSTRALIAN_STATES,
  NZ_REGIONS,
  SEARCH_RADIUS_OPTIONS,
  DEFAULT_SEARCH_RADIUS,
  DEFAULT_PAGE_SIZE,
  MAX_SEARCH_RESULTS,
  
  // Legacy types (for backward compatibility)
  type AmenityType,
  type PropertyFeature,
  type PropertyCondition,
  AMENITY_TYPES,
  PROPERTY_FEATURES,
} from "@v1/shared/types/property";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEB-SPECIFIC EXTENSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { Property as SharedProperty, PropertySearchParams } from "@v1/shared/types/property";

/**
 * Extended property interface for web app
 * Includes web-specific fields like SEO metadata
 */
export interface WebProperty extends SharedProperty {
  /** SEO-friendly slug for URLs */
  slug?: string;
  /** Meta description for SEO */
  metaDescription?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Is this property featured on homepage? */
  isFeatured?: boolean;
  /** View count (for analytics) */
  viewCount?: number;
}

/**
 * Web-specific search parameters
 */
export interface WebPropertySearchParams extends PropertySearchParams {
  /** Search view state (map vs list) */
  viewMode?: "map" | "list" | "grid";
  /** Saved search ID (if loading a saved search) */
  savedSearchId?: string;
  /** Include sold properties in results */
  includeSold?: boolean;
  /** Include off-market properties */
  includeOffMarket?: boolean;
}

/**
 * Property card display variant
 */
export type PropertyCardVariant = "default" | "compact" | "featured" | "minimal";

/**
 * Property list view state
 */
export interface PropertyListState {
  /** Current search parameters */
  params: WebPropertySearchParams;
  /** Current page */
  page: number;
  /** Total results count */
  totalCount: number;
  /** Selected property IDs */
  selectedIds: string[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY TYPE ALIASES (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** @deprecated Use PropertySearchParams from @v1/shared/types/property */
export type SearchParameters = PropertySearchParams;

/** @deprecated Use Property from @v1/shared/types/property */
export type PropertyLegacy = SharedProperty;
