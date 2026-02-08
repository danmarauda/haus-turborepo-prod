/**
 * Tool - Tool call visualization with status for React Native
 * Adapted from StartCN AI Elements
 */

import React, { type ReactNode } from "react";
import { StyleSheet, View, Text, type ViewProps } from "react-native";
import { DesignTokens } from "@/constants/designTokens";
import { Loader } from "./Loader";

export type ToolStatus = "running" | "completed" | "error" | "awaiting";

export interface ToolProps extends ViewProps {
  status?: ToolStatus;
  children?: ReactNode;
}

export const Tool = ({
  status = "running",
  children,
  style,
  ...props
}: ToolProps) => (
  <View style={[styles.container, style]} {...props}>
    {children}
  </View>
);

export interface ToolHeaderProps extends ViewProps {
  status?: ToolStatus;
  name?: string;
  children?: ReactNode;
}

export const ToolHeader = ({
  status = "running",
  name,
  children,
  style,
  ...props
}: ToolHeaderProps) => {
  const statusConfig = getStatusConfig(status);

  return (
    <View style={[styles.header, style]} {...props}>
      <View style={styles.headerLeft}>
        {status === "running" ? (
          <Loader size={12} color={statusConfig.color} />
        ) : (
          <View
            style={[styles.statusDot, { backgroundColor: statusConfig.color }]}
          />
        )}
        {name && <Text style={styles.toolName}>{name}</Text>}
        {children}
      </View>
      <View
        style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}
      >
        <Text style={[styles.badgeText, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </View>
    </View>
  );
};

export interface ToolContentProps extends ViewProps {
  children?: ReactNode;
}

export const ToolContent = ({
  children,
  style,
  ...props
}: ToolContentProps) => (
  <View style={[styles.content, style]} {...props}>
    {children}
  </View>
);

export interface ToolInputProps extends ViewProps {
  children?: ReactNode;
}

export const ToolInput = ({ children, style, ...props }: ToolInputProps) => (
  <View style={[styles.section, style]} {...props}>
    <Text style={styles.sectionLabel}>Input</Text>
    {typeof children === "string" ? (
      <Text style={styles.codeText}>{children}</Text>
    ) : (
      children
    )}
  </View>
);

export interface ToolOutputProps extends ViewProps {
  children?: ReactNode;
}

export const ToolOutput = ({ children, style, ...props }: ToolOutputProps) => (
  <View style={[styles.section, style]} {...props}>
    <Text style={styles.sectionLabel}>Output</Text>
    {typeof children === "string" ? (
      <Text style={styles.codeText}>{children}</Text>
    ) : (
      children
    )}
  </View>
);

const getStatusConfig = (status: ToolStatus) => {
  switch (status) {
    case "running":
      return {
        label: "Running",
        color: DesignTokens.colors.amber[400],
        bgColor: "rgba(251, 191, 36, 0.15)",
      };
    case "completed":
      return {
        label: "Completed",
        color: DesignTokens.colors.emerald[400],
        bgColor: "rgba(52, 211, 153, 0.15)",
      };
    case "error":
      return {
        label: "Error",
        color: DesignTokens.colors.rose[400],
        bgColor: "rgba(251, 113, 133, 0.15)",
      };
    case "awaiting":
      return {
        label: "Awaiting",
        color: DesignTokens.colors.sky[400],
        bgColor: "rgba(56, 189, 248, 0.15)",
      };
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[900],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toolName: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.sm,
    color: DesignTokens.colors.neutral[100],
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.sm,
  },
  badgeText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.xs,
  },
  content: {
    padding: DesignTokens.spacing.md,
  },
  section: {
    marginBottom: DesignTokens.spacing.sm,
  },
  sectionLabel: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.xs,
    color: DesignTokens.colors.neutral[500],
    marginBottom: DesignTokens.spacing.xs,
    textTransform: "uppercase",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: DesignTokens.fontSize.sm,
    color: DesignTokens.colors.neutral[300],
    backgroundColor: DesignTokens.colors.neutral[950],
    padding: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.sm,
  },
});

export default Tool;

