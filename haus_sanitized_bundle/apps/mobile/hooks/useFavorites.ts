/**
 * useFavorites - Favorites management hook with MMKV persistence
 * 
 * Provides functionality to manage user's favorite properties
 * Uses MMKV for fast, persistent storage
 */

import { useCallback, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import type { Property } from '../types/property';

const FAVORITES_STORAGE_KEY = 'favorites';

/**
 * Hook to manage favorite properties
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Load favorites from MMKV storage
   */
  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedFavorites = storage.state.getString(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  /**
   * Save favorites to MMKV storage
   */
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      storage.state.set(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  /**
   * Add a property to favorites
   */
  const addFavorite = useCallback((propertyId: string) => {
    if (!favorites.includes(propertyId)) {
      const newFavorites = [...favorites, propertyId];
      saveFavorites(newFavorites);
    }
  }, [favorites, saveFavorites]);

  /**
   * Remove a property from favorites
   */
  const removeFavorite = useCallback((propertyId: string) => {
    const newFavorites = favorites.filter(id => id !== propertyId);
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  /**
   * Toggle favorite status for a property
   */
  const toggleFavorite = useCallback((propertyId: string) => {
    if (favorites.includes(propertyId)) {
      removeFavorite(propertyId);
    } else {
      addFavorite(propertyId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  /**
   * Check if a property is favorited
   */
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.includes(propertyId);
  }, [favorites]);

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    isLoading,
    isInitialized,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refresh: loadFavorites,
  };
}

/**
 * Hook to filter properties to only show favorites
 */
export function useFavoriteProperties(properties: Property[]): Property[] {
  const { favorites } = useFavorites();
  
  return properties.filter(property => favorites.includes(property.id));
}

/**
 * Hook to get favorite count
 */
export function useFavoriteCount(): number {
  const { favorites } = useFavorites();
  return favorites.length;
}

/**
 * Hook to check if any favorites exist
 */
export function useHasFavorites(): boolean {
  const { favorites } = useFavorites();
  return favorites.length > 0;
}
