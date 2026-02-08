/**
 * HAUS Design Tokens - Breakpoints
 * Responsive design breakpoints inspired by Porsche Design System
 */

// ============ Breakpoint Scale ============
export const breakpoint = {
  // Extra small devices (portrait phones)
  xs: "375px",

  // Small devices (landscape phones)
  sm: "640px",

  // Medium devices (tablets)
  md: "768px",

  // Large devices (desktops)
  lg: "1024px",

  // Extra large devices (large desktops)
  xl: "1280px",

  // Extra extra large devices (very large screens)
  "2xl": "1536px",
} as const;

// ============ Semantic Breakpoints ============
export const breakpointSemantic = {
  // Container queries
  "container-sm": breakpoint.sm,
  "container-md": breakpoint.md,
  "container-lg": breakpoint.lg,
  "container-xl": breakpoint.xl,

  // Layout shifts
  mobile: breakpoint.xs,
  tablet: breakpoint.md,
  desktop: breakpoint.lg,
  wide: breakpoint.xl,

  // Component-specific
  "grid-collapse": breakpoint.sm,
  "grid-expand": breakpoint.lg,
  "nav-collapse": breakpoint.md,
  "nav-expand": breakpoint.lg,
} as const;

// ============ Screen Sizes ============
export const screen = {
  // Width ranges for responsive utilities
  "max-xs": "374px",
  "max-sm": "639px",
  "max-md": "767px",
  "max-lg": "1023px",
  "max-xl": "1279px",
  "max-2xl": "1535px",

  // Min-width queries
  "min-xs": breakpoint.xs,
  "min-sm": breakpoint.sm,
  "min-md": breakpoint.md,
  "min-lg": breakpoint.lg,
  "min-xl": breakpoint.xl,
  "min-2xl": breakpoint["2xl"],
} as const;

export default { breakpoint, breakpointSemantic, screen };
