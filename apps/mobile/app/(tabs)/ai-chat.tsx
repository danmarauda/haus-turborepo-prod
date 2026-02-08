/**
 * AI Chat Tab
 *
 * A dedicated tab for text-based AI chat with HAUS.
 * Integrates with Cortex memory and supports property context.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatContainer } from '../../components/ai/ChatContainer';
import { useCortexMemory } from '../../hooks/useCortexMemory';
import { convex } from '../../lib/convex';
import ChatErrorBoundary from '../../components/error-boundaries/ChatErrorBoundary';

// Get or create a user ID (in production, this comes from auth)
const getUserId = () => {
  // Use a stable user ID for demo purposes
  return 'mobile-user-chat';
};

const userId = getUserId();

// Default suggestions for the welcome screen
const DEFAULT_SUGGESTIONS = [
  'Show me properties in Melbourne under $1M',
  'What are the current market trends in Richmond?',
  'Compare buying vs renting in South Yarra',
  'What inspections are happening this weekend?',
  'Tell me about stamp duty in Victoria',
];

function AIChatScreenContent() {
  const router = useRouter();

  // Initialize Cortex memory
  const cortex = useCortexMemory({
    convex,
    userId,
    enabled: true,
  });

  // Handle switching to voice mode
  const handleSwitchToVoice = useCallback(() => {
    router.push('/voice');
  }, [router]);

  // Handle property selection from chat
  const handlePropertySelect = useCallback((propertyId: string) => {
    router.push(`/property/${propertyId}`);
  }, [router]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ChatContainer
          userId={userId}
          suggestions={DEFAULT_SUGGESTIONS}
          enableMemory={true}
          enableTools={true}
          onSwitchToVoice={handleSwitchToVoice}
          onPropertySelect={handlePropertySelect}
        />
      </SafeAreaView>
    </View>
  );
}

// Export wrapped component with error boundary
export default function AIChatScreen() {
  const router = useRouter();
  
  return (
    <ChatErrorBoundary
      onReset={() => {
        console.log('Chat error boundary reset');
      }}
      onSwitchToVoice={() => {
        router.push('/voice');
      }}
      onGoBack={() => {
        router.back();
      }}
    >
      <AIChatScreenContent />
    </ChatErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
});
