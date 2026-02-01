import { useMemo, useRef, useEffect, useState } from 'react';
import type { AgentState } from '@livekit/components-react';

/**
 * LiveKit AgentState values:
 * - 'disconnected' | 'connecting' | 'pre-connect-buffering' | 'failed' | 'initializing' | 'idle' | 'listening' | 'thinking' | 'speaking'
 *
 * Animation sequences:
 * - connecting/initializing: Sequential bar animation
 * - listening/idle: Grouped bar animation
 * - thinking: Spin animation (handled separately)
 * - speaking: Audio-reactive (all bars highlighted base)
 * - failed: Static with error color
 * - disconnected: Static dimmed
 */

/**
 * Generates the animation sequence for the connecting state.
 * Bars light up sequentially in a pattern from center outward.
 */
function generateConnectingSequence(barCount: number): number[] {
  const seq: number[] = [];
  const center = Math.floor(barCount / 2);

  for (let x = 0; x < barCount; x++) {
    seq.push((x + center) % barCount);
  }

  return seq;
}

/**
 * Generates the animation sequence for the listening state.
 * Bars light up in groups around the circle.
 */
function generateListeningSequence(barCount: number): number[] {
  const divisor = barCount > 8 ? barCount / 4 : 2;
  const group = Math.floor(barCount / divisor);

  return Array.from({ length: barCount }, (_, idx) =>
    Math.floor(idx / divisor)
  );
}

/**
 * Animation interval in ms based on agent state.
 */
function getIntervalForState(state: AgentState, barCount: number): number {
  switch (state) {
    case 'connecting':
    case 'listening':
    case 'idle':
      return 500;
    case 'pre-connect-buffering':
    case 'initializing':
      return 250;
    case 'thinking':
      return Infinity; // Spinning animation
    case 'disconnected':
    case 'failed':
      return Infinity; // Static
    case 'speaking':
      return 1000;
    default:
      return 500;
  }
}

/**
 * Hook that manages the animation sequence for a radial audio visualizer.
 * Returns an array of bar indices that should be highlighted at the current time.
 *
 * @param state - Current agent state from LiveKit
 * @param barCount - Number of bars in the visualizer
 * @returns Array of bar indices to highlight
 */
export function useLivekitAudioVisualizer(
  state: AgentState = 'disconnected',
  barCount: number = 24
): number[] {
  const [index, setIndex] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);

  // Update sequence when state changes
  useEffect(() => {
    let newSequence: number[] = [];

    switch (state) {
      case 'thinking':
        // Empty sequence - handled by spin animation in component
        newSequence = [];
        break;
      case 'connecting':
      case 'pre-connect-buffering':
      case 'initializing':
        newSequence = generateConnectingSequence(barCount);
        break;
      case 'listening':
      case 'idle':
        newSequence = generateListeningSequence(barCount);
        break;
      case 'speaking':
        // All bars respond to audio when speaking
        newSequence = Array.from({ length: barCount }, (_, idx) => idx);
        break;
      case 'disconnected':
      case 'failed':
      default:
        newSequence = [];
    }

    setSequence(newSequence);
    setIndex(0);
  }, [state, barCount]);

  // Animation loop
  const animationFrameId = useRef<number | null>(null);
  const interval = useMemo(
    () => getIntervalForState(state, barCount),
    [state, barCount]
  );

  useEffect(() => {
    if (interval === Infinity) {
      return;
    }

    let startTime = performance.now();

    const animate = (time: DOMHighResTimeStamp) => {
      const timeElapsed = time - startTime;

      if (timeElapsed >= interval) {
        setIndex((prev) => (prev + 1) % Math.max(sequence.length, 1));
        startTime = time;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [interval, sequence.length]);

  // Get highlighted bars based on current index
  return useMemo(() => {
    if (state === 'disconnected' || state === 'failed') {
      return [];
    }

    if (state === 'thinking') {
      return []; // Spinning animation handles this
    }

    if (sequence.length === 0) {
      return Array.from({ length: barCount }, (_, idx) => idx);
    }

    const currentIndex = index % sequence.length;
    const groupSize = Math.floor(barCount / 4);

    // For listening/idle state, show groups of bars
    if ((state === 'listening' || state === 'idle') && sequence.length > 0) {
      const groupIndex = sequence[currentIndex];
      return Array.from({ length: groupSize }, (_, idx) =>
        (groupIndex * groupSize + idx) % barCount
      );
    }

    return [sequence[currentIndex]];
  }, [sequence, index, barCount, state]);
}

/**
 * Get the radius (distance from center) for the radial visualizer bars.
 */
export function getVisualizerRadius(size: 'sm' | 'md' | 'lg' | 'xl'): number {
  switch (size) {
    case 'sm':
      return 16;
    case 'md':
      return 32;
    case 'lg':
      return 64;
    case 'xl':
      return 128;
  }
}

/**
 * Get the bar count for the visualizer based on size.
 */
export function getVisualizerBarCount(size: 'sm' | 'md' | 'lg' | 'xl'): number {
  switch (size) {
    case 'sm':
      return 12;
    default:
      return 24;
  }
}
