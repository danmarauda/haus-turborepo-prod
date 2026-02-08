/**
 * Shimmer - Animated text loading effect for React Native
 * Adapted from StartCN AI Elements
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { DesignTokens } from "@/constants/designTokens";

export interface ShimmerProps extends TextProps {
  children: string;
  duration?: number;
  spread?: number;
}

export const Shimmer = ({
  children,
  duration = 2000,
  spread = 2,
  style,
  ...props
}: ShimmerProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0.4, 1, 0.4]
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.Text
      style={[styles.text, animatedStyle, style]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: DesignTokens.fontSize.base,
    color: DesignTokens.colors.neutral[400],
  },
});

export default Shimmer;

