export const DesignTokens = {
  fontFamily: {
    primary: 'Abel',
  },

  colors: {
    sky: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
    },
    blue: {
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
    },
    cyan: {
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
    },
    amber: {
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
    },
    rose: {
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
    },
    emerald: {
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
    },
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
    white: '#ffffff',
    black: '#000000',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },

  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 17,
    xl: 18,
    xxl: 19,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '400' as const,
    semibold: '400' as const,
    bold: '400' as const,
    extrabold: '400' as const,
  },

  opacity: {
    disabled: 0.4,
    subtle: 0.6,
    medium: 0.8,
    high: 0.9,
    full: 1,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  gradients: {
    darkBg: ['#000000', '#171717'],
    lightBg: ['#ffffff', '#f5f5f5'],
    overlay: ['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.35)', 'transparent'],
  },

  components: {
    card: {
      backgroundColor: '#0a0a0a',
      borderColor: '#262626',
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
    },
    button: {
      primary: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
      },
      secondary: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
    },
    iconWrapper: {
      small: {
        width: 28,
        height: 28,
        borderRadius: 10,
        borderWidth: 1,
      },
      medium: {
        width: 32,
        height: 32,
        borderRadius: 12,
        borderWidth: 1,
      },
    },
    pill: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    input: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  },

  categoryColors: {
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
};

export type DesignTokensType = typeof DesignTokens;
