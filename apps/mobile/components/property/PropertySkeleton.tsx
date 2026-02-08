import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { DesignTokens } from "@/constants/designTokens";

export default function PropertySkeleton() {
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageSkeleton,
          { opacity: fadeAnim },
        ]}
      />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.priceSkeleton,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.titleSkeleton,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.locationSkeleton,
            { opacity: fadeAnim },
          ]}
        />
        <View style={styles.featuresContainer}>
          <Animated.View
            style={[
              styles.featureSkeleton,
              { opacity: fadeAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.featureSkeleton,
              { opacity: fadeAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.featureSkeleton,
              { opacity: fadeAnim },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[900],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: "hidden",
    marginBottom: DesignTokens.spacing.md,
  },
  imageSkeleton: {
    height: 180,
    width: "100%",
    backgroundColor: DesignTokens.colors.neutral[800],
  },
  contentContainer: {
    padding: DesignTokens.spacing.md,
  },
  textSkeleton: {
    borderRadius: 6,
    marginBottom: DesignTokens.spacing.sm,
    backgroundColor: DesignTokens.colors.neutral[800],
  },
  priceSkeleton: {
    height: 20,
    width: "40%",
  },
  titleSkeleton: {
    height: 16,
    width: "75%",
  },
  locationSkeleton: {
    height: 14,
    width: "55%",
  },
  featuresContainer: {
    flexDirection: "row",
    gap: DesignTokens.spacing.md,
    marginTop: DesignTokens.spacing.sm,
  },
  featureSkeleton: {
    height: 14,
    width: 40,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.neutral[800],
  },
});
