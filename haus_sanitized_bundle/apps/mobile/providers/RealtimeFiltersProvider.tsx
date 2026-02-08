/**
 * Realtime Filters Provider
 * 
 * Manages collaborative filtering state with MMKV persistence
 * Tracks filter preferences and user presence for real-time collaboration
 * Migrated from in-memory state to MMKV-backed storage
 */

import React, { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { storage, prefs } from '@/lib/storage';

export type Filters = {
  /** Minimum price filter */
  priceMin: number;
  /** Maximum price filter */
  priceMax: number;
  /** Maximum distance in kilometers */
  distanceKm: number;
  /** Optional property types filter */
  propertyTypes?: string[];
  /** Optional amenities filter */
  amenities?: string[];
};

export type Presence = {
  /** Unique user identifier */
  userId: string;
  /** Display name for the user */
  displayName: string;
  /** Last seen timestamp */
  lastSeen: number;
  /** Current filter being viewed */
  currentFilter?: string;
};

export interface RealtimeFiltersContextType {
  /** Current room/collaboration session ID */
  roomId: string | null;
  /** Set the current room ID */
  setRoomId: (roomId: string | null) => void;
  /** Current filter values */
  filters: Filters;
  /** Update a specific filter value */
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  /** Update multiple filters at once */
  updateFilters: (newFilters: Partial<Filters>) => void;
  /** Reset filters to defaults */
  resetFilters: () => void;
  /** Other users in the same room */
  members: Presence[];
  /** Current user's presence info */
  me: Presence | null;
  /** Loading state */
  isLoading: boolean;
  /** Save current filters as preset */
  saveFilterPreset: (name: string) => void;
  /** Load a saved filter preset */
  loadFilterPreset: (name: string) => Filters | null;
  /** Get all saved filter presets */
  getFilterPresets: () => Record<string, Filters>;
  /** Delete a saved filter preset */
  deleteFilterPreset: (name: string) => void;
}

const RealtimeFiltersContext = createContext<RealtimeFiltersContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  FILTERS: 'realtime_filters',
  ROOM_ID: 'realtime_room_id',
  FILTER_PRESETS: 'filter_presets',
};

// Default filter values
const DEFAULT_FILTERS: Filters = {
  priceMin: 500,
  priceMax: 1100,
  distanceKm: 10,
  propertyTypes: [],
  amenities: [],
};

export const RealtimeFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [roomId, setRoomIdState] = useState<string | null>(null);
  const [members, setMembers] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate stable user ID
  const me = useMemo<Presence>(() => {
    const userId = storage.app.getString('user_id') || `user_${Date.now()}`;
    storage.app.set('user_id', userId);
    return {
      userId,
      displayName: 'You',
      lastSeen: Date.now(),
    };
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        setIsLoading(true);
        
        // Load saved filters
        const savedFilters = storage.state.getString(STORAGE_KEYS.FILTERS);
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          setFilters({ ...DEFAULT_FILTERS, ...parsed });
        }

        // Load saved room ID
        const savedRoomId = storage.state.getString(STORAGE_KEYS.ROOM_ID);
        if (savedRoomId) {
          setRoomIdState(savedRoomId);
        }
      } catch (error) {
        console.error('Failed to load realtime filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
  }, []);

  // Persist filters to MMKV whenever they change
  useEffect(() => {
    if (!isLoading) {
      storage.state.set(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    }
  }, [filters, isLoading]);

  // Persist room ID to MMKV
  const setRoomId = useCallback((newRoomId: string | null) => {
    setRoomIdState(newRoomId);
    if (newRoomId) {
      storage.state.set(STORAGE_KEYS.ROOM_ID, newRoomId);
    } else {
      storage.state.delete(STORAGE_KEYS.ROOM_ID);
    }
    
    // Reset members when room changes
    setMembers(newRoomId ? [{ ...me, lastSeen: Date.now() }] : []);
  }, [me]);

  // Update a single filter value
  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filter values
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    storage.state.delete(STORAGE_KEYS.FILTERS);
  }, []);

  // Save current filters as a named preset
  const saveFilterPreset = useCallback((name: string) => {
    const presets = getFilterPresetsInternal();
    presets[name] = { ...filters };
    prefs.set(STORAGE_KEYS.FILTER_PRESETS, presets);
  }, [filters]);

  // Load a saved filter preset
  const loadFilterPreset = useCallback((name: string): Filters | null => {
    const presets = getFilterPresetsInternal();
    const preset = presets[name];
    if (preset) {
      setFilters(preset);
      return preset;
    }
    return null;
  }, []);

  // Get all saved filter presets
  const getFilterPresets = useCallback((): Record<string, Filters> => {
    return getFilterPresetsInternal();
  }, []);

  // Delete a saved filter preset
  const deleteFilterPreset = useCallback((name: string) => {
    const presets = getFilterPresetsInternal();
    delete presets[name];
    prefs.set(STORAGE_KEYS.FILTER_PRESETS, presets);
  }, []);

  // Helper to get presets from storage
  const getFilterPresetsInternal = (): Record<string, Filters> => {
    return prefs.get<Record<string, Filters>>(STORAGE_KEYS.FILTER_PRESETS, {}) ?? {};
  };

  // Presence heartbeat simulation (for demo/local mode)
  useEffect(() => {
    if (!roomId) {
      setMembers([]);
      return;
    }

    // Initialize with self
    setMembers([{ ...me, lastSeen: Date.now() }]);

    // Setup heartbeat to update lastSeen
    heartbeatRef.current = setInterval(() => {
      setMembers(curr => 
        curr.map(m => 
          m.userId === me.userId 
            ? { ...m, lastSeen: Date.now() } 
            : m
        )
      );
    }, 5000);

    // Handle app state changes
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state !== 'active' && heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      } else if (state === 'active' && !heartbeatRef.current) {
        heartbeatRef.current = setInterval(() => {
          setMembers(curr => 
            curr.map(m => 
              m.userId === me.userId 
                ? { ...m, lastSeen: Date.now() } 
                : m
            )
          );
        }, 5000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      subscription.remove();
    };
  }, [roomId, me]);

  const value: RealtimeFiltersContextType = {
    roomId,
    setRoomId,
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    members,
    me,
    isLoading,
    saveFilterPreset,
    loadFilterPreset,
    getFilterPresets,
    deleteFilterPreset,
  };

  return (
    <RealtimeFiltersContext value={value}>
      {children}
    </RealtimeFiltersContext>
  );
};

/**
 * Hook to access realtime filters context
 */
export const useRealtimeFilters = (): RealtimeFiltersContextType => {
  const context = use(RealtimeFiltersContext);
  if (!context) {
    throw new Error('useRealtimeFilters must be used within a RealtimeFiltersProvider');
  }
  return context;
};

export default RealtimeFiltersContext;
