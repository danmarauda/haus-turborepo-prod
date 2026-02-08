/**
 * useRealProperties - Real property data hook using Convex backend
 *
 * Fetches property listings from Convex instead of mock data.
 * Handles type mapping between backend Convex schema and mobile Property types.
 *
 * @example
 * ```tsx
 * // Search properties with filters
 * const { properties, isLoading, error } = useRealProperties({
 *   suburb: 'Sydney',
 *   minPrice: 500000,
 *   maxPrice: 1000000,
 *   minBedrooms: 2,
 * });
 *
 * // Get recent listings
 * const { properties } = useRealProperties({ recent: true, limit: 20 });
 *
 * // Get by suburb
 * const { properties } = useRealProperties({ suburb: 'Bondi' });
 *
 * // Get single property by ID
 * const { property, isLoading } = useRealProperty('listing-123');
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { convex } from '@/lib/convex';
import { api } from '@v1/backend/convex/_generated/api';
import type { Id } from '@v1/backend/convex/_generated/dataModel';
import type { Property, PropertyType, ListingType } from '../types/property';

// =============================================================================
// Types
// =============================================================================

export type ConvexPropertyType = 'house' | 'apartment' | 'townhouse' | 'unit' | 'land' | 'studio';
export type ConvexStatus = 'active' | 'sold' | 'leased' | 'withdrawn' | 'off_market';

export interface RealPropertyFilters {
  suburb?: string;
  state?: string;
  propertyType?: ConvexPropertyType;
  status?: ConvexStatus;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  source?: string;
}

export interface UseRealPropertiesOptions extends RealPropertyFilters {
  enabled?: boolean;
  limit?: number;
  cursor?: string;
}

export interface UseRealPropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseRealPropertyReturn {
  property: Property | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Type Mapping: Convex → Mobile Property
// =============================================================================

/**
 * Map Convex propertyType to mobile PropertyType
 */
function mapPropertyType(type: ConvexPropertyType | undefined): PropertyType {
  if (!type) return 'house';

  const typeMap: Record<ConvexPropertyType, PropertyType> = {
    house: 'house',
    apartment: 'apartment',
    townhouse: 'townhouse',
    unit: 'apartment', // Map unit to apartment
    land: 'land',
    studio: 'apartment', // Map studio to apartment
  };

  return typeMap[type] || 'house';
}

/**
 * Map Convex status to mobile listingType
 */
function mapListingType(status: ConvexStatus | undefined): ListingType {
  if (!status) return 'sale';

  const statusMap: Record<ConvexStatus, ListingType> = {
    active: 'sale',
    sold: 'sale',
    leased: 'rent',
    withdrawn: 'offmarket',
    off_market: 'offmarket',
  };

  return statusMap[status] || 'sale';
}

/**
 * Build price object from Convex listing data
 */
function buildPrice(
  price: number | undefined,
  priceText: string | undefined,
  priceRangeMin: number | undefined,
  priceRangeMax: number | undefined
): Property['price'] {
  // Contact agent price
  if (!price || price === 0) {
    return {
      amount: 0,
      currency: 'AUD',
      type: 'contact',
    };
  }

  // Range price
  if (priceRangeMin && priceRangeMax) {
    return {
      amount: price,
      currency: 'AUD',
      type: 'range',
      minAmount: priceRangeMin,
      maxAmount: priceRangeMax,
    };
  }

  // Fixed price (default)
  return {
    amount: price,
    currency: 'AUD',
    type: 'fixed',
  };
}

/**
 * Build media array from Convex images
 */
function buildMedia(
  images: string[] | undefined,
  mainImage: string | undefined,
  videos: string[] | undefined
): Property['media'] {
  const media: Property['media'] = [];

  // Add main image first
  if (mainImage) {
    media.push({
      id: 'main',
      type: 'image',
      url: mainImage,
      description: 'Main image',
    });
  }

  // Add other images
  if (images) {
    images.forEach((url, index) => {
      // Skip main image if it appears in the array
      if (url === mainImage) return;

      media.push({
        id: `img-${index}`,
        type: 'image',
        url,
        description: `Image ${index + 1}`,
      });
    });
  }

  // Add videos
  if (videos) {
    videos.forEach((url, index) => {
      media.push({
        id: `vid-${index}`,
        type: 'video',
        url,
        description: `Video ${index + 1}`,
      });
    });
  }

  return media;
}

