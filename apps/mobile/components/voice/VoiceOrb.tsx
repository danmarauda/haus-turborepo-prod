/**
 * VoiceOrb - Enhanced Voice Assistant Visualizer
 * 
 * A premium animated orb that visualizes voice assistant states with:
 * - Dynamic color transitions based on agent state
 * - Audio-responsive visualization bars
 * - Smooth spring animations
 * - Haptic feedback integration
 * 
 * @example
 * ```tsx
 * <VoiceOrb state="listening" size="lg" onPress={handlePress} />
 * ```
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { AgentState } from '@livekit/components-react';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export type OrbSize = 'sm' | 'md' | 'lg' | 'xl';

export interface VoiceOrbProps {
  state: AgentState;
  size?: OrbSize;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  enableHaptics?: boolean;
  audioLevel?: number; // 0-1 for audio visualization
}

interface OrbConfig {
  size: number;
  radius: number;
  barCount: number;
  barWidth: number;
  fontSize: number;
}

// ------------------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------------------

const ORB_CONFIG: Record<OrbSize, OrbConfig> = {
  sm: { size: 64, radius: 24, barCount: 12, barWidth: 3, fontSize: 10 },
  md: { size: 120, radius: 44, barCount: 16, barWidth: 4, fontSize: 14 },
  lg: { size: 180, radius: 68, barCount: 20, barWidth: 5, fontSize: 18 },
  xl: { size: 240, radius: 92, barCount: 24, barWidth: 6, fontSize: 22 },
};

const STATE_COLORS: Record<AgentState, { primary: string; secondary: string; glow: string }> = {
  disconnected: { primary: '#374151', secondary: '#4b5563', glow: '#1f2937' },
  connecting: { primary: '#6b7280', secondary: '#9ca3af', glow: '#4b5563' },
  'pre-connect-buffering': { primary: '#6b7280', secondary: '#9ca3af', glow: '#4b5563' },
  initializing: { primary: '#6b7280', secondary: '#9ca3af', glow: '#4b5563' },
  idle: { primary: '#8b5cf6', secondary: '#a78bfa', glow: '#7c3aed' },
  listening: { primary: '#8b5cf6', secondary: '#a78bfa', glow: '#7c3aed' },
  thinking: { primary: '#f59e0b', secondary: '#fbbf24', glow: '#d97706' },
  speaking: { primary: '#10b981', secondary: '#34d399', glow: '#059669' },
  failed: { primary: '#ef4444', secondary: '#f87171', glow: '#dc2626' },
};

// ------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------

export function VoiceOrb({
  state,
  size = 'md',
  color,
  onPress,
  disabled = false,
  enableHaptics = true,
  audioLevel = 0,
}: VoiceOrbProps) {
  const config = ORB_CONFIG[size];
  const colors = color 
    ? { primary: color, secondary: color, glow: color }
    : STATE_COLORS[state];
  
  // Animation values
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const audioScale = useSharedValue(1);
  
  // Bar animation values (for audio visualization)
  const barScales = Array.from({ length: config.barCount }, () => useSharedValue(0.5));
  
  // Haptic feedback on state change
  useEffect(() => {
    if (!enableHaptics || Platform.OS === 'web') return;
    
    switch (state) {
      case 'listening':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'thinking':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'speaking':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'failed':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }, [state, enableHaptics]);
  
  // State-based animations
  useEffect(() => {
    switch (state) {
      case 'thinking':
        // Spin animation
        rotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1,
          false
        );
        scale.value = withSpring(0.95);
        pulseOpacity.value = withTiming(0.8, { duration: 300 });
        break;
        
      case 'connecting':
      case 'pre-connect-buffering':
      case 'initializing':
        // Fast pulse
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(0.9, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1,
          true
        );
        break;
        
      case 'listening':
      case 'idle':
        // Gentle breathing
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          true
        );
        break;
        
      case 'speaking':
        // Active speaking - respond to audio
        rotation.value = 0;
        scale.value = withSpring(1.05);
        pulseOpacity.value = withTiming(1, { duration: 200 });
        break;
        
      case 'disconnected':
        rotation.value = 0;
        scale.value = withSpring(0.85);
        pulseOpacity.value = withTiming(0.3, { duration: 300 });
        break;
        
      case 'failed':
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(0.95, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 200, easing: Easing.inOut(Easing.ease) })
          ),
          3,
          true
        );
        pulseOpacity.value = withTiming(0.7, { duration: 200 });
        break;
        
      default:
        rotation.value = 0;
        scale.value = withSpring(1);
        pulseOpacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [state, scale, pulseOpacity, rotation]);
  
  // Audio level animation
  useEffect(() => {
    if (state === 'speaking' && audioLevel > 0) {
      audioScale.value = withSpring(1 + audioLevel * 0.3, {
        damping: 10,
        stiffness: 100
      });
      
      // Animate bars based on audio level
      barScales.forEach((barScale, index) => {
        const phase = (index / config.barCount) * Math.PI * 2;
        const intensity = Math.sin(phase + Date.now() / 200) * 0.5 + 0.5;
        barScale.value = withSpring(0.3 + audioLevel * intensity * 0.7, {
          damping: 15,
          stiffness: 150
        });
      });
    } else {
      audioScale.value = withSpring(1);
      barScales.forEach(barScale => {
        barScale.value = withTiming(0.3, { duration: 300 });
      });
    }
  }, [state, audioLevel, audioScale, barScales, config.barCount]);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * audioScale.value }],
  }));
  
  const orbAnimatedProps = useAnimatedProps(() => ({
    r: config.radius * 0.6,
    opacity: pulseOpacity.value,
  }));
  
  const rotateAnimatedProps = useAnimatedProps(() => ({
    rotation: rotation.value,
    originX: config.size / 2,
    originY: config.size / 2,
  }));
  
  // Generate bars
  const bars = Array.from({ length: config.barCount }, (_, index) => {
    const angle = (index / config.barCount) * Math.PI * 2;
    const x = config.size / 2 + Math.cos(angle) * config.radius;
    const y = config.size / 2 + Math.sin(angle) * config.radius;
    
    const barAnimatedProps = useAnimatedProps(() => ({
      r: config.barWidth * (0.5 + barScales[index].value * 0.5),
      opacity: interpolate(
        barScales[index].value,
        [0, 1],
        [0.3, 1],
        Extrapolation.CLAMP
      ),
    }));
    
    return { key: index, x, y, angle, animatedProps: barAnimatedProps };
  });
  
  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress?.();
  }, [disabled, enableHaptics, onPress]);
  
  const OrbContent = (
    <Animated.View style={[styles.container, containerStyle]}>
      <Svg width={config.size} height={config.size}>
        <Defs>
          <RadialGradient id="orbGradient" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.glow} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Glow effect */}
        <Circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius * 1.5}
          fill="url(#glowGradient)"
        />
        
        {/* Rotating group for bars */}
        <AnimatedG
          animatedProps={rotateAnimatedProps}
          origin={`${config.size / 2}, ${config.size / 2}`}
        >
          {/* Outer ring */}
          <Circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={config.radius + config.barWidth}
            fill="none"
            stroke={colors.primary}
            strokeWidth={1}
            strokeOpacity={0.2}
          />
          
          {/* Animated bars */}
          {bars.map(({ key, x, y, animatedProps }) => (
            <AnimatedCircle
              key={key}
              cx={x}
              cy={y}
              fill={colors.secondary}
              animatedProps={animatedProps}
            />
          ))}
        </AnimatedG>
        
        {/* Main orb */}
        <AnimatedCircle
          cx={config.size / 2}
          cy={config.size / 2}
          fill="url(#orbGradient)"
          animatedProps={orbAnimatedProps}
        />
        
        {/* Inner highlight */}
        <Circle
          cx={config.size / 2 - config.radius * 0.2}
          cy={config.size / 2 - config.radius * 0.2}
          r={config.radius * 0.15}
          fill="#ffffff"
          fillOpacity={0.3}
        />
      </Svg>
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {OrbContent}
      </TouchableOpacity>
    );
  }
  
  return OrbContent;
}

// ------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceOrb;
