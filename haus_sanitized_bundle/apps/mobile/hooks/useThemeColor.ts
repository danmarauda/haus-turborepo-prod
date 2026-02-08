/**
 * Theme color hook for React Native
 *
 * Simple theme colors that match the HAUS design system
 */

import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

type ThemeColorName =
  | 'background'
  | 'background-secondary'
  | 'text'
  | 'text-secondary'
  | 'border'
  | 'tint';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
): string {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeColors: Record<ThemeColorName, { light: string; dark: string }> = {
    background: { light: '#ffffff', dark: '#0a0a0a' },
    'background-secondary': { light: '#f5f5f5', dark: '#0f0f0f' },
    text: { light: '#0a0a0a', dark: '#ffffff' },
    'text-secondary': { light: '#737373', dark: '#a3a3a3' },
    border: { light: '#e5e5e5', dark: '#1a1a1a' },
    tint: { light: '#3b82f6', dark: '#3b82f6' },
  };

  const fallback = isDark ? '#0a0a0a' : '#ffffff';

  return useMemo(() => {
    if (props.light && props.dark) {
      return isDark ? props.dark : props.light;
    }

    return themeColors[colorName]?.[isDark ? 'dark' : 'light'] ?? fallback;
  }, [colorName, isDark, props, themeColors, fallback]);
}
