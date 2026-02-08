import React, { createContext, use, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { MMKV } from 'react-native-mmkv';
import type { ThemeContextType } from '../types/theme';
import { themes } from '../lib/constants/colors';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user-theme-preference';

// Initialize MMKV storage
const storage = new MMKV();

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const isDark = colorScheme === 'dark';

  // Get current theme variables
  const themeVars = themes[isDark ? 'dark' : 'light'];

  // Initialize theme from MMKV
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedThemeMode = storage.getString('theme_mode') as 'light' | 'dark' | 'system' | null || 'system';
        setThemeMode(savedThemeMode);

        if (savedThemeMode === 'system') {
          // Let Expo handle system theme automatically
          setColorScheme('system');
          if (__DEV__) console.log('🎨 Using system theme (automatic)');
        } else {
          // Apply user-selected theme
          setColorScheme(savedThemeMode);
          if (__DEV__) console.log('🎨 Loading saved theme mode:', savedThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setColorScheme('system');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

  // Log for debug - only in development
  useEffect(() => {
    if (__DEV__) {
      console.log('🎨 Current theme state:', {
        colorScheme,
        themeMode,
        isDark,
      });
    }
  }, [colorScheme, themeMode, isDark]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    try {
      setThemeMode(theme);
      storage.set('theme_mode', theme);

      if (theme === 'system') {
        // Let NativeWind/Expo handle system theme
        setColorScheme('system');
        if (__DEV__) console.log('🎨 Switched to system theme (automatic)');
      } else {
        // Apply manual theme selection
        setColorScheme(theme);
        if (__DEV__) console.log('🎨 Switched to manual theme:', theme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Don't render until theme is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext
      value={{
        isDark,
        themeMode,
        toggleTheme,
        setTheme,
        systemTheme: colorScheme ?? 'light',
        themeVars,
      }}>
      {children}
    </ThemeContext>
  );
};

export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
