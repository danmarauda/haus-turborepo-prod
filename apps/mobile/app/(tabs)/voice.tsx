import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/auth/useAuth';
import { MessageSquare } from 'lucide-react-native';
import { registerGlobals } from '@livekit/react-native';
import { LiveKitRoom, RoomAudioRenderer, useVoiceAssistant } from '@livekit/components-react';
import type { AgentState } from '@livekit/components-react';
import { ConvexClient } from 'convex/browser';
import { api } from '@v1/backend/convex/_generated/api';
import { LivekitOrb } from '../../components/voice/LivekitOrb';
import { TranscriptionUI, TranscriptMessage } from '../../components/voice/TranscriptionUI';
import { useMicrophoneControl } from '../../hooks/useMicControl';
import { useVoiceTranscription } from '../../hooks/useVoiceTranscription';
import { useCortexMemory, useConversationMemory } from '../../hooks/useCortexMemory';
import type { RecallResult } from '../../hooks/useCortexMemory';
import { MemoryContextPanel, MemoryQuickSummary } from '../../components/memory';
import VoiceErrorBoundary from '../../components/error-boundaries/VoiceErrorBoundary';

// Register LiveKit globals once
registerGlobals();

const convex = new ConvexClient(process.env.EXPO_PUBLIC_CONVEX_URL || '');

