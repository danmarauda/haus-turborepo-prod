export interface ThemeContextType {
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark' | null;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeVars: Record<string, string>;
}
