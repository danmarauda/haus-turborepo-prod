/**
 * HAUS Design System - All Tokens
 * Central export for all design tokens (haus-gais aligned)
 */

export * from "./breakpoints";
export * from "./colors";
export * from "./cross-platform";
export * from "./shadows";
export * from "./spacing";
export * from "./transitions";
export * from "./typography";

import { breakpoint, breakpointSemantic, screen } from "./breakpoints";
import {
  colorBase,
  colorSemantic,
  colorDark,
  colorLight,
  emerald,
  hausGold,
  indigo,
  neutral,
} from "./colors";
import { elevation, shadow, shadowSemantic } from "./shadows";
import {
  borderRadius,
  containerWidth,
  spacing,
  spacingSemantic,
} from "./spacing";
import { delay, duration, easing, transition } from "./transitions";
import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
} from "./typography";

// Complete token system
export const tokens = {
  colors: {
    base: colorBase,
    semantic: colorSemantic,
    // haus-gais color scales
    neutral,
    emerald,
    indigo,
    hausGold,
    // Theme colors
    light: colorLight,
    dark: colorDark,
  },
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing: {
    scale: spacing,
    semantic: spacingSemantic,
    // haus-gais additions
    containers: containerWidth,
    radius: borderRadius,
  },
  shadows: {
    base: shadow,
    semantic: shadowSemantic,
    elevation,
  },
  breakpoints: {
    scale: breakpoint,
    semantic: breakpointSemantic,
    screen,
  },
  transitions: {
    duration,
    easing,
    semantic: transition,
    delay,
  },
} as const;

export default tokens;
