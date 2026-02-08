/**
 * Search Screen - Property Discovery
 * 
 * Features:
 * - Search bar with text input
 * - Filter button to open filter modal
 * - Property list with filtering
 * - Result count display
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Home,
  Building,
  Building2,
  LandPlot,
  Warehouse,
  Store,
} from 'lucide-react-native';
import type { Property, PropertyType } from '../../types/property';
import { useProperties, useFilteredProperties, type PropertyFilters } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import { PropertyList } from '../../components/property/PropertyList';
import { SearchFiltersModal, type SearchFilters } from '../../components/search/SearchFiltersModal';
import { cn } from '../../lib/utils';
import SearchErrorBoundary from '../../components/error-boundaries/SearchErrorBoundary';

// Quick filter types for horizontal scroll
type QuickFilterType = 'all' | PropertyType;

interface QuickFilter {
  label: string;
  value: QuickFilterType;
  icon: React.ReactNode;
}

const quickFilters: QuickFilter[] = [
  { label: 'All', value: 'all', icon: <Home size={16} /> },
  { label: 'Houses', value: 'house', icon: <Home size={16} /> },
  { label: 'Apartments', value: 'apartment', icon: <Building size={16} /> },
  { label: 'Townhouses', value: 'townhouse', icon: <Building2 size={16} /> },
  { label: 'Land', value: 'land', icon: <LandPlot size={16} /> },
  { label: 'Rural', value: 'rural', icon: <Warehouse size={16} /> },
  { label: 'Commercial', value: 'commercial', icon: <Store size={16} /> },
];

function SearchScreenContent() {
  const router = useRouter();
  const { data: properties, isLoading } = useProperties();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<QuickFilterType>('all');

  // Advanced filters state
  const [filters, setFilters] = useState<SearchFilters>({
    propertyTypes: [],
    listingTypes: [],
    suburbs: [],
    states: [],
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return (
      filters.propertyTypes.length +
      filters.listingTypes.length +
      filters.states.length +
      (filters.minBedrooms !== undefined ? 1 : 0) +
      (filters.maxBedrooms !== undefined ? 1 : 0) +
      (filters.minBathrooms !== undefined ? 1 : 0) +
      (filters.maxBathrooms !== undefined ? 1 : 0) +
      (filters.minPrice !== undefined ? 1 : 0) +
      (filters.maxPrice !== undefined ? 1 : 0)
    );
  }, [filters]);

  // Build property filters
  const propertyFilters: PropertyFilters = useMemo(() => {
    const quickFilterTypes =
      selectedQuickFilter !== 'all' ? [selectedQuickFilter] : [];

    return {
      search: searchQuery,
      propertyTypes:
        quickFilterTypes.length > 0 && filters.propertyTypes.length === 0
          ? quickFilterTypes
          : filters.propertyTypes,
      listingTypes: filters.listingTypes,
      minBedrooms: filters.minBedrooms,
      maxBedrooms: filters.maxBedrooms,
      minBathrooms: filters.minBathrooms,
      maxBathrooms: filters.maxBathrooms,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      states: filters.states,
    };
  }, [searchQuery, selectedQuickFilter, filters]);

  // Apply filters
  const filteredProperties = useFilteredProperties(properties, propertyFilters);

  // Handle property press
  const handlePropertyPress = useCallback(
    (property: Property) => {
      router.push(`/property/${property.id}`);
    },
    [router]
  );

  // Get favorite IDs array
  const favoriteIds = useMemo(() => {
    if (!properties) return [];
    return properties.filter(p => isFavorite(p.id)).map(p => p.id);
  }, [properties, isFavorite]);

  // Handle quick filter press
  const handleQuickFilterPress = useCallback((filter: QuickFilterType) => {
    setSelectedQuickFilter(prev => (prev === filter ? 'all' : filter));
  }, []);

  // Header component for property list
  const ListHeader = useCallback(
    () => (
      <View className="mb-4">
        {/* Title and Result Count */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <SearchIcon size={20} color="#0ea5e9" />
            <Text className="text-xl font-bold text-foreground">
              Find Properties
            </Text>
          </View>
          {!isLoading && (
            <Text className="text-sm text-muted-foreground">
              {filteredProperties.length} found
            </Text>
          )}
        </View>
        <Text className="mb-4 text-sm text-muted-foreground">
          Search thousands of listings across Australia
        </Text>

        {/* Search Bar */}
        <View className="mb-3 flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-xl border border-border bg-muted px-3">
            <SearchIcon size={18} color="#666" />
            <TextInput
              className="flex-1 py-3 px-2 text-base text-foreground"
              placeholder="Search suburbs, addresses, or postcodes"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text className="text-muted-foreground text-sm">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFiltersModal(true)}
            className={cn(
              'h-11 w-11 items-center justify-center rounded-xl',
              activeFilterCount > 0 ? 'bg-primary' : 'bg-muted'
            )}
          >
            <SlidersHorizontal
              size={20}
              color={activeFilterCount > 0 ? '#fff' : '#666'}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-bold text-white">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <View className="mb-4">
          <View className="flex-row flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const isSelected = selectedQuickFilter === filter.value;
              return (
                <Pressable
                  key={filter.value}
                  onPress={() => handleQuickFilterPress(filter.value)}
                  className={cn(
                    'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-muted'
                  )}
                >
                  {React.cloneElement(filter.icon as React.ReactElement, {
                    color: isSelected ? '#fff' : '#666',
                  })}
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-primary-foreground' : 'text-foreground'
                    )}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    ),
    [
      searchQuery,
      selectedQuickFilter,
      activeFilterCount,
      filteredProperties.length,
      isLoading,
      handleQuickFilterPress,
    ]
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PropertyList
        properties={filteredProperties}
        isLoading={isLoading}
        emptyMessage={
          searchQuery || activeFilterCount > 0 || selectedQuickFilter !== 'all'
            ? 'No properties match your search criteria'
            : 'No properties available'
        }
        headerComponent={<ListHeader />}
        onPropertyPress={handlePropertyPress}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />

      <SearchFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </SafeAreaView>
  );
}

// Export wrapped component with error boundary
export default function SearchScreen() {
  const router = useRouter();
  
  return (
    <SearchErrorBoundary
      onReset={() => {
        // Reset search state
        console.log('Search error boundary reset');
      }}
      onClearFilters={() => {
        // Clear filters would be handled by the component
        console.log('Clear filters from error boundary');
      }}
      onGoHome={() => {
        router.push('/');
      }}
    >
      <SearchScreenContent />
    </SearchErrorBoundary>
  );
}