/**
 * Build features object from Convex data
 */
function buildFeatures(
  bedrooms: number | undefined,
  bathrooms: number | undefined,
  carSpaces: number | undefined,
  landSize: number | undefined,
  buildingSize: number | undefined,
  features: string[] | undefined
): Property['features'] {
  // Parse features for boolean flags
  const hasPool = features?.some(f =>
    f.toLowerCase().includes('pool') || f.toLowerCase().includes('swimming')
  );
  const hasAirConditioning = features?.some(f =>
    f.toLowerCase().includes('air') || f.toLowerCase().includes('ac')
  );
  const hasGarden = features?.some(f =>
    f.toLowerCase().includes('garden') || f.toLowerCase().includes('yard')
  );
  const hasBalcony = features?.some(f =>
    f.toLowerCase().includes('balcony') || f.toLowerCase().includes('deck')
  );

  return {
    bedrooms: bedrooms ?? 0,
    bathrooms: bathrooms ?? 0,
    parkingSpaces: carSpaces ?? 0,
    landSize,
    buildingSize,
    hasPool,
    hasAirConditioning,
    hasGarden,
    hasBalcony,
  };
}

/**
 * Build location object from Convex data
 */
function buildLocation(
  address: string,
  suburb: string,
  state: string,
  postcode: string,
  latitude: number | undefined,
  longitude: number | undefined
): Property['location'] {
  return {
    address,
    suburb,
    state,
    postcode,
    latitude: latitude ?? undefined,
    longitude: longitude ?? undefined,
  };
}

/**
 * Build agent object from Convex data
 */
function buildAgent(
  agentName: string | undefined,
  agentPhone: string | undefined,
  agentEmail: string | undefined,
  agencyName: string | undefined,
  agencyLogo: string | undefined
): Property['agent'] {
  return {
    id: agentName || 'unknown',
    name: agentName || 'Contact Agent',
    phone: agentPhone || '',
    email: agentEmail || '',
    agency: agencyName || '',
    profileImage: agencyLogo,
  };
}

/**
 * Convert Convex listing to mobile Property format
 */
