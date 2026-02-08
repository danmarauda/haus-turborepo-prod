import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Home, Search, Heart } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import Colors from "@/constants/colors";
import { DesignTokens } from "@/constants/designTokens";

interface EmptyStateProps {
  type: "properties" | "search" | "favorites";
  title?: string;
  message?: string;
}

export default function EmptyState({ type, title, message }: EmptyStateProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const getIcon = () => {
    switch (type) {
      case "search":
        return <Search size={64} color={colors.tabIconDefault} />;
      case "favorites":
        return <Heart size={64} color={colors.tabIconDefault} />;
      default:
        return <Home size={64} color={colors.tabIconDefault} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "search":
        return "No results found";
      case "favorites":
        return "No favorites yet";
      default:
        return "No properties available";
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "search":
        return "Try adjusting your search criteria or filters";
      case "favorites":
        return "Start exploring properties and save your favorites";
      default:
        return "Check back later for new listings";
    }
  };

  return (
    <View style={styles.container}>
      {getIcon()}
      <Text style={[styles.title, { color: colors.text }]}>
        {title || getDefaultTitle()}
      </Text>
      <Text style={[styles.message, { color: colors.text }]}>
        {message || getDefaultMessage()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: DesignTokens.fontFamily.primary,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    fontFamily: DesignTokens.fontFamily.primary,
  },
});