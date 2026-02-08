/**
 * ThemeProvider - Theme context for migrated components
 *
 * Provides theme state compatible with components migrated from haus-platform-1.
 * Uses NativeWind's useColorScheme under the hood.
 */

import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeType = "light" | "dark";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme() as ThemeType | null;
  const [theme, setTheme] = useState<ThemeType>("dark"); // HAUS defaults to dark
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("haus-theme");
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      } catch (error) {
        // Silently fail - use default theme
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const updateTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("haus-theme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      // Silently fail
    }
  };

  const isDark = theme === "dark";

  return {
    theme,
    updateTheme,
    isLoading,
    isDark,
  };
});

export default ThemeProvider;
