/**
 * HAUS Design Tokens - Spacing
 * Aligned with haus-gais design system for visual parity
 */

// ============ Spacing Scale ============
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px - haus-gais py-32 section padding
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
  112: "28rem", // 448px
  128: "32rem", // 512px
  144: "36rem", // 576px
  160: "40rem", // 640px
} as const;

// ============ Container Widths (haus-gais scale) ============
export const containerWidth = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px", // haus-gais max-w-[1400px]
  "3xl": "1600px", // haus-gais max-w-[1600px]
} as const;

// ============ Semantic Spacing (haus-gais aligned) ============
export const spacingSemantic = {
  // Layout - haus-gais container widths
  container: containerWidth.xl,
  "container-2xl": containerWidth["2xl"],
  "container-3xl": containerWidth["3xl"],
  "content-sm": containerWidth.sm,
  "content-md": containerWidth.md,
  "content-lg": containerWidth.lg,
  "content-xl": containerWidth.xl,

  // Section spacing - haus-gais generous padding
  "section-y": spacing[32], // py-32 (8rem/128px)
  "section-x": spacing[6], // px-6 (1.5rem/24px) mobile
  "section-x-md": spacing[20], // md:px-20 (5rem/80px) desktop
  "section-gap": spacing[16], // 64px between sections

  // Components - haus-gais spacing
  "card-gap": spacing[6], // 24px gap-6 between cards
  "card-gap-lg": spacing[8], // 32px gap-8 larger card grids
  "input-gap": spacing[3], // 12px between inputs
  "button-gap": spacing[2], // 8px between buttons

  // UI Elements
  "icon-sm": spacing[2], // 8px icon
  "icon-md": spacing[3], // 12px icon
  "icon-lg": spacing[4], // 16px icon
} as const;

// ============ Border Radius (haus-gais larger radii) ============
export const borderRadius = {
  none: "0",
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px - rounded-2xl
  xl: "1.5rem", // 24px - rounded-3xl (haus-gais cards)
  "2xl": "2rem", // 32px - haus-gais section cards
  "3xl": "3rem", // 48px - haus-gais hero cards (rounded-[3rem])
  "4xl": "2.5rem", // 40px - extra large
  full: "9999px", // Full circle
} as const;

export default {
  spacing,
  containerWidth,
  spacingSemantic,
  borderRadius,
};
