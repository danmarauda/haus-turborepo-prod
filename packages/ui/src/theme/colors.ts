/**
 * HAUS Design Tokens - Colors
 * Aligned with haus-gais design system for visual parity
 */

// ============ Base Colors ============
export const colorBase = {
  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",
} as const;

// ============ Neutral Scale (haus-gais standard) ============
export const neutral = {
  950: "#0A0A0A",
  900: "#171717",
  800: "#262626",
  700: "#404040",
  600: "#525252",
  500: "#737373",
  400: "#a3a3a3",
  300: "#d4d4d4",
  200: "#e5e5e5",
  100: "#f5f5f5",
  50: "#fafafa",
} as const;

// ============ Accent Colors (haus-gais standard) ============
export const emerald = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
  950: "#022c22",
} as const;

export const indigo = {
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
  950: "#1e1b4b",
} as const;

// ============ HAUS Gold (Premium Accent) ============
export const hausGold = {
  50: "#FBF8E8",
  100: "#F5F0D0",
  200: "#EBE0A6",
  300: "#E0D07C",
  400: "#D6C052",
  500: "#D4AF37", // Primary HAUS Gold
  600: "#B5932F",
  700: "#967727",
  800: "#785B1F",
  900: "#5A4317",
  950: "#3D2C0F",
} as const;

// ============ Light Theme ============
export const colorLight = {
  // Backgrounds
  background: "#FFFFFF",
  backgroundSecondary: neutral[100],
  backgroundTertiary: neutral[200],

  // Surface
  surface: neutral[50],
  surfaceElevated: "#FFFFFF",

  // Primary (White CTA - haus-gais style)
  primary: "#000000",
  primaryHover: neutral[800],
  primaryActive: neutral[700],
  primarySubtle: neutral[100],

  // Text
  textPrimary: "#000000",
  textSecondary: neutral[600],
  textTertiary: neutral[500],
  textInverse: "#FFFFFF",

  // Border
  border: neutral[200],
  borderStrong: neutral[300],
  borderSubtle: neutral[100],

  // States
  hover: neutral[100],
  active: neutral[200],
  selected: emerald[50],
  focus: emerald[500],

  // Status (haus-gais emerald-based)
  success: emerald[500],
  successBackground: emerald[50],
  warning: "#F59E0B",
  warningBackground: "#FEF3C7",
  error: "#EF4444",
  errorBackground: "#FEE2E2",
  info: "#3B82F6",
  infoBackground: "#DBEAFE",
} as const;

// ============ Dark Theme (haus-gais standard) ============
export const colorDark = {
  // Backgrounds - true blacks
  background: neutral[950],
  backgroundSecondary: neutral[900],
  backgroundTertiary: neutral[800],

  // Surface
  surface: neutral[900],
  surfaceElevated: neutral[800],

  // Primary (White CTA - haus-gais style)
  primary: "#FFFFFF",
  primaryHover: neutral[200],
  primaryActive: neutral[300],
  primarySubtle: "rgba(255, 255, 255, 0.1)",

  // Text
  textPrimary: neutral[100],
  textSecondary: neutral[400],
  textTertiary: neutral[500],
  textInverse: "#000000",

  // Border - white transparency (haus-gais pattern)
  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(255, 255, 255, 0.2)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",

  // States
  hover: "rgba(255, 255, 255, 0.05)",
  active: "rgba(255, 255, 255, 0.08)",
  selected: "rgba(16, 185, 129, 0.15)", // Emerald-based
  focus: emerald[500],

  // Status (haus-gais emerald-based)
  success: emerald[500],
  successBackground: "rgba(16, 185, 129, 0.15)",
  warning: "#F59E0B",
  warningBackground: "rgba(245, 158, 11, 0.15)",
  error: "#EF4444",
  errorBackground: "rgba(239, 68, 68, 0.15)",
  info: "#3B82F6",
  infoBackground: "rgba(59, 130, 246, 0.15)",
} as const;

// ============ Semantic Colors (haus-gais aligned) ============
export const colorSemantic = {
  // Positive states - emerald primary
  success: emerald[500],
  successSubtle: emerald[100],

  // Warning states
  warning: "#F59E0B",
  warningSubtle: "#FEF3C7",

  // Error states
  error: "#EF4444",
  errorSubtle: "#FEE2E2",

  // Information
  info: "#3B82F6",
  infoSubtle: "#DBEAFE",

  // Indigo highlight - haus-gais secondary accent
  highlight: indigo[500],
  highlightSubtle: indigo[100],

  // DUD (Do Not Use) - special HAUS indicator
  dud: "#DC2626",
  dudSubtle: "#FEE2E2",

  // Primary accent colors
  primary: "#FFFFFF",
  accent: emerald[500],
  
  // HAUS Gold accent
  gold: hausGold[500],
  goldSubtle: hausGold[100],
} as const;

// ============ Gradients ============
export const gradient = {
  primary: `linear-gradient(135deg, ${emerald[500]} 0%, ${emerald[600]} 100%)`,
  surface:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
  glass:
    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
  // haus-gais gradient patterns
  heroFade:
    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, transparent 100%)",
  cardOverlay:
    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
  gold: `linear-gradient(135deg, ${hausGold[400]} 0%, ${hausGold[500]} 50%, ${hausGold[600]} 100%)`,
} as const;

// ============ Shadow Colors (haus-gais enhanced) ============
export const shadowColors = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  "3xl": "0 32px 80px rgba(0, 0, 0, 0.9)", // haus-gais modal shadow
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  glow: "0 0 20px rgba(16, 185, 129, 0.3)", // Emerald glow
  glowIndigo: "0 0 20px rgba(99, 102, 241, 0.3)", // Indigo glow
  glowGold: "0 0 20px rgba(212, 175, 55, 0.3)", // Gold glow
} as const;

// ============ Shading ============
export const shading = {
  light: {
    100: "rgba(255, 255, 255, 0.9)",
    200: "rgba(255, 255, 255, 0.7)",
    300: "rgba(255, 255, 255, 0.5)",
    400: "rgba(255, 255, 255, 0.3)",
    500: "rgba(255, 255, 255, 0.15)",
    600: "rgba(255, 255, 255, 0.1)",
    700: "rgba(255, 255, 255, 0.05)",
  },
  dark: {
    100: "rgba(0, 0, 0, 0.9)",
    200: "rgba(0, 0, 0, 0.7)",
    300: "rgba(0, 0, 0, 0.5)",
    400: "rgba(0, 0, 0, 0.3)",
    500: "rgba(0, 0, 0, 0.15)",
    600: "rgba(0, 0, 0, 0.1)",
    700: "rgba(0, 0, 0, 0.05)",
  },
} as const;

export default {
  base: colorBase,
  neutral,
  emerald,
  indigo,
  hausGold,
  light: colorLight,
  dark: colorDark,
  semantic: colorSemantic,
  gradient,
  shadow: shadowColors,
  shading,
};
