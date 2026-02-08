/**
 * Conversation - Chat container with scroll for React Native
 * Adapted from StartCN AI Elements
 */

import React, { useRef, type ReactNode } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  type ViewProps,
  type ScrollViewProps,
} from "react-native";
import { DesignTokens } from "@/constants/designTokens";

export interface ConversationProps extends ViewProps {
  children?: ReactNode;
}

export const Conversation = ({
  children,
  style,
  ...props
}: ConversationProps) => (
  <View style={[styles.container, style]} {...props}>
    {children}
  </View>
);

export interface ConversationContentProps extends ScrollViewProps {
  children?: ReactNode;
  autoScroll?: boolean;
}

export const ConversationContent = ({
  children,
  autoScroll = true,
  style,
  ...props
}: ConversationContentProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleContentSizeChange = () => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.scrollView, style]}
      contentContainerStyle={styles.scrollContent}
      onContentSizeChange={handleContentSizeChange}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export interface ConversationEmptyStateProps extends ViewProps {
  children?: ReactNode;
}

export const ConversationEmptyState = ({
  children,
  style,
  ...props
}: ConversationEmptyStateProps) => (
  <View style={[styles.emptyState, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[950],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: DesignTokens.spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DesignTokens.spacing.xxl,
  },
});

export default Conversation;

