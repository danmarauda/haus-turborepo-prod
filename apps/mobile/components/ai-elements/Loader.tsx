/**
 * Loader - Animated loading spinner for React Native
 * Adapted from StartCN AI Elements
 */

import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { DesignTokens } from "@/constants/designTokens";

export interface LoaderProps extends ViewProps {
  size?: number;
  color?: string;
}

export const Loader = ({
  size = 16,
  color = DesignTokens.colors.neutral[400],
  style,
  ...props
}: LoaderProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, style]} {...props}>
      <Animated.View
        style={[
          styles.spinner,
          animatedStyle,
          {
            width: size,
            height: size,
            borderWidth: size / 8,
            borderColor: color,
            borderTopColor: "transparent",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderRadius: 999,
  },
});

export default Loader;

