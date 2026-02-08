/**
 * Colors - Simple color palette for migrated components
 *
 * This is a compatibility layer for components migrated from haus-platform-1.
 * For new components, prefer using the design tokens from lib/theme/designTokens.
 */

const primaryColor = "#38bdf8"; // sky-400
const secondaryColor = "#60a5fa"; // blue-400
const accentColor = "#fbbf24"; // amber-400
const successColor = "#10b981"; // emerald-500
const warningColor = "#fbbf24"; // amber-400
const errorColor = "#f43f5e"; // rose-500

const Colors = {
  light: {
    text: "#171717",
    background: "#fafafa",
    card: "#ffffff",
    tint: primaryColor,
    tabIconDefault: "#a3a3a3",
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    neutral: "#737373",
    border: "#e5e5e5",
    shadow: "rgba(0, 0, 0, 0.05)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    card: "#0a0a0a",
    tint: primaryColor,
    tabIconDefault: "#525252",
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    neutral: "#d4d4d4",
    border: "#262626",
    shadow: "rgba(0, 0, 0, 0.3)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export default Colors;
