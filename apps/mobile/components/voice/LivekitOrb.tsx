import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import type { AgentState } from '@livekit/components-react';
import { useLivekitAudioVisualizer, getVisualizerRadius, getVisualizerBarCount } from '../../hooks/useLivekitAudioVisualizer';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface LivekitOrbProps {
  state: AgentState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

/**
 * LiveKit Orb - An animated voice assistant visualizer that responds to agent states.
 *
 * Official LiveKit AgentState values:
 * - 'disconnected': Gray, dimmed, static
 * - 'connecting': Gray, sequential bar animation
 * - 'pre-connect-buffering': Gray, fast sequential animation
 * - 'failed': Red, static
 * - 'initializing': Gray, fast sequential animation
 * - 'idle': Purple, grouped bar animation
 * - 'listening': Purple, grouped bar animation
 * - 'thinking': Amber, slow spin animation
 * - 'speaking': Green, all bars respond to audio
 *
 * @example
 * ```tsx
 * <LivekitOrb state="listening" size="md" />
 * ```
 */
export function LivekitOrb({ state, size = 'md', color }: LivekitOrbProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const barCount = getVisualizerBarCount(size);
  const radius = getVisualizerRadius(size);
  const highlightedBars = useLivekitAudioVisualizer(state, barCount);

  // State-based animations
  React.useEffect(() => {
    switch (state) {
      case 'thinking':
        // Spin animation for thinking
        rotation.value = withRepeat(
          withTiming(360, { duration: 5000, easing: Easing.linear }),
          -1,
          false
        );
        scale.value = withSpring(1);
        pulseOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'connecting':
      case 'pre-connect-buffering':
      case 'initializing':
        // Pulse animation while connecting
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          false
        );
        break;

      case 'listening':
      case 'idle':
        // Gentle breathing animation
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.85, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          false
        );
        break;

      case 'speaking':
        // Active speaking state - gentle pulse
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        pulseOpacity.value = withTiming(1, { duration: 200 });
        break;

      case 'disconnected':
        rotation.value = 0;
        scale.value = withSpring(0.8);
        pulseOpacity.value = withTiming(0.4, { duration: 300 });
        break;

      case 'failed':
        rotation.value = 0;
        scale.value = withRepeat(
          withSequence(
            withTiming(0.95, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration: 300, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          -1,
          false
        );
        break;

      default:
        rotation.value = 0;
        scale.value = withSpring(1);
        pulseOpacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [state]);

  const getColor = (): string => {
    if (color) return color;

    switch (state) {
      case 'speaking':
        return '#10b981'; // Green
      case 'listening':
      case 'idle':
        return '#8b5cf6'; // Purple
      case 'thinking':
        return '#f59e0b'; // Amber
      case 'connecting':
      case 'pre-connect-buffering':
      case 'initializing':
        return '#6b7280'; // Gray
      case 'disconnected':
        return '#374151'; // Dark gray
      case 'failed':
        return '#ef4444'; // Red
      default:
        return '#6b7280';
    }
  };

  const baseColor = getColor();
  const barSize = (radius * Math.PI * 2) / barCount;
  const center = size === 'sm' ? 28 : size === 'md' ? 56 : size === 'lg' ? 112 : 224;

  // Animated props for the main orb
  const animatedProps = useAnimatedProps(() => ({
    r: center * 0.35,
    opacity: pulseOpacity.value,
  }));

  // Animated rotation transform for thinking state
  const rotateProps = useAnimatedProps(() => ({
    rotation: rotation.value,
    originX: center,
    originY: center,
  }));

  // Bars that respond to state
  const bars = useMemo(() => {
    const shouldSpin = state === 'thinking';
    return Array.from({ length: barCount }, (_, idx) => {
      const angle = (idx / barCount) * Math.PI * 2;
      const isHighlighted = highlightedBars.includes(idx);

      return {
        key: idx,
        angle,
        isHighlighted,
      };
    });
  }, [barCount, highlightedBars, state]);

  const shouldSpin = state === 'thinking';

  return (
    <View style={[styles.container, { width: center * 2, height: center * 2 }]}>
      <Svg width={center * 2} height={center * 2}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius + barSize * 2}
          fill="none"
          stroke={baseColor}
          strokeWidth={1}
          strokeOpacity={0.1}
        />

        {/* Rotating group for thinking state */}
        <AnimatedG
          animatedProps={rotateProps}
          origin={`${center}, ${center}`}
        >
          {/* Outer glow ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius + barSize}
            fill="none"
            stroke={baseColor}
            strokeWidth={2}
            strokeOpacity={0.15}
          />

          {/* Animated bars around the circle */}
          {bars.map(({ key, angle, isHighlighted }) => {
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;

            return (
              <Circle
                key={key}
                cx={x}
                cy={y}
                r={isHighlighted ? barSize * 0.7 : barSize * 0.35}
                fill={baseColor}
                opacity={isHighlighted ? 0.9 : 0.25}
              />
            );
          })}
        </AnimatedG>

        {/* Main orb */}
        <AnimatedCircle
          cx={center}
          cy={center}
          fill={baseColor}
          animatedProps={animatedProps}
        />

        {/* Inner highlight */}
        <Circle
          cx={center - center * 0.1}
          cy={center - center * 0.1}
          r={center * 0.1}
          fill="#ffffff"
          fillOpacity={0.25}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Re-export AgentState for convenience
export type { AgentState };
