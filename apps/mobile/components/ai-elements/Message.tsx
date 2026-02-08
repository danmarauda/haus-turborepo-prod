/**
 * Message - Chat message display for React Native
 * Adapted from StartCN AI Elements
 */

import React, { type ReactNode } from "react";
import { StyleSheet, View, Text, type ViewProps } from "react-native";
import { DesignTokens } from "@/constants/designTokens";

export type MessageRole = "user" | "assistant" | "system";

export interface MessageProps extends Omit<ViewProps, "role"> {
  messageRole?: MessageRole;
  children?: ReactNode;
}

export const Message = ({
  messageRole = "assistant",
  children,
  style,
  ...props
}: MessageProps) => {
  const isUser = messageRole === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export interface MessageContentProps extends ViewProps {
  children?: ReactNode;
}

export const MessageContent = ({
  children,
  style,
  ...props
}: MessageContentProps) => (
  <View style={[styles.content, style]} {...props}>
    {typeof children === "string" ? (
      <Text style={styles.text}>{children}</Text>
    ) : (
      children
    )}
  </View>
);

export interface MessageActionsProps extends ViewProps {
  children?: ReactNode;
}

export const MessageActions = ({
  children,
  style,
  ...props
}: MessageActionsProps) => (
  <View style={[styles.actions, style]} {...props}>
    {children}
  </View>
);

export interface MessageToolbarProps extends ViewProps {
  children?: ReactNode;
}

export const MessageToolbar = ({
  children,
  style,
  ...props
}: MessageToolbarProps) => (
  <View style={[styles.toolbar, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  assistantContainer: {
    alignItems: "flex-start",
  },
  content: {
    maxWidth: "85%",
    backgroundColor: DesignTokens.colors.neutral[900],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  text: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.base,
    color: DesignTokens.colors.neutral[100],
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: DesignTokens.spacing.xs,
    marginTop: DesignTokens.spacing.xs,
  },
  toolbar: {
    flexDirection: "row",
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.sm,
    opacity: DesignTokens.opacity.subtle,
  },
});

export default Message;

