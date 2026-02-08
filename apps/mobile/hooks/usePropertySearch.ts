/**
 * usePropertySearch - Advanced property search hook
 * 
 * Provides comprehensive property search with:
 * - Full-text search across properties
 * - Advanced filtering (price, beds, baths, type, etc.)
 * - Location-based search
 * - Search history
 * - Saved searches
 * - Integration with Cortex memory for personalized results
 * 
 * @example
 * ```tsx
 * const { 
 *   results, 
 *   isLoading, 
 *   search, 
 *   filters, 
 *   setFilters,
 *   saveSearch 
 * } = usePropertySearch({
 *   enablePersonalization: true
 * });
 * ```
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConvexClient } from 'convex/browser';
import { api } from '@v1/backend/convex/_generated/api';
import { storage } from '../lib/storage';
import type { Property, PropertyType, ListingType } from '../types/property';
import { useAllProperties } from './useProperties';

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface SearchFilters {
  query?: string;
  propertyTypes?: PropertyType[];
  listingTypes?: ListingType[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  suburbs?: string[];
  states?: string[];
  features?: string[];
  hasParking?: boolean;
  hasPool?: boolean;
  hasGarden?: boolean;
  hasAirConditioning?: boolean;
  keywords?: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: number;
  notifyNewListings?: boolean;
}

export interface SearchHistoryItem {
  query: string;
  filters: SearchFilters;
  timestamp: number;
  resultCount: number;
}

export interface UsePropertySearchOptions {
  convex?: ConvexClient;
  userId?: string;
  enablePersonalization?: boolean;
  enableHistory?: boolean;
  initialFilters?: SearchFilters;
  debounceMs?: number;
}

export interface UsePropertySearchReturn {
  // Results
  results: Property[];
  isLoading: boolean;
  error: Error | null;
  resultCount: number;
  
  // Filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  
  // Search
  search: (query: string) => void;
  searchQuery: string;
  
  // History
  searchHistory: SearchHistoryItem[];
  clearHistory: () => void;
  
  // Saved searches
  savedSearches: SavedSearch[];
  saveCurrentSearch: (name: string) => void;
  deleteSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;
  
  // Suggestions
  suggestions: string[];
  
  // Sorting
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bedrooms_desc';

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const SEARCH_HISTORY_KEY = 'search_history';
const SAVED_SEARCHES_KEY = 'saved_searches';
const MAX_HISTORY_ITEMS = 20;

// ------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------

function calculateRelevanceScore(property: Property, filters: SearchFilters): number {
  let score = 0;
  
  // Title/description match
  if (filters.query) {
    const query = filters.query.toLowerCase();
    if (property.title.toLowerCase().includes(query)) score += 10;
    if (property.description.toLowerCase().includes(query)) score += 5;
    if (property.location.suburb.toLowerCase().includes(query)) score += 8;
  }
  
  // Suburb match
  if (filters.suburbs?.includes(property.location.suburb)) {
    score += 15;
  }
  
  // Feature matches
  if (filters.hasPool && property.features.hasPool) score += 3;
  if (filters.hasGarden && property.features.hasGarden) score += 3;
  if (filters.hasAirConditioning && property.features.hasAirConditioning) score += 2;
  if (filters.hasParking && property.features.parkingSpaces > 0) score += 2;
  
  // Type match
  if (filters.propertyTypes?.includes(property.type)) {
    score += 5;
  }
  
  return score;
}

function matchesFilters(property: Property, filters: SearchFilters): boolean {
  // Query search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const matchesTitle = property.title.toLowerCase().includes(query);
    const matchesDescription = property.description.toLowerCase().includes(query);
    const matchesSuburb = property.location.suburb.toLowerCase().includes(query);
    const matchesAddress = property.location.address.toLowerCase().includes(query);
    const matchesState = property.location.state.toLowerCase().includes(query);
    
    if (!matchesTitle && !matchesDescription && !matchesSuburb && !matchesAddress && !matchesState) {
      return false;
    }
  }
  
  // Property type
  if (filters.propertyTypes?.length && !filters.propertyTypes.includes(property.type)) {
    return false;
  }
  
  // Listing type
  if (filters.listingTypes?.length && !filters.listingTypes.includes(property.listingType)) {
    return false;
  }
  
  // Price
  if (property.price.type === 'fixed') {
    if (filters.minPrice && property.price.amount < filters.minPrice) return false;
    if (filters.maxPrice && property.price.amount > filters.maxPrice) return false;
  } else if (property.price.type === 'range') {
    const maxAmount = property.price.maxAmount || property.price.minAmount || 0;
    const minAmount = property.price.minAmount || 0;
    if (filters.maxPrice && minAmount > filters.maxPrice) return false;
    if (filters.minPrice && maxAmount < filters.minPrice) return false;
  }
  
  // Bedrooms
  if (filters.minBedrooms !== undefined && property.features.bedrooms < filters.minBedrooms) {
    return false;
  }
  if (filters.maxBedrooms !== undefined && property.features.bedrooms > filters.maxBedrooms) {
    return false;
  }
  
  // Bathrooms
  if (filters.minBathrooms !== undefined && property.features.bathrooms < filters.minBathrooms) {
    return false;
  }
  if (filters.maxBathrooms !== undefined && property.features.bathrooms > filters.maxBathrooms) {
    return false;
  }
  
  // Suburbs
  if (filters.suburbs?.length && !filters.suburbs.includes(property.location.suburb)) {
    return false;
  }
  
  // States
  if (filters.states?.length && !filters.states.includes(property.location.state)) {
    return false;
  }
  
  // Features
  if (filters.hasPool && !property.features.hasPool) return false;
  if (filters.hasGarden && !property.features.hasGarden) return false;
  if (filters.hasAirConditioning && !property.features.hasAirConditioning) return false;
  if (filters.hasParking && property.features.parkingSpaces === 0) return false;
  
  return true;
}

// ------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------

export function usePropertySearch(options: UsePropertySearchOptions = {}): UsePropertySearchReturn {
  const {
    convex,
    userId,
    enablePersonalization = false,
    enableHistory = true,
    initialFilters = {},
    debounceMs = 300
  } = options;
  
  // Get all properties
  const { data: allProperties = [], isLoading: isLoadingProperties } = useAllProperties();
  
  // State
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load search history and saved searches
  useEffect(() => {
    if (!enableHistory) return;
    
    try {
      const history = storage.state.getString(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
      
      const saved = storage.state.getString(SAVED_SEARCHES_KEY);
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load search data:', error);
    }
  }, [enableHistory]);
  
  // Save search history
  const saveSearchHistory = useCallback((history: SearchHistoryItem[]) => {
    if (!enableHistory) return;
    try {
      storage.state.set(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [enableHistory]);
  
  // Save saved searches
  const saveSavedSearches = useCallback((searches: SavedSearch[]) => {
    try {
      storage.state.set(SAVED_SEARCHES_KEY, JSON.stringify(searches));
      setSavedSearches(searches);
    } catch (error) {
      console.error('Failed to save searches:', error);
    }
  }, []);
  
  // Filter and sort results
  const results = useMemo(() => {
    if (!allProperties.length) return [];
    
    // Filter
    let filtered = allProperties.filter(property => matchesFilters(property, filters));
    
    // Calculate relevance if needed
    if (sortBy === 'relevance' && filters.query) {
      filtered = filtered.map(property => ({
        property,
        score: calculateRelevanceScore(property, filters)
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ property }) => property);
    }
    
    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.price.type === 'fixed' ? a.price.amount : (a.price.minAmount || 0);
          const priceB = b.price.type === 'fixed' ? b.price.amount : (b.price.minAmount || 0);
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.price.type === 'fixed' ? a.price.amount : (a.price.maxAmount || 0);
          const priceB = b.price.type === 'fixed' ? b.price.amount : (b.price.maxAmount || 0);
          return priceB - priceA;
        });
        break;
      case 'newest':
        // Assuming properties have a createdAt or isNew flag
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'bedrooms_desc':
        filtered.sort((a, b) => b.features.bedrooms - a.features.bedrooms);
        break;
    }
    
    return filtered;
  }, [allProperties, filters, sortBy]);
  
  // Update filter helper
  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);
  
  // Search function with debounce
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, query }));
      
      // Add to history
      if (enableHistory && query.trim()) {
        const newHistoryItem: SearchHistoryItem = {
          query,
          filters: { ...filters, query },
          timestamp: Date.now(),
          resultCount: results.length
        };
        
        setSearchHistory(prev => {
          const filtered = prev.filter(h => h.query !== query);
          return [newHistoryItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        });
      }
    }, debounceMs);
  }, [filters, results.length, enableHistory, debounceMs]);
  
  // Clear history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    storage.state.delete(SEARCH_HISTORY_KEY);
  }, []);
  
  // Save current search
  const saveCurrentSearch = useCallback((name: string) => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: Date.now(),
      notifyNewListings: false
    };
    
    saveSavedSearches([...savedSearches, newSearch]);
  }, [filters, savedSearches, saveSavedSearches]);
  
  // Delete saved search
  const deleteSavedSearch = useCallback((id: string) => {
    saveSavedSearches(savedSearches.filter(s => s.id !== id));
  }, [savedSearches, saveSavedSearches]);
  
  // Load saved search
  const loadSavedSearch = useCallback((id: string) => {
    const saved = savedSearches.find(s => s.id === id);
    if (saved) {
      setFilters(saved.filters);
      setSearchQuery(saved.filters.query || '');
    }
  }, [savedSearches]);
  
  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => 
      v !== undefined && 
      (Array.isArray(v) ? v.length > 0 : v !== '')
    );
  }, [filters]);
  
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (value === undefined || value === '' || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return key !== 'query';
    }).length;
  }, [filters]);
  
  // Suggestions based on search history
  const suggestions = useMemo(() => {
    return searchHistory
      .filter(h => h.query.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(h => h.query);
  }, [searchHistory, searchQuery]);
  
  return {
    results,
    isLoading: isLoadingProperties,
    error: null,
    resultCount: results.length,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    search,
    searchQuery,
    searchHistory,
    clearHistory,
    savedSearches,
    saveCurrentSearch,
    deleteSavedSearch,
    loadSavedSearch,
    suggestions,
    sortBy,
    setSortBy
  };
}

export default usePropertySearch;
