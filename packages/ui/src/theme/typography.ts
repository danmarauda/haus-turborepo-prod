/**
 * HAUS Design Tokens - Typography
 * Aligned with haus-gais design system for visual parity
 */

// ============ Font Families (haus-gais stack) ============
export const fontFamily = {
  // Primary body font - Geist (haus-gais standard)
  sans: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Geist - primary body font
  geist:
    '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Inter - fallback body font
  inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Display font for large headings - Space Grotesk
  display: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',

  // Bricolage Grotesque - section headers and brand text
  bricolage:
    '"Bricolage Grotesque", -apple-system, BlinkMacSystemFont, sans-serif',

  // Playfair Display - serif accent (haus-gais editorial)
  serif: '"Playfair Display", Georgia, serif',

  // Body font for content (alias to geist)
  body: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Monospace for code/data
  mono: '"JetBrains Mono", "Fira Code", monospace',

  // Alternative display font (optional premium feel)
  premium: '"Cal Sans", "Inter Variable", sans-serif',
} as const;

// ============ Font Sizes (Fluid) ============
export const fontSize = {
  // Display sizes - haus-gais scale
  display: {
    sm: "clamp(2.5rem, 5vw + 1rem, 4rem)", // 40px - 64px
    md: "clamp(3rem, 6vw + 1rem, 5rem)", // 48px - 80px
    lg: "clamp(3.5rem, 7vw + 1rem, 6rem)", // 56px - 96px
    xl: "clamp(4rem, 8vw + 1rem, 7rem)", // 64px - 112px
    // haus-gais hero sizes (viewport-based)
    hero: "19vw", // Full-width hero text
    heroSm: "12vw", // Smaller hero variant
    heroMd: "15vw", // Medium hero variant
  },

  // Heading sizes - haus-gais section headers
  heading: {
    h1: "clamp(2.25rem, 4vw + 1rem, 3.75rem)", // 36px - 60px
    h2: "clamp(1.875rem, 3vw + 0.75rem, 3rem)", // 30px - 48px
    h3: "clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)", // 24px - 36px
    h4: "clamp(1.25rem, 2vw + 0.5rem, 1.75rem)", // 20px - 28px
    h5: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)", // 16px - 20px
    h6: "0.875rem", // 14px (fixed)
  },

  // Body sizes
  body: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
  },

  // Caption/label sizes
  caption: {
    xs: "0.625rem", // 10px
    sm: "0.6875rem", // 11px
    base: "0.75rem", // 12px
  },

  // Mono sizes
  mono: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
  },
} as const;

// ============ Font Weights ============
export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// ============ Line Heights (haus-gais scale) ============
export const lineHeight = {
  none: 1,
  heroTight: 0.8, // haus-gais hero leading-[0.8]
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// ============ Letter Spacing (haus-gais scale) ============
export const letterSpacing = {
  heroTight: "-0.06em", // haus-gais hero tracking-[-0.06em]
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em", // haus-gais uppercase tracking
  widest: "0.1em",
} as const;

// ============ Text Styles ============
export const textStyle = {
  // Hero styles - haus-gais viewport-based
  "hero-xl": {
    fontSize: fontSize.display.hero,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heroTight,
    letterSpacing: letterSpacing.heroTight,
    fontFamily: fontFamily.display,
  },
  "hero-lg": {
    fontSize: fontSize.display.heroMd,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heroTight,
    letterSpacing: letterSpacing.heroTight,
    fontFamily: fontFamily.display,
  },
  "hero-md": {
    fontSize: fontSize.display.heroSm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heroTight,
    letterSpacing: letterSpacing.heroTight,
    fontFamily: fontFamily.display,
  },

  // Display styles
  "display-xl": {
    fontSize: fontSize.display.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },
  "display-lg": {
    fontSize: fontSize.display.lg,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },
  "display-md": {
    fontSize: fontSize.display.md,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },

  // Heading styles
  h1: {
    fontSize: fontSize.heading.h1,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.heading.h2,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.heading.h3,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize.heading.h4,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSize.heading.h5,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSize.heading.h6,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Body styles
  "body-lg": {
    fontSize: fontSize.body.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
  },
  "body-base": {
    fontSize: fontSize.body.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  "body-sm": {
    fontSize: fontSize.body.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.snug,
  },

  // Label/caption styles
  "label-lg": {
    fontSize: fontSize.caption.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase" as const,
  },
  "label-base": {
    fontSize: fontSize.caption.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase" as const,
  },
  "label-sm": {
    fontSize: fontSize.caption.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase" as const,
  },

  // Mono styles
  "mono-base": {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.mono.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  "mono-sm": {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.mono.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.snug,
  },
} as const;

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyle,
};
