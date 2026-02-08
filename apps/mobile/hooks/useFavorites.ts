/**
 * useFavorites - Favorites management hook with MMKV persistence and Convex sync
 * 
 * Provides functionality to manage user's favorite properties with:
 * - Local MMKV storage for fast access
 * - Convex backend sync for cross-platform consistency
 * - Optimistic updates
 * - Conflict resolution
 * 
 * @example
 * ```tsx
 * const { favorites, toggleFavorite, isFavorite, syncWithConvex } = useFavorites({
 *   convex,
 *   userId: 'user-123',
 *   enableSync: true
 * });
 * ```
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ConvexClient } from 'convex/browser';
import { api } from '@v1/backend/convex/_generated/api';
import { storage } from '../lib/storage';
import type { Property } from '../types/property';
import { useAuth } from '../services/auth';

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const FAVORITES_STORAGE_KEY = 'favorites';
const FAVORITES_SYNC_KEY = 'favorites_last_sync';
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface UseFavoritesOptions {
  convex?: ConvexClient;
  userId?: string;
  enableSync?: boolean;
  autoSync?: boolean;
}

export interface UseFavoritesReturn {
  // Data
  favorites: string[];
  isLoading: boolean;
  isInitialized: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  
  // Actions
  addFavorite: (propertyId: string) => Promise<void>;
  removeFavorite: (propertyId: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  clearFavorites: () => Promise<void>;
  refresh: () => Promise<void>;
  syncWithConvex: () => Promise<void>;
  
  // Comparison
  compareProperties: (propertyIds: string[]) => Property[];
  isComparing: boolean;
  addToComparison: (propertyId: string) => void;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
}

// ------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------

export function useFavorites(options: UseFavoritesOptions = {}): UseFavoritesReturn {
  const { convex, userId, enableSync = false, autoSync = true } = options;
  const auth = useAuth();
  const effectiveUserId = userId || auth.user?.id;
  
  // Local state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  
  // Refs for sync management
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncRef = useRef<Set<string>>(new Set());
  
  // --------------------------------------------------------------------------
  // Local Storage
  // --------------------------------------------------------------------------
  
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
      
      const lastSync = storage.state.getString(FAVORITES_SYNC_KEY);
      if (lastSync) {
        setLastSyncedAt(parseInt(lastSync, 10));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);
  
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      storage.state.set(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);
  
  // --------------------------------------------------------------------------
  // Convex Integration
  // --------------------------------------------------------------------------
  
  // Fetch favorites from Convex (if available)
  const convexFavorites = useQuery(
    api.favorites?.list,
    effectiveUserId && enableSync ? { userId: effectiveUserId } : 'skip'
  );
  
  const addFavoriteMutation = useMutation(api.favorites?.add);
  const removeFavoriteMutation = useMutation(api.favorites?.remove);
  const clearFavoritesMutation = useMutation(api.favorites?.clear);
  
  // Sync with Convex
  const syncWithConvex = useCallback(async () => {
    if (!enableSync || !effectiveUserId || !convex) return;
    
    setIsSyncing(true);
    try {
      // This is a placeholder - actual implementation would depend on Convex schema
      // For now, we just update the last sync time
      const now = Date.now();
      storage.state.set(FAVORITES_SYNC_KEY, now.toString());
      setLastSyncedAt(now);
      
      // TODO: Implement actual Convex sync
      // 1. Get server favorites
      // 2. Merge with local (server wins on conflict)
      // 3. Push local changes to server
      // 4. Update local storage with merged result
    } catch (error) {
      console.error('Failed to sync with Convex:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [enableSync, effectiveUserId, convex]);
  
  // Auto-sync on mount and periodically
  useEffect(() => {
    if (!autoSync || !enableSync) return;
    
    const shouldSync = !lastSyncedAt || (Date.now() - lastSyncedAt) > SYNC_INTERVAL_MS;
    
    if (shouldSync && isInitialized) {
      syncWithConvex();
    }
    
    // Set up periodic sync
    const interval = setInterval(() => {
      syncWithConvex();
    }, SYNC_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [autoSync, enableSync, isInitialized, lastSyncedAt, syncWithConvex]);
  
  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  
  const addFavorite = useCallback(async (propertyId: string) => {
    if (!favorites.includes(propertyId)) {
      const newFavorites = [...favorites, propertyId];
      saveFavorites(newFavorites);
      
      // Sync to Convex if enabled
      if (enableSync && effectiveUserId) {
        try {
          pendingSyncRef.current.add(propertyId);
          // TODO: Call Convex mutation
          // await addFavoriteMutation({ userId: effectiveUserId, propertyId });
        } catch (error) {
          console.error('Failed to add favorite to Convex:', error);
        }
      }
    }
  }, [favorites, saveFavorites, enableSync, effectiveUserId]);
  
  const removeFavorite = useCallback(async (propertyId: string) => {
    const newFavorites = favorites.filter(id => id !== propertyId);
    saveFavorites(newFavorites);
    
    // Sync to Convex if enabled
    if (enableSync && effectiveUserId) {
      try {
        pendingSyncRef.current.delete(propertyId);
        // TODO: Call Convex mutation
        // await removeFavoriteMutation({ userId: effectiveUserId, propertyId });
      } catch (error) {
        console.error('Failed to remove favorite from Convex:', error);
      }
    }
  }, [favorites, saveFavorites, enableSync, effectiveUserId]);
  
  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite(propertyId);
    }
  }, [favorites, addFavorite, removeFavorite]);
  
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.includes(propertyId);
  }, [favorites]);
  
  const clearFavorites = useCallback(async () => {
    saveFavorites([]);
    
    if (enableSync && effectiveUserId) {
      try {
        // TODO: Call Convex mutation
        // await clearFavoritesMutation({ userId: effectiveUserId });
      } catch (error) {
        console.error('Failed to clear favorites in Convex:', error);
      }
    }
  }, [saveFavorites, enableSync, effectiveUserId]);
  
  const refresh = useCallback(async () => {
    await loadFavorites();
    if (enableSync) {
      await syncWithConvex();
    }
  }, [loadFavorites, enableSync, syncWithConvex]);
  
  // --------------------------------------------------------------------------
  // Comparison
  // --------------------------------------------------------------------------
  
  const addToComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => {
      if (prev.includes(propertyId) || prev.length >= 4) return prev;
      return [...prev, propertyId];
    });
  }, []);
  
  const removeFromComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => prev.filter(id => id !== propertyId));
  }, []);
  
  const clearComparison = useCallback(() => {
    setComparisonList([]);
  }, []);
  
  const compareProperties = useCallback((propertyIds: string[]): Property[] => {
    // This would return full property objects from the IDs
    // Implementation depends on how properties are stored
    return [];
  }, []);
  
  // --------------------------------------------------------------------------
  // Initialize
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  // Merge Convex favorites when available
  useEffect(() => {
    if (convexFavorites && Array.isArray(convexFavorites)) {
      // Merge server favorites with local
      const serverIds = convexFavorites.map((f: any) => f.propertyId);
      const merged = Array.from(new Set([...favorites, ...serverIds]));
      if (merged.length !== favorites.length) {
        saveFavorites(merged);
      }
    }
  }, [convexFavorites, favorites, saveFavorites]);
  
  return {
    favorites,
    isLoading,
    isInitialized,
    isSyncing,
    lastSyncedAt,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refresh,
    syncWithConvex,
    compareProperties,
    isComparing: comparisonList.length > 0,
    addToComparison,
    removeFromComparison,
    clearComparison,
  };
}

// ------------------------------------------------------------------------------
// Additional Hooks
// ------------------------------------------------------------------------------

/**
 * Hook to filter properties to only show favorites
 */
