import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useCallback, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { DesignTokens } from '@/constants/designTokens';
import { Settings } from 'lucide-react-native';

const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=3840&auto=format&fit=crop';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.4);
  const blur = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(100);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);
  const splashOpacity = useSharedValue(1);
  const hasNavigated = useRef(false);

  const handleComplete = useCallback(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      onComplete?.();
      // Don't auto-navigate - let the landing page handle navigation
    }
  }, [onComplete]);

  useEffect(() => {
    // Background image cinematic animation
    scale.value = withTiming(1.1, {
      duration: 3500,
      easing: Easing.out(Easing.ease),
    });

    opacity.value = withTiming(1, {
      duration: 3500,
      easing: Easing.out(Easing.ease),
    });

    blur.value = withTiming(0, {
      duration: 3500,
      easing: Easing.out(Easing.ease),
    });

    // HAUS text animation
    textOpacity.value = withDelay(500, withTiming(1, { duration: 1400 }));
    textY.value = withDelay(500, withTiming(0, { duration: 1400 }));

    // Subtitle animation
    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    subtitleY.value = withDelay(1000, withTiming(0, { duration: 1000 }));

    // Footer elements animation
    footerOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));

    // Auto-navigate after splash
    const timer = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(handleComplete)();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    scale,
    opacity,
    blur,
    textOpacity,
    textY,
    subtitleOpacity,
    subtitleY,
    footerOpacity,
    splashOpacity,
    handleComplete,
  ]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const splashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, splashStyle]}>
      {/* Background Image */}
      <Animated.View style={[styles.backgroundContainer, backgroundStyle]}>
        <Image
          source={{ uri: BACKGROUND_IMAGE }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.darkOverlay} />
      </Animated.View>

      {/* HAUS Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.hausText}>HAUS</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
        <Text style={styles.subtitleText}>A REVOLUTION IN REAL ESTATE.</Text>
      </Animated.View>

      {/* Footer Left */}
      <Animated.View style={[styles.footerLeft, footerStyle]}>
        <Text style={styles.footerText}>An ALIAS Platform</Text>
        <Text style={styles.footerText}>Est. 2024</Text>
      </Animated.View>

      {/* Footer Center - HAUS AI Pill */}
      <Animated.View style={[styles.footerCenter, footerStyle]}>
        <View style={styles.pillContainer}>
          <View style={styles.pillInner}>
            <View style={styles.dotContainer}>
              <View style={styles.pingDot} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.pillText}>HAUS AI</Text>
            <Settings size={16} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
      </Animated.View>

      {/* Footer Right */}
      <Animated.View style={[styles.footerRight, footerStyle]}>
        <Text style={[styles.footerText, styles.pulseText]}>Scroll to Explore</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hausText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: 120,
    color: '#ffffff',
    letterSpacing: -6,
    lineHeight: 96,
  },
  subtitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  subtitleText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: -0.5,
    maxWidth: 300,
  },
  footerLeft: {
    position: 'absolute',
    bottom: 60,
    left: 24,
  },
  footerRight: {
    position: 'absolute',
    bottom: 60,
    right: 24,
  },
  footerText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pulseText: {
    // Pulse animation would go here
  },
  footerCenter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pillContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backdropFilter: 'blur(20px)',
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  pingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  pillText: {
    fontFamily: DesignTokens.fontFamily.primary,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
