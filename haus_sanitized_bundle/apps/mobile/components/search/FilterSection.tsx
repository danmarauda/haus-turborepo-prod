/**
 * FilterSection - Reusable filter section container
 * 
 * Used within the SearchFiltersModal for grouping related filters
 */

import React from 'react';
import { View, Text } from 'react-native';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default FilterSection;
