/**
 * useProperties - Property data hooks with React Query
 *
 * Provides hooks for fetching and filtering properties.
 * Now uses real data from Convex backend instead of mock data.
 *
 * @example
 * ```tsx
 * // Get all properties
 * const { data: properties, isLoading } = useProperties();
 *
 * // Get off-market properties
 * const { data: offMarket } = useOffMarketProperties();
 *
 * // Get property by ID
 * const { data: property } = useProperty('123');
 *
 * // Filter properties
 * const filtered = useFilteredProperties(properties, {
 *   propertyTypes: ['house', 'apartment'],
 *   minBedrooms: 3,
 * });
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { convex } from '@/lib/convex';
import { api } from '@v1/backend/convex/_generated/api';
import type { Property, PropertyType, ListingType } from '../types/property';

// =============================================================================
// Type Mapping: Convex → Mobile Property
// =============================================================================

type ConvexPropertyType = 'house' | 'apartment' | 'townhouse' | 'unit' | 'land' | 'studio';
type ConvexStatus = 'active' | 'sold' | 'leased' | 'withdrawn' | 'off_market';

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
 * Convert Convex listing to mobile Property format
 */
function mapConvexToProperty(convexListing: any): Property {
  // Build price object
  let price: Property['price'];
  if (!convexListing.price || convexListing.price === 0) {
    price = {
      amount: 0,
      currency: 'AUD',
      type: 'contact',
    };
  } else if (convexListing.priceRangeMin && convexListing.priceRangeMax) {
    price = {
      amount: convexListing.price,
      currency: 'AUD',
      type: 'range',
      minAmount: convexListing.priceRangeMin,
      maxAmount: convexListing.priceRangeMax,
    };
  } else {
    price = {
      amount: convexListing.price,
      currency: 'AUD',
      type: 'fixed',
    };
  }

  // Build media array
  const media: Property['media'] = [];
  if (convexListing.mainImage) {
    media.push({
      id: 'main',
      type: 'image',
      url: convexListing.mainImage,
      description: 'Main image',
    });
  }
  if (convexListing.images) {
    convexListing.images.forEach((url: string, index: number) => {
      if (url === convexListing.mainImage) return;
      media.push({
        id: `img-${index}`,
        type: 'image',
        url,
        description: `Image ${index + 1}`,
      });
    });
  }

  // Parse features for boolean flags
  const features = convexListing.features || [];
  const hasPool = features.some((f: string) =>
    f.toLowerCase().includes('pool') || f.toLowerCase().includes('swimming')
  );
  const hasAirConditioning = features.some((f: string) =>
    f.toLowerCase().includes('air') || f.toLowerCase().includes('ac')
  );
  const hasGarden = features.some((f: string) =>
    f.toLowerCase().includes('garden') || f.toLowerCase().includes('yard')
  );
  const hasBalcony = features.some((f: string) =>
    f.toLowerCase().includes('balcony') || f.toLowerCase().includes('deck')
  );

  return {
    id: convexListing.listingId,
    title: convexListing.headline || convexListing.address || 'Property Listing',
    description: convexListing.description || '',
    type: mapPropertyType(convexListing.propertyType),
    listingType: mapListingType(convexListing.status),
    location: {
      address: convexListing.address,
      suburb: convexListing.suburb,
      state: convexListing.state,
      postcode: convexListing.postcode,
      latitude: convexListing.latitude ?? undefined,
      longitude: convexListing.longitude ?? undefined,
    },
    features: {
      bedrooms: convexListing.bedrooms ?? 0,
      bathrooms: convexListing.bathrooms ?? 0,
      parkingSpaces: convexListing.carSpaces ?? 0,
      landSize: convexListing.landSize,
      buildingSize: convexListing.buildingSize,
      hasPool,
      hasAirConditioning,
      hasGarden,
      hasBalcony,
    },
    media,
    price,
    agent: {
      id: convexListing.agentName || 'unknown',
      name: convexListing.agentName || 'Contact Agent',
      phone: convexListing.agentPhone || '',
      email: convexListing.agentEmail || '',
      agency: convexListing.agencyName || '',
      profileImage: convexListing.agencyLogo,
    },
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

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  search: (query: string) => [...propertyKeys.all, 'search', query] as const,
  offMarket: () => [...propertyKeys.all, 'offmarket'] as const,
  bySuburb: (suburb: string) => [...propertyKeys.all, 'suburb', suburb] as const,
  byState: (state: string) => [...propertyKeys.all, 'state', state] as const,
  byType: (type: PropertyType) => [...propertyKeys.all, 'type', type] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch all regular (active/sale) properties
 */
export function useProperties() {
  return useQuery({
    queryKey: propertyKeys.lists(),
    queryFn: async () => {
      const results = await convex.query(api.propertyListings.getRecent, {
        limit: 50,
        status: 'active',
      });
      return (results || []).map(mapConvexToProperty);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch off-market properties
 */
export function useOffMarketProperties() {
  return useQuery({
    queryKey: propertyKeys.offMarket(),
    queryFn: async () => {
      const results = await convex.query(api.propertyListings.search, {
        status: 'off_market',
        limit: 50,
      });
      return (results || []).map(mapConvexToProperty);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch all properties (regular + off-market)
 */
export function useAllProperties() {
  const { data: regularProperties, isLoading: isRegularLoading, error: regularError } = useProperties();
  const { data: offMarketProperties, isLoading: isOffMarketLoading, error: offMarketError } = useOffMarketProperties();

  const allProperties = useMemo(() => {
    if (!regularProperties && !offMarketProperties) return [];
    return [...(regularProperties || []), ...(offMarketProperties || [])];
  }, [regularProperties, offMarketProperties]);

  return {
    data: allProperties,
    isLoading: isRegularLoading || isOffMarketLoading,
    error: regularError || offMarketError,
  };
}

/**
 * Filter options for properties
 */
export interface PropertyFilters {
  search?: string;
  propertyTypes?: PropertyType[];
  listingTypes?: ListingType[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  suburbs?: string[];
  states?: string[];
}

/**
 * Hook to filter properties based on various criteria
 */
export function useFilteredProperties(
  properties: Property[] | undefined,
  filters: PropertyFilters
): Property[] {
  return useMemo(() => {
    if (!properties) return [];

    return properties.filter(property => {
      // Search filter (title, description, suburb)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = property.title.toLowerCase().includes(searchLower);
        const matchesDescription = property.description.toLowerCase().includes(searchLower);
        const matchesSuburb = property.location.suburb.toLowerCase().includes(searchLower);
        const matchesAddress = property.location.address.toLowerCase().includes(searchLower);
        const matchesState = property.location.state.toLowerCase().includes(searchLower);
        const matchesPostcode = property.location.postcode.includes(searchLower);

        if (!matchesTitle && !matchesDescription && !matchesSuburb &&
            !matchesAddress && !matchesState && !matchesPostcode) {
          return false;
        }
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(property.type)) {
          return false;
        }
      }

      // Listing type filter
      if (filters.listingTypes && filters.listingTypes.length > 0) {
        if (!filters.listingTypes.includes(property.listingType)) {
          return false;
        }
      }

      // Bedrooms filter
      if (filters.minBedrooms !== undefined) {
        if (property.features.bedrooms < filters.minBedrooms) {
          return false;
        }
      }
      if (filters.maxBedrooms !== undefined) {
        if (property.features.bedrooms > filters.maxBedrooms) {
          return false;
        }
      }

      // Bathrooms filter
      if (filters.minBathrooms !== undefined) {
        if (property.features.bathrooms < filters.minBathrooms) {
          return false;
        }
      }
      if (filters.maxBathrooms !== undefined) {
        if (property.features.bathrooms > filters.maxBathrooms) {
          return false;
        }
      }

      // Price filter (only for fixed price and range properties)
      if (property.price.type === 'fixed') {
        if (filters.minPrice !== undefined && property.price.amount < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && property.price.amount > filters.maxPrice) {
          return false;
        }
      } else if (property.price.type === 'range') {
        if (filters.minPrice !== undefined &&
            (property.price.minAmount || 0) < filters.minPrice &&
            (property.price.maxAmount || 0) < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined &&
            (property.price.minAmount || 0) > filters.maxPrice) {
          return false;
        }
      }

      // Suburb filter
      if (filters.suburbs && filters.suburbs.length > 0) {
        if (!filters.suburbs.includes(property.location.suburb)) {
          return false;
        }
      }

      // State filter
      if (filters.states && filters.states.length > 0) {
        if (!filters.states.includes(property.location.state)) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filters]);
}

/**
 * Hook to get a single property by ID
 */
export function useProperty(propertyId: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: propertyKeys.detail(propertyId || ''),
    queryFn: async () => {
      if (!propertyId) return null;
      const result = await convex.query(api.propertyListings.getByListingId, {
        listingId: propertyId,
      });
      return result ? mapConvexToProperty(result) : null;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    data: data || undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to search properties by query string
 */
export function usePropertySearch(query: string) {
  const { data: allProperties, isLoading, error } = useAllProperties();

  const searchResults = useMemo(() => {
    if (!query.trim() || !allProperties) return [];

    const searchLower = query.toLowerCase();
    return allProperties.filter(property =>
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.location.suburb.toLowerCase().includes(searchLower) ||
      property.location.address.toLowerCase().includes(searchLower) ||
      property.location.state.toLowerCase().includes(searchLower) ||
      property.location.postcode.includes(searchLower)
    );
  }, [query, allProperties]);

  return {
    data: searchResults,
    isLoading,
    error,
  };
}

/**
 * Hook to get properties by suburb
 */
export function usePropertiesBySuburb(suburb: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: propertyKeys.bySuburb(suburb),
    queryFn: async () => {
      if (!suburb.trim()) return [];
      const results = await convex.query(api.propertyListings.getBySuburb, {
        suburb,
        status: 'active',
        limit: 50,
      });
      return (results || []).map(mapConvexToProperty);
    },
    enabled: !!suburb,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get properties by state
 */
export function usePropertiesByState(state: string) {
  const { data: allProperties, isLoading, error } = useAllProperties();

  const properties = useMemo(() => {
    if (!state || !allProperties) return [];
    return allProperties.filter(p => p.location.state === state);
  }, [state, allProperties]);

  return {
    data: properties,
    isLoading,
    error,
  };
}

/**
 * Hook to get properties by type
 */
export function usePropertiesByType(type: PropertyType) {
  const { data: allProperties, isLoading, error } = useAllProperties();

  const properties = useMemo(() => {
    if (!type || !allProperties) return [];
    return allProperties.filter(p => p.type === type);
  }, [type, allProperties]);

  return {
    data: properties,
    isLoading,
    error,
  };
}

// =============================================================================
// Favorites Hooks (keep existing behavior)
// =============================================================================

/**
 * Hook to get favorite properties (requires favorites to be in storage)
 */
export function useFavoriteProperties(favoriteIds: string[]) {
  const { data: allProperties, isLoading, error } = useAllProperties();

  const favoriteProperties = useMemo(() => {
    if (!favoriteIds.length || !allProperties) return [];
    return allProperties.filter(p => favoriteIds.includes(p.id));
  }, [favoriteIds, allProperties]);

  return {
    data: favoriteProperties,
    isLoading,
    error,
  };
}

/**
 * Hook to get favorite count
 */
export function useFavoriteCount(favoriteIds: string[]) {
  return { count: favoriteIds.length };
}

/**
 * Hook to check if user has favorites
 */
export function useHasFavorites(favoriteIds: string[]) {
  return { hasFavorites: favoriteIds.length > 0 };
}

// =============================================================================
// Re-export for convenience
// =============================================================================

export { mapConvexToProperty };
