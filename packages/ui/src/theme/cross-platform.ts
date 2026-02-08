/**
 * HAUS Design Tokens - Cross-Platform
 * Shared token definitions for Web (Next.js) and Mobile (React Native/Expo)
 *
 * Web: Uses CSS variables, OKLCH colors, rem units
 * Mobile: Uses Hex/RGBA colors, numeric px values
 */

// ============ Cross-Platform Colors ============
// These are platform-agnostic hex/rgba values that work everywhere
export const crossPlatformColors = {
  // Base
  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",

  // Dark Theme (Primary for HAUS)
  dark: {
    background: "#09090B",
    backgroundSecondary: "#0C0C0E",
    backgroundTertiary: "#101013",
    surface: "#0C0C0E",
    surfaceElevated: "#141417",
    textPrimary: "#FAFAFA",
    textSecondary: "#A1A1AA",
    textTertiary: "#71717A",
    border: "rgba(255, 255, 255, 0.1)",
    borderStrong: "rgba(255, 255, 255, 0.15)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
  },

  // Light Theme
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#E8E8E8",
    surface: "#FAFAFA",
    surfaceElevated: "#FFFFFF",
    textPrimary: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    border: "#E0E0E0",
    borderStrong: "#CCCCCC",
    borderSubtle: "#F0F0F0",
  },

  // Brand Colors
  primary: "#3B82F6",
  primaryHover: "#60A5FA",
  primaryActive: "#2563EB",

  // HAUS Gold
  gold: "#D4AF37",
  goldHover: "#E5C76B",
  goldActive: "#B5932F",

  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // DUD (Trust) Colors
  dud: "#DC2626",
  dudSubtle: "#FEE2E2",
} as const;

// ============ Cross-Platform Spacing (px values) ============
// React Native uses numeric values, web can convert to rem
export const crossPlatformSpacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;

// ============ Cross-Platform Typography ============
export const crossPlatformTypography = {
  fontFamily: {
    display: "Abel",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },
  fontWeight: {
    thin: "100" as const,
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

// ============ Cross-Platform Shadows (React Native format) ============
export const crossPlatformShadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
} as const;

// ============ Cross-Platform Border Radius ============
export const crossPlatformRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
} as const;

// ============ Unified Export ============
export const crossPlatformTokens = {
  colors: crossPlatformColors,
  spacing: crossPlatformSpacing,
  typography: crossPlatformTypography,
  shadows: crossPlatformShadows,
  radius: crossPlatformRadius,
} as const;

export default crossPlatformTokens;