function VoiceScreenContent() {
  const [token, setToken] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [memoryContext, setMemoryContext] = useState<RecallResult | null>(null);
  const { isMuted, toggleMute, startRecording, stopRecording } = useMicrophoneControl();
  const { isAuthenticated, isLoading: isAuthLoading, userId } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Cortex memory integration - only enabled when we have a userId
  const cortex = useCortexMemory({
    convex,
    userId: userId || '',
    enabled: !!userId,
  });

  const conversationMemory = useConversationMemory({
    convex,
    userId: userId || '',
    enabled: !!userId,
    onConversationStored: (conversationId) => {
      // Conversation stored successfully
      // Could trigger UI update or analytics here
    },
  });

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LivekitOrb state="connecting" size="md" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !userId) {
    return (
      <View style={styles.loadingContainer}>
        <LivekitOrb state="connecting" size="md" />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  // Handle switching to text chat
  const handleSwitchToText = useCallback(() => {
    router.push('/ai-chat');
  }, [router]);

  // Fetch LiveKit token from Convex
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setError(null);
        setAgentState('connecting');
        // Call the HTTP endpoint via fetch
        const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
        const response = await fetch(`${convexUrl}/voice/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: 'voice-agent-room',
            participantName: 'mobile-user',
          }),
        });
        const data = await response.json();
        if (data?.token) {
          setToken(data.token);
        } else {
          setAgentState('failed');
          setError('Failed to get access token');
        }
      } catch (err) {
        console.error('Token fetch error:', err);
        setAgentState('failed');
        setError('Could not connect to voice service');
      }
    };

    fetchToken();
  }, []);

  const handleConnect = useCallback(() => {
    setAgentState('initializing');
  }, []);

  const handleDisconnect = useCallback(() => {
    setAgentState('disconnected');
    setToken(null);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Voice Assistant</Text>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToText}
          >
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.switchButtonText}>Text</Text>
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {token ? (
        <LiveKitRoom
          token={token}
          serverUrl={process.env.EXPO_PUBLIC_LIVEKIT_URL!}
          connect={true}
          audio={true}
          video={false}
          onConnected={() => setAgentState('initializing')}
          onDisconnected={() => setAgentState('disconnected')}
          onError={(err) => {
            console.error('LiveKit error:', err);
            setError('Connection error');
            setAgentState('failed');
          }}
          style={styles.room}
        >
          <RoomAudioRenderer />
          <VoiceContent
            agentState={agentState}
            setAgentState={setAgentState}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onDisconnect={handleDisconnect}
            cortex={cortex}
            conversationMemory={conversationMemory}
            memoryContext={memoryContext}
            setMemoryContext={setMemoryContext}
          />
        </LiveKitRoom>
      ) : (
        <View style={styles.loadingContainer}>
          <LivekitOrb state={agentState} size="md" />
          <Text style={styles.loadingText}>
            {agentState === 'connecting' ? 'Connecting...' :
             agentState === 'failed' ? 'Failed to connect' :
             'Initializing...'}
          </Text>
        </View>
      )}
    </View>
  );
}

interface VoiceContentProps {
  agentState: AgentState;
  setAgentState: (state: AgentState) => void;
  isMuted: boolean;
  toggleMute: () => void;
  onDisconnect: () => void;
  cortex: ReturnType<typeof useCortexMemory>;
  conversationMemory: ReturnType<typeof useConversationMemory>;
  memoryContext: RecallResult | null;
  setMemoryContext: (context: RecallResult | null) => void;
}

function VoiceContent({
  agentState,
  setAgentState,
  isMuted,
  toggleMute,
  onDisconnect,
  cortex,
  conversationMemory,
  memoryContext,
  setMemoryContext,
}: VoiceContentProps) {
  const { audioTrack, state: voiceAssistantState } = useVoiceAssistant();
  const { transcripts } = useVoiceTranscription({ audioTrack });

  // Use voice assistant state when available, fall back to prop state
  const effectiveState = (voiceAssistantState as AgentState) || agentState;

  // Sync effective state with parent
  useEffect(() => {
    if (voiceAssistantState && voiceAssistantState !== agentState) {
      setAgentState(voiceAssistantState as AgentState);
    }
  }, [voiceAssistantState, agentState, setAgentState]);

  // Format transcripts for TranscriptionUI
  const formattedMessages = useMemo(() => {
    const messages: TranscriptMessage[] = Object.values(transcripts).map((t) => ({
      id: t.id,
      content: t.message,
      role: t.isSelf ? 'user' : 'assistant',
      timestamp: t.timestamp,
      isFinal: true,
    }));

    // Sort by timestamp
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcripts]);

  const isThinking = effectiveState === 'thinking';
  const isSpeaking = effectiveState === 'speaking';

  const handleMicToggle = async () => {
    if (isMuted) {
      await toggleMute();
    } else {
      await toggleMute();
    }
  };

  // Conversation tracking for Cortex memory
  const [pendingUserQuery, setPendingUserQuery] = useState<string | null>(null);
  const [lastAgentState, setLastAgentState] = useState<AgentState>('disconnected');
  const [lastStoredMessageId, setLastStoredMessageId] = useState<string | null>(null);
  const [isStoringConversation, setIsStoringConversation] = useState(false);

  // Detect conversation turns and store in memory
  useEffect(() => {
    let mounted = true;

    const stateChanged = voiceAssistantState !== lastAgentState;
    setLastAgentState(voiceAssistantState as AgentState || agentState);

    // Get all messages
    const userMessages = Object.values(transcripts).filter(t => t.isSelf);
    const agentMessages = Object.values(transcripts).filter(t => !t.isSelf);

    // When agent finishes speaking (was speaking, now idle/listening)
    if (stateChanged && lastAgentState === 'speaking' &&
        (effectiveState === 'idle' || effectiveState === 'listening' || effectiveState === 'thinking')) {
      // Find the most recent complete pair
      if (userMessages.length > 0 && agentMessages.length > 0 && !isStoringConversation) {
        const latestUserMessage = userMessages[userMessages.length - 1];
        const latestAgentMessage = agentMessages[agentMessages.length - 1];

        // Only store if we haven't stored this message pair yet
        if (lastStoredMessageId !== latestAgentMessage.id) {
          setIsStoringConversation(true);
          conversationMemory.storeConversation({
            userQuery: latestUserMessage.message,
            agentResponse: latestAgentMessage.message,
          }).then(() => {
            if (mounted) {
              setLastStoredMessageId(latestAgentMessage.id);
              setIsStoringConversation(false);
            }
          }).catch(() => {
            // Still reset storing state on error
            if (mounted) {
              setIsStoringConversation(false);
            }
          });
        }
      }
    }

    return () => {
      mounted = false;
    };
  }, [voiceAssistantState, effectiveState, transcripts, lastAgentState, conversationMemory, lastStoredMessageId, isStoringConversation]);

  // Recall memory context handler
  const handleRecallContext = useCallback(async () => {
    const userMessages = Object.values(transcripts).filter(t => t.isSelf);
    const recentQuery = userMessages.length > 0
      ? userMessages[userMessages.length - 1].message
      : '';

    if (!recentQuery) return;

    const context = await cortex.recallForQuery(recentQuery, 10);
    setMemoryContext(context);
  }, [cortex, transcripts]);

  // Toggle memory view - open the modal
  const handleToggleMemory = useCallback(() => {
    if (!memoryContext) {
      // Recall context on first open
      const userMessages = Object.values(transcripts).filter(t => t.isSelf);
      const recentQuery = userMessages.length > 0
        ? userMessages[userMessages.length - 1].message
        : '';
      cortex.recallForQuery(recentQuery, 10).then(setMemoryContext);
    }
    // The MemoryContextPanel modal manages its own visibility
    // This is now handled by tapping the MemoryQuickSummary component
  }, [memoryContext, transcripts, cortex]);

  return (
    <SafeAreaView style={styles.content} edges={['bottom']}>
      {/* Voice Orb - Compact header */}
      <View style={styles.orbHeader}>
        <LivekitOrb state={effectiveState} size="sm" />
        <View style={styles.statusContainer}>
          <Text style={styles.stateLabel}>
            {effectiveState === 'speaking' ? 'Agent is speaking' :
             effectiveState === 'listening' ? 'Listening...' :
             effectiveState === 'thinking' ? 'Agent is thinking...' :
             effectiveState === 'idle' ? 'Ready' :
             effectiveState === 'connecting' ? 'Connecting...' :
             effectiveState === 'initializing' ? 'Initializing...' :
             effectiveState === 'pre-connect-buffering' ? 'Buffering...' :
             effectiveState === 'disconnected' ? 'Disconnected' :
             effectiveState === 'failed' ? 'Connection failed' :
             effectiveState.toUpperCase()}
          </Text>
          <Text style={styles.connectionStatus}>
            {effectiveState === 'listening' || effectiveState === 'idle' || effectiveState === 'thinking' || effectiveState === 'speaking'
              ? '● Connected'
              : '○ ' + effectiveState}
          </Text>
        </View>
      </View>

      {/* Transcription UI */}
      <TranscriptionUI
        messages={formattedMessages}
        isThinking={isThinking}
        isSpeaking={isSpeaking}
      />

      {/* Memory Quick Summary (always shown when context exists) */}
      {memoryContext && (
        <MemoryQuickSummary
          suburbPreferences={memoryContext.suburbPreferences}
          facts={memoryContext.facts}
          onShowFullContext={handleToggleMemory}
        />
      )}

      {/* Full Memory Context Panel (modal) */}
      <MemoryContextPanel
        suburbPreferences={memoryContext?.suburbPreferences ?? []}
        facts={memoryContext?.facts ?? []}
        propertyInteractions={memoryContext?.propertyInteractions ?? []}
        memories={memoryContext?.memories ?? []}
        isLoading={cortex.isLoading}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.micButton, isMuted && styles.micButtonMuted]}
          onPress={handleMicToggle}
        >
          <Text style={styles.micIcon}>
            {isMuted ? '🎤' : '⏸️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.disconnectButton]}
          onPress={onDisconnect}
        >
          <Text style={styles.controlButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Renderer (required) */}
      <RoomAudioRenderer />
    </SafeAreaView>
  );
}

// Export wrapped component with error boundary
export default function VoiceScreen() {
  const router = useRouter();
  
  return (
    <VoiceErrorBoundary
      onReset={() => {
        // Reset any voice-specific state if needed
        console.log('Voice error boundary reset');
      }}
      onSwitchToText={() => {
        router.push('/ai-chat');
      }}
      onEndCall={() => {
        // Navigate back or to home
        router.back();
      }}
    >
      <VoiceScreenContent />
    </VoiceErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
  },
  room: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  orbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  statusContainer: {
    flex: 1,
    marginLeft: 16,
  },
  stateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 12,
    color: '#10b981',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0f0f0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
  },
  micButtonMuted: {
    backgroundColor: '#ef4444',
  },
  micIcon: {
    fontSize: 24,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