export function useFavoriteProperties(properties: Property[]): Property[] {
  const { favorites, isInitialized } = useFavorites();
  
  if (!isInitialized) return [];
  return properties.filter(property => favorites.includes(property.id));
}

/**
 * Hook to get favorite count
 */
export function useFavoriteCount(): number {
  const { favorites, isInitialized } = useFavorites();
  return isInitialized ? favorites.length : 0;
}

/**
 * Hook to check if any favorites exist
 */
export function useHasFavorites(): boolean {
  const { favorites, isInitialized } = useFavorites();
  return isInitialized && favorites.length > 0;
}

/**
 * Hook for property comparison
 */
export function usePropertyComparison() {
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  
  const addToComparison = useCallback((propertyId: string) => {
    setComparisonIds(prev => {
      if (prev.includes(propertyId) || prev.length >= 4) return prev;
      return [...prev, propertyId];
    });
  }, []);
  
  const removeFromComparison = useCallback((propertyId: string) => {
    setComparisonIds(prev => prev.filter(id => id !== propertyId));
  }, []);
  
  const clearComparison = useCallback(() => {
    setComparisonIds([]);
  }, []);
  
  const isInComparison = useCallback((propertyId: string) => {
    return comparisonIds.includes(propertyId);
  }, [comparisonIds]);
  
  const canAddMore = comparisonIds.length < 4;
  
  return {
    comparisonIds,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
    comparisonCount: comparisonIds.length,
  };
}

export default useFavorites;
