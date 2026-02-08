/**
 * Storage Migration Utilities
 * 
 * Handles migration from AsyncStorage to MMKV
 * Run this once on app startup to migrate legacy data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, prefs } from './index';

const MIGRATION_KEYS = {
  THEME: 'theme',
  FAVORITES: 'favorites',
  FILTERS: 'filters',
  MIGRATION_COMPLETE: 'asyncstorage_migration_complete',
};

/**
 * Check if migration has already been completed
 */
export const isMigrationComplete = (): boolean => {
  return storage.app.getBoolean(MIGRATION_KEYS.MIGRATION_COMPLETE) ?? false;
};

/**
 * Mark migration as complete
 */
export const markMigrationComplete = (): void => {
  storage.app.set(MIGRATION_KEYS.MIGRATION_COMPLETE, true);
};

/**
 * Migrate theme preference from AsyncStorage to MMKV
 * Maps 'light' | 'dark' to target's 'light' | 'dark' | 'system'
 */
export const migrateTheme = async (): Promise<boolean> => {
  try {
    const legacyTheme = await AsyncStorage.getItem(MIGRATION_KEYS.THEME);
    
    if (legacyTheme) {
      // Source has 'light' | 'dark', target supports 'light' | 'dark' | 'system'
      // If legacy theme exists, migrate it directly
      if (legacyTheme === 'light' || legacyTheme === 'dark') {
        prefs.set('theme_mode', legacyTheme);
        console.log('🎨 Migrated theme preference:', legacyTheme);
      }
      // Clear legacy storage to prevent re-migration
      await AsyncStorage.removeItem(MIGRATION_KEYS.THEME);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to migrate theme:', error);
    return false;
  }
};

/**
 * Migrate favorites from AsyncStorage to MMKV
 */
export const migrateFavorites = async (): Promise<string[]> => {
  try {
    const legacyFavorites = await AsyncStorage.getItem(MIGRATION_KEYS.FAVORITES);
    
    if (legacyFavorites) {
      const favorites: string[] = JSON.parse(legacyFavorites);
      // Store in MMKV app storage
      storage.app.set('favorites', JSON.stringify(favorites));
      console.log('⭐ Migrated favorites:', favorites.length, 'items');
      // Clear legacy storage
      await AsyncStorage.removeItem(MIGRATION_KEYS.FAVORITES);
      return favorites;
    }
    return [];
  } catch (error) {
    console.error('Failed to migrate favorites:', error);
    return [];
  }
};

/**
 * Migrate filters from AsyncStorage to MMKV
 */
export const migrateFilters = async (): Promise<Record<string, any> | null> => {
  try {
    const legacyFilters = await AsyncStorage.getItem(MIGRATION_KEYS.FILTERS);
    
    if (legacyFilters) {
      const filters = JSON.parse(legacyFilters);
      // Store in MMKV prefs
      prefs.set('saved_filters', filters);
      console.log('🔍 Migrated filters:', filters);
      // Clear legacy storage
      await AsyncStorage.removeItem(MIGRATION_KEYS.FILTERS);
      return filters;
    }
    return null;
  } catch (error) {
    console.error('Failed to migrate filters:', error);
    return null;
  }
};

/**
 * Run complete migration from AsyncStorage to MMKV
 * Should be called once during app initialization
 */
export const runStorageMigration = async (): Promise<{
  themeMigrated: boolean;
  favoritesMigrated: string[];
  filtersMigrated: Record<string, any> | null;
}> => {
  // Check if already migrated
  if (isMigrationComplete()) {
    console.log('✅ Storage migration already completed');
    return {
      themeMigrated: false,
      favoritesMigrated: [],
      filtersMigrated: null,
    };
  }

  console.log('🚀 Starting AsyncStorage → MMKV migration...');

  const results = {
    themeMigrated: await migrateTheme(),
    favoritesMigrated: await migrateFavorites(),
    filtersMigrated: await migrateFilters(),
  };

  // Mark migration as complete
  markMigrationComplete();
  console.log('✅ Storage migration completed');

  return results;
};

/**
 * Clear all legacy AsyncStorage data (useful for clean slate)
 */
export const clearLegacyStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      MIGRATION_KEYS.THEME,
      MIGRATION_KEYS.FAVORITES,
      MIGRATION_KEYS.FILTERS,
    ]);
    console.log('🧹 Cleared legacy AsyncStorage data');
  } catch (error) {
    console.error('Failed to clear legacy storage:', error);
  }
};

/**
 * Check if there's any legacy data that needs migration
 */
export const hasLegacyData = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const legacyKeys = [MIGRATION_KEYS.THEME, MIGRATION_KEYS.FAVORITES, MIGRATION_KEYS.FILTERS];
    return keys.some(key => legacyKeys.includes(key));
  } catch {
    return false;
  }
};
