import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AgentState =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'speaking'
  | 'speaking-user'
  | 'listening'
  | 'thinking'
  | 'ready'
  | 'connected'
  | 'error';

interface OrbProps {
  state: AgentState;
  size?: number;
}

const Orb: React.FC<OrbProps> = ({ state, size = 120 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const previousState = useRef<AgentState>(state);

  useEffect(() => {
    if (previousState.current !== state) {
      previousState.current = state;
      updateAnimationForState(state);
    }
  }, [state]);

  const updateAnimationForState = (newState: AgentState) => {
    'worklet';
    switch (newState) {
      case 'speaking':
        scale.value = withTiming(1.2, { duration: 300 });
        opacity.value = withTiming(0.9, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
      case 'speaking-user':
        scale.value = withTiming(1, { duration: 300 });
        opacity.value = withTiming(0.7, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.98, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
      case 'listening':
        scale.value = withTiming(1, { duration: 300 });
        opacity.value = withTiming(0.5, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
      case 'thinking':
        scale.value = withTiming(0.9, { duration: 300 });
        opacity.value = withTiming(0.8, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.85, { duration: 200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        rotation.value = withRepeat(
          withTiming(360, { duration: 2000, easing: Easing.linear }),
          -1,
          false
        );
        break;
      case 'connecting':
      case 'initializing':
        scale.value = withTiming(0.8, { duration: 300 });
        opacity.value = withTiming(0.4, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
      case 'ready':
      case 'connected':
        scale.value = withTiming(1, { duration: 300 });
        opacity.value = withTiming(0.6, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.98, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
      case 'disconnected':
        scale.value = withTiming(0.7, { duration: 300 });
        opacity.value = withTiming(0.3, { duration: 300 });
        pulseScale.value = 1;
        break;
      case 'error':
        scale.value = withTiming(0.8, { duration: 200 });
        opacity.value = withTiming(0.5, { duration: 200 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.95, { duration: 150, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;
    }
  };

  const getColorForState = (): string => {
    switch (state) {
      case 'speaking':
        return '#10b981'; // Green
      case 'speaking-user':
        return '#3b82f6'; // Blue
      case 'listening':
        return '#8b5cf6'; // Purple
      case 'thinking':
        return '#f59e0b'; // Amber
      case 'connecting':
      case 'initializing':
        return '#6b7280'; // Gray
      case 'ready':
      case 'connected':
        return '#06b6d4'; // Cyan
      case 'disconnected':
        return '#374151'; // Dark gray
      case 'error':
        return '#ef4444'; // Red
      default:
        return '#6b7280';
    }
  };

  const center = size / 2;
  const radius = size * 0.35;

  const animatedProps = useAnimatedProps(() => {
    return {
      r: radius * pulseScale.value,
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Outer glow ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius * 1.5}
          fill="none"
          stroke={getColorForState()}
          strokeWidth={2}
          strokeOpacity={0.2}
          animatedProps={animatedProps}
        />
        {/* Middle ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius * 1.2}
          fill="none"
          stroke={getColorForState()}
          strokeWidth={3}
          strokeOpacity={0.3}
          animatedProps={animatedProps}
        />
        {/* Inner circle - main orb */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          fill={getColorForState()}
          animatedProps={animatedProps}
        />
        {/* Highlight */}
        <Circle
          cx={center - radius * 0.3}
          cy={center - radius * 0.3}
          r={radius * 0.2}
          fill="#ffffff"
          fillOpacity={0.3}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Orb;
export type { AgentState };
