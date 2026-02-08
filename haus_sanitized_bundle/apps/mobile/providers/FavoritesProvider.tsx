/**
 * Favorites Provider
 * 
 * Manages property favorites using MMKV storage (migrated from AsyncStorage)
 * Provides methods to add, remove, toggle, and check favorites
 */

import React, { createContext, use, useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export interface FavoritesContextType {
  /** Array of favorite property IDs */
  favorites: string[];
  /** Loading state during initialization */
  isLoading: boolean;
  /** Add a property to favorites */
  addFavorite: (propertyId: string) => void;
  /** Remove a property from favorites */
  removeFavorite: (propertyId: string) => void;
  /** Toggle favorite status for a property */
  toggleFavorite: (propertyId: string) => void;
  /** Check if a property is favorited */
  isFavorite: (propertyId: string) => boolean;
  /** Clear all favorites */
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load favorites from MMKV on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        setIsLoading(true);
        const storedFavorites = storage.app.getString(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Persist favorites to MMKV whenever they change
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      storage.app.set(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) return prev;
      const newFavorites = [...prev, propertyId];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const removeFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== propertyId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      let newFavorites: string[];
      if (prev.includes(propertyId)) {
        newFavorites = prev.filter(id => id !== propertyId);
      } else {
        newFavorites = [...prev, propertyId];
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.includes(propertyId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    storage.app.delete(FAVORITES_STORAGE_KEY);
  }, []);

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext value={value}>
      {children}
    </FavoritesContext>
  );
};

/**
 * Hook to access favorites context
 */
export const useFavorites = (): FavoritesContextType => {
  const context = use(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
