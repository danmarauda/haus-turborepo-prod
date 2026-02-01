/**
 * SearchFiltersModal - Advanced property filters modal
 * 
 * Full-screen modal with comprehensive filtering options:
 * - Property types
 * - Listing types
 * - Bedrooms/Bathrooms
 * - Price range
 * - States
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import type { PropertyType, ListingType } from '../../types/property';
import { cn } from '../../lib/utils';
import { FilterSection } from './FilterSection';
import { PropertyTypeFilter } from './PropertyTypeFilter';
import { PriceRangeFilter } from './PriceRangeFilter';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'auction', label: 'Auction' },
  { value: 'offmarket', label: 'Off Market' },
];

const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

export interface SearchFilters {
  propertyTypes: PropertyType[];
  listingTypes: ListingType[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  suburbs: string[];
  states: string[];
}

interface SearchFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchFiltersModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
}: SearchFiltersModalProps) {
  // Local state for filters while modal is open
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Reset local filters when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    onClose();
  }, [localFilters, onFiltersChange, onClose]);

  const handleClear = useCallback(() => {
    const clearedFilters: SearchFilters = {
      propertyTypes: [],
      listingTypes: [],
      suburbs: [],
      states: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const togglePropertyType = useCallback((type: PropertyType) => {
    setLocalFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  }, []);

  const toggleListingType = useCallback((type: ListingType) => {
    setLocalFilters(prev => ({
      ...prev,
      listingTypes: prev.listingTypes.includes(type)
        ? prev.listingTypes.filter(t => t !== type)
        : [...prev.listingTypes, type],
    }));
  }, []);

  const toggleState = useCallback((state: string) => {
    setLocalFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  }, []);

  // Calculate active filter count
  const activeFilterCount =
    localFilters.propertyTypes.length +
    localFilters.listingTypes.length +
    localFilters.states.length +
    (localFilters.minBedrooms !== undefined ? 1 : 0) +
    (localFilters.maxBedrooms !== undefined ? 1 : 0) +
    (localFilters.minBathrooms !== undefined ? 1 : 0) +
    (localFilters.maxBathrooms !== undefined ? 1 : 0) +
    (localFilters.minPrice !== undefined ? 1 : 0) +
    (localFilters.maxPrice !== undefined ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <TouchableOpacity
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-muted"
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            Filters
          </Text>
          <TouchableOpacity onPress={handleClear}>
            <Text className="text-base font-medium text-primary">
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Property Type */}
          <FilterSection title="Property Type">
            <PropertyTypeFilter
              selectedTypes={localFilters.propertyTypes}
              onToggle={togglePropertyType}
            />
          </FilterSection>

          {/* Listing Type */}
          <FilterSection title="Listing Type">
            <View className="flex-row flex-wrap gap-2">
              {LISTING_TYPES.map((type) => {
                const isSelected = localFilters.listingTypes.includes(type.value);
                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => toggleListingType(type.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 rounded-lg border px-3 py-2',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border bg-muted'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      )}
                    >
                      {type.label}
                    </Text>
                    {isSelected && <Check size={14} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </FilterSection>

          {/* Bedrooms */}
          <FilterSection title="Bedrooms">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Min
                </Text>
                <TextInput
                  className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
                  value={localFilters.minBedrooms?.toString() || ''}
                  onChangeText={(text) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minBedrooms: text ? parseInt(text, 10) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor="#999"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Max
                </Text>
                <TextInput
                  className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
                  value={localFilters.maxBedrooms?.toString() || ''}
                  onChangeText={(text) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxBedrooms: text ? parseInt(text, 10) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </FilterSection>

          {/* Bathrooms */}
          <FilterSection title="Bathrooms">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Min
                </Text>
                <TextInput
                  className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
                  value={localFilters.minBathrooms?.toString() || ''}
                  onChangeText={(text) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minBathrooms: text ? parseInt(text, 10) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor="#999"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Max
                </Text>
                <TextInput
                  className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
                  value={localFilters.maxBathrooms?.toString() || ''}
                  onChangeText={(text) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxBathrooms: text ? parseInt(text, 10) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range">
            <PriceRangeFilter
              minPrice={localFilters.minPrice}
              maxPrice={localFilters.maxPrice}
              onMinChange={(value) =>
                setLocalFilters(prev => ({ ...prev, minPrice: value }))
              }
              onMaxChange={(value) =>
                setLocalFilters(prev => ({ ...prev, maxPrice: value }))
              }
            />
          </FilterSection>

          {/* States */}
          <FilterSection title="States">
            <View className="flex-row flex-wrap gap-2">
              {AUSTRALIAN_STATES.map((state) => {
                const isSelected = localFilters.states.includes(state);
                return (
                  <TouchableOpacity
                    key={state}
                    onPress={() => toggleState(state)}
                    className={cn(
                      'rounded-lg border px-4 py-2.5',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border bg-muted'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      )}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FilterSection>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>

        {/* Footer */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-4">
          <TouchableOpacity
            onPress={handleApply}
            className="rounded-xl bg-primary py-3.5"
          >
            <Text className="text-center text-base font-semibold text-primary-foreground">
              {activeFilterCount > 0
                ? `Apply ${activeFilterCount} Filter${activeFilterCount !== 1 ? 's' : ''}`
                : 'Apply Filters'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default SearchFiltersModal;
