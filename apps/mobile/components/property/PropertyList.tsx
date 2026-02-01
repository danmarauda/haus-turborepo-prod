/**
 * PropertyList - List view using PropertyCard
 * 
 * FlatList implementation with loading skeletons and empty states
 */

import React, { useCallback } from "react";
import { FlatList, Text, View } from "react-native";
import type { Property } from "../../types/property";
import { PropertyCard } from "./PropertyCard";
import { cn } from "../../lib/utils";

export interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  emptyMessage?: string;
  headerComponent?: React.ReactElement;
  onPropertyPress?: (property: Property) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (propertyId: string) => void;
  className?: string;
}

// Skeleton loader for property cards
function PropertySkeleton() {
  return (
    <View className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
      <View className="h-44 w-full animate-pulse bg-muted" />
      <View className="p-3">
        <View className="mb-2 h-6 w-32 animate-pulse rounded bg-muted" />
        <View className="mb-2 h-5 w-full animate-pulse rounded bg-muted" />
        <View className="mb-3 h-4 w-48 animate-pulse rounded bg-muted" />
        <View className="flex-row gap-4">
          <View className="h-4 w-12 animate-pulse rounded bg-muted" />
          <View className="h-4 w-12 animate-pulse rounded bg-muted" />
          <View className="h-4 w-12 animate-pulse rounded bg-muted" />
        </View>
      </View>
    </View>
  );
}

export function PropertyList({
  properties,
  isLoading = false,
  emptyMessage = "No properties found",
  headerComponent,
  onPropertyPress,
  favoriteIds = [],
  onToggleFavorite,
  className,
}: PropertyListProps) {
  const handlePropertyPress = useCallback((property: Property) => {
    onPropertyPress?.(property);
  }, [onPropertyPress]);

  const renderPropertyCard = useCallback(({ item }: { item: Property }) => (
    <View className="mb-4">
      <PropertyCard 
        property={item} 
        onPress={handlePropertyPress} 
        isFavorite={favoriteIds.includes(item.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </View>
  ), [handlePropertyPress, favoriteIds, onToggleFavorite]);

  const renderSkeletonList = () => (
    <View className={cn("p-4", className)}>
      {headerComponent}
      {Array.from({ length: 5 }).map((_, index) => (
        <PropertySkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );

  if (isLoading) {
    return renderSkeletonList();
  }

  if (properties.length === 0) {
    return (
      <View className={cn("flex-1", className)}>
        {headerComponent}
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-base text-muted-foreground">
            {emptyMessage}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={renderPropertyCard}
      className={className}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={<View className="h-36" />}
      testID="property-list"
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
}

export default PropertyList;
