/**
 * HAUS Design Tokens - Transitions
 * Animation and motion design inspired by Porsche Design System
 */

// ============ Duration Scale ============
export const duration = {
  instant: "0ms",
  fast: "150ms",
  base: "200ms",
  normal: "300ms",
  slow: "500ms",
  slower: "750ms",
} as const;

// ============ Easing Functions ============
export const easing = {
  // Linear - constant speed
  linear: "linear",

  // Ease in - starts slow, accelerates
  "ease-in": "ease-in",
  "ease-in-quad": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
  "ease-in-cubic": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",

  // Ease out - starts fast, decelerates (recommended for most UI)
  "ease-out": "ease-out",
  "ease-out-quad": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  "ease-out-cubic": "cubic-bezier(0.215, 0.61, 0.355, 1)",

  // Ease in-out - slow at both ends
  "ease-in-out": "ease-in-out",
  "ease-in-out-quad": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
  "ease-in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1)",

  // Custom HAUS easing
  "haus-default": "cubic-bezier(0.4, 0, 0.2, 1)",
  "haus-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// ============ Semantic Transitions ============
export const transition = {
  // Interactive elements
  button: `${duration.base} ${easing["haus-default"]}`,
  "button-hover": `${duration.fast} ${easing["ease-out"]}`,
  "button-active": `${duration.instant} ${easing["ease-out"]}`,

  // Form elements
  input: `${duration.base} ${easing["haus-default"]}`,
  "input-focus": `${duration.fast} ${easing["ease-out-cubic"]}`,

  // Navigation
  "nav-item": `${duration.base} ${easing["haus-default"]}`,
  dropdown: `${duration.fast} ${easing["ease-out-cubic"]}`,
  modal: `${duration.normal} ${easing["ease-out-cubic"]}`,
  drawer: `${duration.normal} ${easing["ease-out-cubic"]}`,

  // Overlays
  overlay: `${duration.normal} ${easing["ease-out"]}`,

  // Cards and lists
  card: `${duration.base} ${easing["haus-default"]}`,
  "list-item": `${duration.fast} ${easing["ease-out-cubic"]}`,

  // Tooltips
  tooltip: `${duration.fast} ${easing["ease-out-quad"]}`,

  // Page transitions
  page: `${duration.slow} ${easing["ease-in-out-cubic"]}`,

  // Property-specific
  colors: `${duration.fast} ${easing["haus-default"]}`,
  opacity: `${duration.base} ${easing["ease-out"]}`,
  shadow: `${duration.base} ${easing["ease-out"]}`,
  transform: `${duration.base} ${easing["haus-default"]}`,
} as const;

// ============ Animation Delays ============
export const delay = {
  none: "0ms",
  short: "100ms",
  base: "200ms",
  long: "500ms",
} as const;

export default { duration, easing, transition, delay };
