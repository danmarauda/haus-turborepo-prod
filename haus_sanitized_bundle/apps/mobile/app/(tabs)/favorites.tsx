/**
 * Favorites Screen - Saved Properties
 * 
 * Displays user's favorited properties with:
 * - List of saved properties
 * - Quick access to property details
 * - Ability to remove favorites
 * - Empty state when no favorites
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Trash2 } from 'lucide-react-native';
import { useAllProperties } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import { PropertyList } from '../../components/property/PropertyList';
import type { Property } from '../../types/property';

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: allProperties, isLoading } = useAllProperties();
  const { favorites, toggleFavorite, isInitialized } = useFavorites();

  // Filter to only favorited properties
  const favoriteProperties = useMemo(() => {
    if (!allProperties) return [];
    return allProperties.filter((property) => favorites.includes(property.id));
  }, [allProperties, favorites]);

  // Handle property press
  const handlePropertyPress = useCallback(
    (property: Property) => {
      router.push(`/property/${property.id}`);
    },
    [router]
  );

  // Handle remove all favorites
  const handleRemoveAll = useCallback(() => {
    // In a real app, you might want to show a confirmation dialog
    favorites.forEach((id) => toggleFavorite(id));
  }, [favorites, toggleFavorite]);

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-foreground">Favorites</Text>
          <Text className="mt-1 text-muted-foreground">
            Loading your saved properties...
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </View>
      </SafeAreaView>
    );
  }

  // Header component
  const ListHeader = useCallback(
    () => (
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Favorites
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {favoriteProperties.length}{' '}
              {favoriteProperties.length === 1 ? 'property' : 'properties'} saved
            </Text>
          </View>
          {favoriteProperties.length > 0 && (
            <TouchableOpacity
              onPress={handleRemoveAll}
              className="flex-row items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-sm font-medium text-red-500">
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [favoriteProperties.length, handleRemoveAll]
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PropertyList
        properties={favoriteProperties}
        isLoading={false}
        emptyMessage="You haven't saved any properties yet"
        headerComponent={<ListHeader />}
        onPropertyPress={handlePropertyPress}
        favoriteIds={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Empty State Extra Content */}
      {favoriteProperties.length === 0 && !isLoading && (
        <View className="absolute inset-x-0 top-1/2 -translate-y-1/2 items-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart size={40} color="#ccc" />
          </View>
          <Text className="mb-2 text-center text-lg font-semibold text-foreground">
            No Favorites Yet
          </Text>
          <Text className="mb-6 text-center text-muted-foreground">
            Tap the heart icon on any property to save it here for quick access
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            className="rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-primary-foreground">
              Browse Properties
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
