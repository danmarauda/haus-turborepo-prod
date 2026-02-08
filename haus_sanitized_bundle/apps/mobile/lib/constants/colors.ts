import { vars } from 'nativewind';
import { 
  colors as designTokensColors, 
  categoryColors,
  propertyStatusColors,
  themeVars as designTokenThemeVars 
} from '../theme/designTokens';

// =================================================================
// Theme Variables for NativeWind
// =================================================================

export const themes = {
  light: vars({
    '--background': '0 0% 100%',
    '--foreground': '0 0% 4%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 4%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 4%',
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
  dark: vars({
    '--background': '0 0% 4%',
    '--foreground': '0 0% 98%',
    '--card': '0 0% 4%',
    '--card-foreground': '0 0% 98%',
    '--popover': '0 0% 4%',
    '--popover-foreground': '0 0% 98%',
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
};

// =================================================================
// Complete Color System
// =================================================================

export const colors = {
  // =================================================================
  // HAUS Design Token Colors
  // =================================================================
  
  // Neutral palette
  neutral: designTokensColors.neutral,
  
  // Primary accent colors
  sky: designTokensColors.sky,
  blue: designTokensColors.blue,
  cyan: designTokensColors.cyan,
  
  // Status/semantic colors
  amber: designTokensColors.amber,
  rose: designTokensColors.rose,
  emerald: designTokensColors.emerald,
  
  // Basic colors
  white: designTokensColors.white,
  black: designTokensColors.black,

  // =================================================================
  // Semantic Colors - Property Status
  // =================================================================
  
  status: {
    sale: propertyStatusColors.sale,
    rent: propertyStatusColors.rent,
    auction: propertyStatusColors.auction,
    offmarket: propertyStatusColors.offmarket,
  },

  // =================================================================
  // Category Colors - AI Features
  // =================================================================
  
  category: categoryColors,

  // =================================================================
  // Glassmorphism Colors
  // =================================================================
  
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
    borderLight: 'rgba(255, 255, 255, 0.2)',
    borderMedium: 'rgba(255, 255, 255, 0.1)',
  },

  // =================================================================
  // Component Colors
  // =================================================================
  
  components: {
    card: {
      background: '#0a0a0a', // neutral-950
      border: '#262626', // neutral-800
    },
    button: {
      primary: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
      },
    },
    input: {
      background: 'rgba(0, 0, 0, 0.3)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    pill: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },

  // =================================================================
  // Icon Colors (Legacy - maintained for compatibility)
  // =================================================================
  
  icons: {
    base: {
      light: '#000000',
      dark: '#FFFFFF',
    },
    primary: {
      light: '#FF6B35',
      dark: '#FF6B35',
    },
    secondary: {
      light: '#374151',
      dark: '#374151',
    },
    success: {
      light: '#10B981',
      dark: '#10B981',
    },
    error: {
      light: '#EF4444',
      dark: '#EF4444',
    },
    warning: {
      light: '#F59E0B',
      dark: '#F59E0B',
    },
    info: {
      light: '#3B82F6',
      dark: '#3B82F6',
    },
    muted: {
      light: '#9CA3AF',
      dark: '#9CA3AF',
    },
  },
};

// =================================================================
// Helper Functions
// =================================================================

/**
 * Get color for a property status
 */
export function getStatusColor(status: 'sale' | 'rent' | 'auction' | 'offmarket') {
  return colors.status[status];
}

/**
 * Get category color for AI features
 */
export function getCategoryColor(category: keyof typeof categoryColors) {
  return colors.category[category];
}

/**
 * Get icon color based on theme
 */
export function getIconColor(
  type: keyof typeof colors.icons,
  isDark: boolean
): string {
  const iconColor = colors.icons[type];
  return isDark ? iconColor.dark : iconColor.light;
}

/**
 * Get glassmorphism color by intensity
 */
export function getGlassColor(intensity: 'light' | 'medium' | 'heavy' | 'dark'): string {
  return colors.glass[intensity];
}

/**
 * Convert hex to rgba with opacity
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// =================================================================
// Re-exports from designTokens for convenience
// =================================================================

export { categoryColors, propertyStatusColors, designTokensThemeVars };
export type { CategoryType } from '../theme/designTokens';

// Default export
export default colors;
