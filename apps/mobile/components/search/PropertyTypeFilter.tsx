/**
 * PropertyTypeFilter - Property type selection chips
 * 
 * Multi-select chips for filtering by property type
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import type { PropertyType } from '../../types/property';
import { cn } from '../../lib/utils';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'rural', label: 'Rural' },
  { value: 'commercial', label: 'Commercial' },
];

interface PropertyTypeFilterProps {
  selectedTypes: PropertyType[];
  onToggle: (type: PropertyType) => void;
}

export function PropertyTypeFilter({ selectedTypes, onToggle }: PropertyTypeFilterProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {PROPERTY_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type.value);
        return (
          <TouchableOpacity
            key={type.value}
            onPress={() => onToggle(type.value)}
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
            {isSelected && (
              <Check size={14} color="#fff" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default PropertyTypeFilter;
