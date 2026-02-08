import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface TranscriptMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isFinal: boolean;
  isInterim?: boolean;
}

interface TranscriptionUIProps {
  messages: TranscriptMessage[];
  isThinking?: boolean;
  isSpeaking?: boolean;
}

export function TranscriptionUI({
  messages,
  isThinking = false,
  isSpeaking = false,
}: TranscriptionUIProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const thinkingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }

    // Fade in animation for new messages
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [messages.length, fadeAnim]);

  useEffect(() => {
    // Thinking animation
    if (isThinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      thinkingAnim.setValue(0);
    }
  }, [isThinking, thinkingAnim]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎙️</Text>
            <Text style={styles.emptyTitle}>Ready to listen</Text>
            <Text style={styles.emptySubtitle}>
              Tap the microphone to start talking
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => (
            <TranscriptBubble
              key={msg.id}
              message={msg}
              previousMessage={index > 0 ? messages[index - 1] : undefined}
              isSpeaking={isSpeaking && msg.role === 'assistant' && !msg.isFinal}
            />
          ))
        )}

        {isThinking && (
          <Animated.View
            style={[
              styles.thinkingIndicator,
              { opacity: thinkingAnim },
            ]}
          >
            <View style={styles.thinkingBubble}>
              <AnimatedDot delay={0} anim={thinkingAnim} />
              <AnimatedDot delay={150} anim={thinkingAnim} />
              <AnimatedDot delay={300} anim={thinkingAnim} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

interface TranscriptBubbleProps {
  message: TranscriptMessage;
  previousMessage?: TranscriptMessage;
  isSpeaking?: boolean;
}

function TranscriptBubble({
  message,
  previousMessage,
  isSpeaking,
}: TranscriptBubbleProps) {
  const isUser = message.role === 'user';
  const showAvatar =
    !previousMessage || previousMessage.role !== message.role;
  const showTimestamp =
    !previousMessage ||
    message.timestamp - previousMessage.timestamp > 60000; // 1 minute

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      {!isUser && showAvatar && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}
      {!isUser && !showAvatar && <View style={styles.avatarSpacer} />}

      <View style={styles.messageContent}>
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(message.timestamp)}
          </Text>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            isSpeaking && styles.speakingBubble,
            message.isInterim && styles.interimBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
              message.isInterim && styles.interimText,
            ]}
          >
            {message.content}
            {message.isInterim && <Text style={styles.cursor}>|</Text>}
          </Text>
        </View>
      </View>

      {isUser && showAvatar && (
        <View style={[styles.avatar, styles.userAvatar]}>
          <Text style={styles.avatarText}>You</Text>
        </View>
      )}
      {isUser && !showAvatar && <View style={styles.avatarSpacer} />}
    </View>
  );
}

interface AnimatedDotProps {
  delay: number;
  anim: Animated.Value;
}

function AnimatedDot({ delay, anim }: AnimatedDotProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
  },
  avatarSpacer: {
    width: 32,
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  timestamp: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    minHeight: 40,
    justifyContent: 'center',
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  speakingBubble: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  interimBubble: {
    backgroundColor: '#1a1a1a',
    borderStyle: 'dashed',
    opacity: 0.8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#e5e5e5',
  },
  interimText: {
    color: '#888',
  },
  cursor: {
    fontSize: 15,
    color: '#888',
  },
  thinkingIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
});
