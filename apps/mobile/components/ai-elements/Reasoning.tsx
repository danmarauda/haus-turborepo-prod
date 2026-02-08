/**
 * Reasoning - AI thinking visualization for React Native
 * Adapted from StartCN AI Elements
 */

import React, { useState, type ReactNode, use } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  type ViewProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { DesignTokens } from "@/constants/designTokens";

export interface ReasoningProps extends ViewProps {
  children?: ReactNode;
  defaultOpen?: boolean;
}

export const Reasoning = ({
  children,
  defaultOpen = false,
  style,
  ...props
}: ReasoningProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <ReasoningContext value={{ isOpen, setIsOpen }}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </ReasoningContext>
  );
};

// Context for reasoning state
const ReasoningContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const useReasoning = () => use(ReasoningContext);

export interface ReasoningTriggerProps {
  children?: ReactNode;
}

export const ReasoningTrigger = ({ children }: ReasoningTriggerProps) => {
  const { isOpen, setIsOpen } = useReasoning();

  return (
    <TouchableOpacity
      style={styles.trigger}
      onPress={() => setIsOpen(!isOpen)}
      activeOpacity={0.7}
    >
      <View style={styles.triggerContent}>
        <View style={[styles.indicator, isOpen && styles.indicatorOpen]} />
        <Text style={styles.triggerText}>
          {isOpen ? "Hide thinking" : "Show thinking"}
        </Text>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export interface ReasoningContentProps extends ViewProps {
  children?: ReactNode;
}

export const ReasoningContent = ({
  children,
  style,
  ...props
}: ReasoningContentProps) => {
  const { isOpen } = useReasoning();
  const height = useSharedValue(isOpen ? 1 : 0);

  React.useEffect(() => {
    height.value = withTiming(isOpen ? 1 : 0, { duration: 200 });
  }, [isOpen, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value === 0 ? 0 : undefined,
    overflow: "hidden" as const,
  }));

  if (!isOpen) return null;

  return (
    <Animated.View style={[styles.content, animatedStyle, style]} {...props}>
      {typeof children === "string" ? (
        <Text style={styles.contentText}>{children}</Text>
      ) : (
        children
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: DesignTokens.spacing.sm,
  },
  trigger: {
    paddingVertical: DesignTokens.spacing.xs,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignTokens.colors.amber[400],
  },
  indicatorOpen: {
    backgroundColor: DesignTokens.colors.emerald[400],
  },
  triggerText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.sm,
    color: DesignTokens.colors.neutral[400],
  },
  content: {
    marginTop: DesignTokens.spacing.sm,
    padding: DesignTokens.spacing.md,
    backgroundColor: DesignTokens.colors.neutral[900],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  contentText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.sm,
    color: DesignTokens.colors.neutral[300],
    lineHeight: 18,
  },
});

export default Reasoning;

