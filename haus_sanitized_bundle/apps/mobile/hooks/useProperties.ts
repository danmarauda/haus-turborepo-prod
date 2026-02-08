/**
 * useProperties - Property data hooks with React Query
 * 
 * Provides hooks for fetching and filtering properties
 * Uses React Query for caching and Convex integration ready
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Property, PropertyType, ListingType } from '../types/property';
import { 
  mockProperties, 
  mockOffMarketProperties,
  allMockProperties 
} from '../lib/data/properties';

// Query keys for caching
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  search: (query: string) => [...propertyKeys.all, 'search', query] as const,
};

// Simulate API call delay for realistic loading states
const simulateNetworkDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all regular properties
 * TODO: Replace with Convex query once backend is ready
 */
const fetchProperties = async (): Promise<Property[]> => {
  await simulateNetworkDelay(800);
  return mockProperties;
};

/**
 * Fetch off-market properties
 * TODO: Replace with Convex query once backend is ready
 */
const fetchOffMarketProperties = async (): Promise<Property[]> => {
  await simulateNetworkDelay(1000);
  return mockOffMarketProperties;
};

/**
 * Hook to fetch all regular properties
 */
export function useProperties() {
  return useQuery({
    queryKey: propertyKeys.lists(),
    queryFn: fetchProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch off-market properties
 */
export function useOffMarketProperties() {
  return useQuery({
    queryKey: [...propertyKeys.lists(), 'offmarket'],
    queryFn: fetchOffMarketProperties,
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
  const { data: allProperties, isLoading, error } = useAllProperties();
  
  return useMemo(() => {
    if (!propertyId || !allProperties) {
      return { data: undefined, isLoading, error };
    }
    
    return { 
      data: allProperties.find(p => p.id === propertyId),
      isLoading,
      error
    };
  }, [propertyId, allProperties, isLoading, error]);
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
  const { data: allProperties, isLoading, error } = useAllProperties();
  
  const properties = useMemo(() => {
    if (!suburb.trim() || !allProperties) return [];
    return allProperties.filter(p => 
      p.location.suburb.toLowerCase().includes(suburb.toLowerCase())
    );
  }, [suburb, allProperties]);
  
  return {
    data: properties,
    isLoading,
    error,
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
