/**
 * HAUS Design Tokens - Shadows
 * Elevation and depth system inspired by Porsche Design System
 */

// ============ Shadow Scale ============
export const shadow = {
  // No shadow
  none: "none",

  // Subtle shadows for elevated elements
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",

  // Default shadow for cards, modals
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",

  // Medium elevation for dropdowns, popovers
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

  // High elevation for modals, panels
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

  // Maximum elevation for tooltips, notifications
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

  // Extra large for dramatic elevation
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Inner shadow for inset elements
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// ============ Semantic Shadows ============
export const shadowSemantic = {
  // Component-specific shadows
  "card-sm": shadow.sm,
  "card-base": shadow.base,
  "card-lg": shadow.lg,

  modal: shadow.xl,
  popover: shadow.lg,
  tooltip: shadow["2xl"],
  dropdown: shadow.md,

  // Interactive states
  "button-rest": shadow.none,
  "button-hover": shadow.sm,
  "button-active": shadow.inner,

  "input-rest": shadow.none,
  "input-focus": "0 0 0 3px rgb(59 130 246 / 0.1)", // Blue glow

  // Navigation
  navbar: shadow.sm,
  sidebar: shadow.lg,
  drawer: shadow.xl,
} as const;

// ============ Elevation Levels (Z-Index) ============
export const elevation = {
  // Base layer
  base: 0,

  // Raised elements
  raised: 10,

  // Dropdowns, popovers
  dropdown: 100,
  popover: 100,

  // Sticky headers
  sticky: 200,

  // Modals, overlays
  modal: 1000,
  overlay: 1000,

  // Tooltips, notifications
  tooltip: 1100,
  notification: 1100,

  // Maximum
  max: 9999,
} as const;

export default { shadow, shadowSemantic, elevation };
