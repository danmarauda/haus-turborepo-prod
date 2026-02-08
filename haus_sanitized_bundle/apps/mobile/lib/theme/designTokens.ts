/**
 * HAUS Design Tokens
 * Complete design system configuration for NativeWind + React Native
 * 
 * Source: constants/designTokens.ts from haus-platform-1
 * Adapted for: NativeWind v4 + Tailwind CSS
 */

// =================================================================
// Color Palettes
// =================================================================

export const colors = {
  // Sky palette
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
  },

  // Blue palette
  blue: {
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
  },

  // Cyan palette
  cyan: {
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
  },

  // Amber palette
  amber: {
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
  },

  // Rose palette
  rose: {
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
  },

  // Emerald palette
  emerald: {
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
  },

  // Neutral palette (Gray scale)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Basic colors
  white: '#ffffff',
  black: '#000000',

  // Semantic colors - Property status
  semantic: {
    sale: '#10b981',
    rent: '#3b82f6',
    auction: '#f59e0b',
    offmarket: '#737373',
  },
} as const;

// =================================================================
// Semantic Colors for Property Status
// =================================================================

export const propertyStatusColors = {
  sale: {
    DEFAULT: '#10b981',
    light: '#6ee7b7',
    dark: '#059669',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  rent: {
    DEFAULT: '#3b82f6',
    light: '#93c5fd',
    dark: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  auction: {
    DEFAULT: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  offmarket: {
    DEFAULT: '#737373',
    light: '#a3a3a3',
    dark: '#525252',
    bg: 'rgba(115, 115, 115, 0.15)',
    border: 'rgba(115, 115, 115, 0.2)',
  },
} as const;

// =================================================================
// Category Colors for AI Features
// =================================================================

export const categoryColors = {
  learn: {
    bg: 'rgba(14, 165, 233, 0.15)',
    border: 'rgba(14, 165, 233, 0.2)',
    text: '#7dd3fc',
  },
  plan: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.2)',
    text: '#93c5fd',
  },
  explore: {
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.2)',
    text: '#67e8f9',
  },
  prepare: {
    bg: 'rgba(14, 165, 233, 0.15)',
    border: 'rgba(14, 165, 233, 0.2)',
    text: '#7dd3fc',
  },
  apply: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.2)',
    text: '#93c5fd',
  },
  collaborate: {
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.2)',
    text: '#67e8f9',
  },
} as const;

export type CategoryType = keyof typeof categoryColors;

// =================================================================
// Spacing
// =================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// =================================================================
// Border Radius
// =================================================================

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

// =================================================================
// Font Configuration
// =================================================================

export const fontFamily = {
  primary: 'Abel',
  abel: 'Abel',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 18,
  xxl: 19,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '400' as const,
  semibold: '400' as const,
  bold: '400' as const,
  extrabold: '400' as const,
};

// Note: Abel is a regular weight font, all weights map to '400'

// =================================================================
// Opacity Values
// =================================================================

export const opacity = {
  disabled: 0.4,
  subtle: 0.6,
  medium: 0.8,
  high: 0.9,
  full: 1,
} as const;

// =================================================================
// Shadows (React Native StyleSheet compatible)
// =================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// =================================================================
// Gradients
// =================================================================

export const gradients = {
  darkBg: ['#000000', '#171717'],
  lightBg: ['#ffffff', '#f5f5f5'],
  overlay: ['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.35)', 'transparent'],
} as const;

// =================================================================
// Glassmorphism
// =================================================================

export const glass = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  heavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
} as const;

// =================================================================
// Component Styles
// =================================================================

export const components = {
  card: {
    backgroundColor: '#0a0a0a',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  button: {
    primary: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
  },
  iconWrapper: {
    small: {
      width: 28,
      height: 28,
      borderRadius: 10,
      borderWidth: 1,
    },
    medium: {
      width: 32,
      height: 32,
      borderRadius: 12,
      borderWidth: 1,
    },
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
} as const;

// =================================================================
// Complete DesignTokens Object (for backward compatibility)
// =================================================================

export const DesignTokens = {
  fontFamily,
  colors: {
    sky: colors.sky,
    blue: colors.blue,
    cyan: colors.cyan,
    amber: colors.amber,
    rose: colors.rose,
    emerald: colors.emerald,
    neutral: colors.neutral,
    white: colors.white,
    black: colors.black,
  },
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  opacity,
  shadows,
  gradients,
  components,
  categoryColors,
} as const;

export type DesignTokensType = typeof DesignTokens;

// =================================================================
// Helper Functions
// =================================================================

/**
 * Get category color configuration
 */
export function getCategoryColor(category: CategoryType) {
  return categoryColors[category];
}

/**
 * Get property status color configuration
 */
export function getPropertyStatusColor(status: keyof typeof propertyStatusColors) {
  return propertyStatusColors[status];
}

/**
 * Get shadow style by size
 */
export function getShadow(size: keyof typeof shadows) {
  return shadows[size];
}

/**
 * Get spacing value
 */
export function getSpace(size: keyof typeof spacing): number {
  return spacing[size];
}

/**
 * Get border radius value
 */
export function getRadius(size: keyof typeof borderRadius): number {
  return borderRadius[size];
}

/**
 * Get font size value
 */
export function getFontSize(size: keyof typeof fontSize): number {
  return fontSize[size];
}

/**
 * Get glassmorphism style
 */
export function getGlass(intensity: keyof typeof glass) {
  return glass[intensity];
}

/**
 * Get component style
 */
export function getComponentStyle(
  component: keyof typeof components,
  variant?: string
) {
  const comp = components[component];
  if (variant && typeof comp === 'object' && variant in comp) {
    return (comp as Record<string, unknown>)[variant];
  }
  return comp;
}

// =================================================================
// NativeWind Compatible Theme Variables
// =================================================================

import { vars } from 'nativewind';

/**
 * Create CSS variables for NativeWind
 * Use these with the vars() helper from nativewind
 */
export const themeVars = {
  dark: vars({
    '--background': '0 0% 4%',
    '--foreground': '0 0% 98%',
    '--card': '0 0% 4%',
    '--card-foreground': '0 0% 98%',
    '--primary': '199 89% 48%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 15%',
    '--secondary-foreground': '0 0% 98%',
    '--muted': '0 0% 15%',
    '--muted-foreground': '0 0% 64%',
    '--accent': '199 89% 48%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '0 0% 15%',
    '--input': '0 0% 15%',
    '--ring': '199 89% 48%',
  }),
  light: vars({
    '--background': '0 0% 100%',
    '--foreground': '0 0% 4%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 4%',
    '--primary': '199 89% 48%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 96%',
    '--secondary-foreground': '0 0% 9%',
    '--muted': '0 0% 96%',
    '--muted-foreground': '0 0% 45%',
    '--accent': '0 0% 96%',
    '--accent-foreground': '0 0% 9%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '0 0% 90%',
    '--input': '0 0% 90%',
    '--ring': '199 89% 48%',
  }),
} as const;

// Default export for convenience
export default DesignTokens;
