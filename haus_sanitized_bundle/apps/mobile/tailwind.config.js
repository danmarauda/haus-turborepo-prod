/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Font Family
      fontFamily: {
        primary: ['Abel', 'system-ui', 'sans-serif'],
        abel: ['Abel', 'system-ui', 'sans-serif'],
      },

      // Colors from HAUS DesignTokens
      colors: {
        // Base semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // HAUS Color Palette - Sky
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },

        // HAUS Color Palette - Blue
        blue: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },

        // HAUS Color Palette - Cyan
        cyan: {
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },

        // HAUS Color Palette - Amber
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },

        // HAUS Color Palette - Rose
        rose: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
        },

        // HAUS Color Palette - Emerald
        emerald: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },

        // HAUS Color Palette - Neutral
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Semantic Colors for Property Status
        sale: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#059669',
        },
        rent: {
          DEFAULT: '#3b82f6',
          light: '#93c5fd',
          dark: '#2563eb',
        },
        auction: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#d97706',
        },
        offmarket: {
          DEFAULT: '#737373',
          light: '#a3a3a3',
          dark: '#525252',
        },

        // Category Colors for AI Features
        category: {
          learn: {
            bg: 'rgba(14,165,233,0.15)',
            border: 'rgba(14,165,233,0.2)',
            text: '#7dd3fc',
          },
          plan: {
            bg: 'rgba(59,130,246,0.15)',
            border: 'rgba(59,130,246,0.2)',
            text: '#93c5fd',
          },
          explore: {
            bg: 'rgba(6,182,212,0.15)',
            border: 'rgba(6,182,212,0.2)',
            text: '#67e8f9',
          },
          prepare: {
            bg: 'rgba(14,165,233,0.15)',
            border: 'rgba(14,165,233,0.2)',
            text: '#7dd3fc',
          },
          apply: {
            bg: 'rgba(59,130,246,0.15)',
            border: 'rgba(59,130,246,0.2)',
            text: '#93c5fd',
          },
          collaborate: {
            bg: 'rgba(6,182,212,0.15)',
            border: 'rgba(6,182,212,0.2)',
            text: '#67e8f9',
          },
        },

        // Glassmorphism backgrounds
        glass: {
          light: 'rgba(255,255,255,0.1)',
          medium: 'rgba(255,255,255,0.15)',
          heavy: 'rgba(255,255,255,0.2)',
          dark: 'rgba(0,0,0,0.3)',
          input: 'rgba(0,0,0,0.3)',
        },

        // Component-specific colors
        cardHaus: '#0a0a0a',
        borderHaus: '#262626',
      },

      // Spacing from DesignTokens
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },

      // Border Radius from DesignTokens
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        full: '999px',
      },

      // Font Sizes from DesignTokens
      fontSize: {
        xs: ['11px', { lineHeight: '14px' }],
        sm: ['12px', { lineHeight: '16px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['15px', { lineHeight: '22px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '26px' }],
        xxl: ['19px', { lineHeight: '28px' }],
      },

      // Shadows from DesignTokens (React Native compatible)
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 2px 4px rgba(0, 0, 0, 0.1)',
        lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
        xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
      },

      // Opacity values
      opacity: {
        disabled: '0.4',
        subtle: '0.6',
        medium: '0.8',
        high: '0.9',
      },
    },
  },
  plugins: [
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }) {
      addUtilities({
        '.glass-light': {
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: '1px',
        },
        '.glass-medium': {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: '1px',
        },
        '.glass-heavy': {
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderColor: 'rgba(255,255,255,0.3)',
          borderWidth: '1px',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: '1px',
        },
        '.glass-input': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: '1px',
        },
        '.glass-card': {
          backgroundColor: '#0a0a0a',
          borderColor: '#262626',
          borderWidth: '1px',
          borderRadius: '16px',
        },
      });
    },
  ],
};