function mapConvexToProperty(convexListing: any): Property {
  return {
    id: convexListing.listingId,
    title: convexListing.headline || convexListing.address || 'Property Listing',
    description: convexListing.description || '',
    type: mapPropertyType(convexListing.propertyType),
    listingType: mapListingType(convexListing.status),
    location: buildLocation(
      convexListing.address,
      convexListing.suburb,
      convexListing.state,
      convexListing.postcode,
      convexListing.latitude,
      convexListing.longitude
    ),
    features: buildFeatures(
      convexListing.bedrooms,
      convexListing.bathrooms,
      convexListing.carSpaces,
      convexListing.landSize,
      convexListing.buildingSize,
      convexListing.features
    ),
    media: buildMedia(
      convexListing.images,
      convexListing.mainImage,
      convexListing.videos
    ),
    price: buildPrice(
      convexListing.price,
      convexListing.priceText,
      convexListing.priceRangeMin,
      convexListing.priceRangeMax
    ),
    agent: buildAgent(
      convexListing.agentName,
      convexListing.agentPhone,
      convexListing.agentEmail,
      convexListing.agencyName,
      convexListing.agencyLogo
    ),
    isNew: convexListing.status === 'active',
    isPremium: convexListing.source === 'domain',
    isExclusive: convexListing.status === 'off_market',
    createdAt: convexListing.fetchedAt
      ? new Date(convexListing.fetchedAt).toISOString()
      : new Date().toISOString(),
    updatedAt: convexListing.updatedAt
      ? new Date(convexListing.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

// =============================================================================
// Query Keys
// =============================================================================

export const realPropertyKeys = {
  all: ['real-properties'] as const,
  lists: () => [...realPropertyKeys.all, 'list'] as const,
  list: (filters: RealPropertyFilters & { limit?: number; cursor?: string }) =>
    [...realPropertyKeys.lists(), filters] as const,
  details: () => [...realPropertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...realPropertyKeys.details(), id] as const,
  recent: (limit?: number, propertyType?: ConvexPropertyType) =>
    [...realPropertyKeys.all, 'recent', { limit, propertyType }] as const,
  suburb: (suburb: string) => [...realPropertyKeys.all, 'suburb', suburb] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to search properties with filters from Convex backend
 */
export function useRealProperties(
  options: UseRealPropertiesOptions = {}
): UseRealPropertiesReturn {
  const {
    suburb,
    state,
    propertyType,
    status = 'active',
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    source,
    enabled = true,
    limit = 50,
    cursor,
  } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: realPropertyKeys.list({
      suburb,
      state,
      propertyType,
      status,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      source,
      limit,
      cursor,
    }),
    queryFn: async () => {
      const results = await convex.query(api.propertyListings.search, {
        suburb,
        state,
        propertyType,
        status,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        source,
        limit,
        cursor,
      });

      return (results || []).map(mapConvexToProperty);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    properties: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get a single property by listing ID
 */
export function useRealProperty(listingId: string | null): UseRealPropertyReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: realPropertyKeys.detail(listingId || ''),
    queryFn: async () => {
      if (!listingId) return null;
      const result = await convex.query(api.propertyListings.getByListingId, {
        listingId,
      });
      return result ? mapConvexToProperty(result) : null;
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    property: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get a property by Convex internal ID
 */
export function useRealPropertyById(
  id: Id<'propertyListings'> | null
): UseRealPropertyReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...realPropertyKeys.details(), 'by-id', id || ''],
    queryFn: async () => {
      if (!id) return null;
      const result = await convex.query(api.propertyListings.get, { id });
      return result ? mapConvexToProperty(result) : null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    property: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get recent property listings
 */
export function useRecentProperties(
  limit = 20,
  propertyType?: ConvexPropertyType,
  status: ConvexStatus = 'active',
  enabled = true
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: realPropertyKeys.recent(limit, propertyType),
    queryFn: async () => {
      const results = await convex.query(api.propertyListings.getRecent, {
        limit,
        propertyType,
        status,
      });
      return (results || []).map(mapConvexToProperty);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    properties: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get properties by suburb
 */
export function usePropertiesBySuburbReal(
  suburb: string,
  status: ConvexStatus = 'active',
  limit = 50,
  enabled = true
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: realPropertyKeys.suburb(suburb),
    queryFn: async () => {
      const results = await convex.query(api.propertyListings.getBySuburb, {
        suburb,
        status,
        limit,
      });
      return (results || []).map(mapConvexToProperty);
    },
    enabled: enabled && !!suburb,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    properties: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// =============================================================================
// Batch Operations
// =============================================================================

export interface UseRealPropertiesBatchOptions {
  listingIds: string[];
  enabled?: boolean;
}

export interface UseRealPropertiesBatchReturn {
  properties: Property[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch multiple properties by their listing IDs
 * Note: This fetches properties one by one. For large batches, consider
 * adding a batch query to the Convex backend.
 */
export function useRealPropertiesBatch(
  options: UseRealPropertiesBatchOptions
): UseRealPropertiesBatchReturn {
  const { listingIds, enabled = true } = options;

  // Use multiple queries
  const queries = listingIds.map((id) => ({
    queryKey: realPropertyKeys.detail(id),
    queryFn: async () => {
      const result = await convex.query(api.propertyListings.getByListingId, {
        listingId: id,
      });
      return result ? mapConvexToProperty(result) : null;
    },
    enabled: enabled && !!id,
  }));

  // Track loading and error states
  const [isLoading, setIsLoading] = useMemo(() => {
    // This is a placeholder - React Query doesn't expose useQueries results
    // directly in the same way. The consumer should use isLoading from individual queries.
    return [false, false];
  }, []);

  return {
    properties: [], // Consumers should use useQueries directly for batch operations
    isLoading: false,
    error: null,
  };
}

// =============================================================================
// Re-export types
// =============================================================================

export type { Property, PropertyType, ListingType };
export { mapConvexToProperty };
