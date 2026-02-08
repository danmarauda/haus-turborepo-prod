/**
 * PriceRangeFilter - Price range input component
 * 
 * Min/Max price inputs for filtering properties by price range
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  currency?: string;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  currency = 'AUD',
}: PriceRangeFilterProps) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
          Min Price ({currency})
        </Text>
        <TextInput
          className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
          value={minPrice?.toString() || ''}
          onChangeText={(text) => {
            const value = text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : undefined;
            onMinChange(value);
          }}
          keyboardType="numeric"
          placeholder="Any"
          placeholderTextColor="#999"
        />
      </View>
      <View className="flex-1">
        <Text className="mb-1.5 text-sm font-medium text-muted-foreground">
          Max Price ({currency})
        </Text>
        <TextInput
          className="rounded-lg border border-border bg-muted px-3 py-2.5 text-base text-foreground"
          value={maxPrice?.toString() || ''}
          onChangeText={(text) => {
            const value = text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : undefined;
            onMaxChange(value);
          }}
          keyboardType="numeric"
          placeholder="Any"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

export default PriceRangeFilter;
