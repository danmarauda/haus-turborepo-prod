/**
 * Property Types for HAUS Mobile App (@haus/mobile)
 *
 * Re-exports shared types from @v1/shared/types/property
 * Add mobile-specific extensions here.
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
} from "@v1/shared/types/property";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE-SPECIFIC EXTENSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { Property as SharedProperty, PropertySearchParams, PropertyMedia } from "@v1/shared/types/property";

/**
 * Extended property interface for mobile app
 * Includes mobile-specific fields for native features
 */
export interface MobileProperty extends SharedProperty {
  /** Saved status (local storage) */
  isSaved?: boolean;
  /** Distance from user's current location (in km) */
  distanceFromUser?: number;
  /** Local image URIs (for offline viewing) */
  localImageUris?: string[];
  /** Last synced timestamp (for offline support) */
  lastSyncedAt?: number;
  /** Quick action availability */
  quickActions?: {
    callAgent?: boolean;
    emailAgent?: boolean;
    getDirections?: boolean;
    shareProperty?: boolean;
    bookInspection?: boolean;
  };
}

/**
 * Mobile-specific search parameters
 */
export interface MobilePropertySearchParams extends PropertySearchParams {
  /** Use current location for search */
  useCurrentLocation?: boolean;
  /** User's current coordinates */
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  /** Maximum distance from user location (km) */
  maxDistance?: number;
  /** Filter by properties with inspections scheduled */
  hasInspection?: boolean;
  /** Filter by properties with video tours */
  hasVideoTour?: boolean;
}

/**
 * Property list item for FlatList/SectionList
 */
export interface PropertyListItem {
  /** Unique key for React list rendering */
  key: string;
  /** Property data */
  property: MobileProperty;
  /** Display variant */
  variant?: "default" | "compact" | "featured";
  /** Whether this is the last item in the list */
  isLast?: boolean;
}

/**
 * Property image for gallery/lightbox
 */
export interface PropertyImageGalleryItem extends PropertyMedia {
  /** Local URI (if cached) */
  localUri?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  hasError?: boolean;
}

/**
 * Inspection time slot
 */
export interface InspectionTimeSlot {
  /** Slot ID */
  id: string;
  /** Property ID */
  propertyId: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
  /** Display date/time string */
  displayTime: string;
  /** Is this slot booked? */
  isBooked?: boolean;
  /** Maximum attendees */
  maxAttendees?: number;
  /** Current attendee count */
  attendeeCount?: number;
}

/**
 * Property comparison data
 */
export interface PropertyComparison {
  /** Comparison ID */
  id: string;
  /** User ID */
  userId: string;
  /** Properties being compared */
  propertyIds: string[];
  /** Properties data (loaded when needed) */
  properties?: MobileProperty[];
  /** Created timestamp */
  createdAt: number;
}

/**
 * Saved search/favorite filter
 */
export interface SavedPropertySearch {
  /** Search ID */
  id: string;
  /** User ID */
  userId: string;
  /** Search name */
  name: string;
  /** Search parameters */
  params: MobilePropertySearchParams;
  /** Notification settings */
  notifications?: {
    enabled: boolean;
    frequency: "immediate" | "daily" | "weekly";
    newListings?: boolean;
    priceChanges?: boolean;
    statusChanges?: boolean;
  };
  /** Result count from last search */
  lastResultCount?: number;
  /** Last search timestamp */
  lastSearchedAt?: number;
  /** Created timestamp */
  createdAt: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE UI TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Property card display mode for mobile
 */
export type PropertyCardMode = "list" | "map" | "swipe";

/**
 * Property filter sheet state
 */
export interface PropertyFilterState {
  /** Is filter sheet open */
  isOpen: boolean;
  /** Active filter category */
  activeCategory?: "type" | "price" | "beds" | "baths" | "more";
  /** Temporary filter values (before applying) */
  tempValues?: Partial<MobilePropertySearchParams>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY TYPE ALIASES (for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** @deprecated Use PropertyFeatures from @v1/shared/types/property */
export type PropertyFeaturesLegacy = {
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  landSize?: number;
  buildingSize?: number;
  yearBuilt?: number;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  energyRating?: number;
};
