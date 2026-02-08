/**
 * VoiceCopilot - Voice Assistant Copilot UI
 * 
 * A comprehensive voice assistant interface that provides:
 * - Voice orb with state visualization
 * - Real-time transcription display
 * - Memory context integration
 * - Voice navigation suggestions
 * - Quick action buttons
 * 
 * @example
 * ```tsx
 * <VoiceCopilot 
 *   onNavigate={(intent) => router.push(intent.target)}
 *   showMemoryPanel={true}
 * />
 * ```
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  MessageSquare,
  X,
  Mic,
  MicOff,
  Brain,
  MapPin,
  Search,
  Heart,
  Compass,
  Home,
  ChevronRight,
} from 'lucide-react-native';
import { useVoice } from '../../context/VoiceContext';
import { VoiceOrb } from './VoiceOrb';
import { TranscriptionUI, TranscriptMessage } from './TranscriptionUI';
import { cn } from '../../lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface VoiceCopilotProps {
  onClose?: () => void;
  onNavigate?: (target: string, params?: Record<string, unknown>) => void;
  showMemoryPanel?: boolean;
  showSuggestions?: boolean;
  compact?: boolean;
}

interface SuggestionItem {
  icon: React.ReactNode;
  label: string;
  action: string;
  color: string;
}

// ------------------------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------------------------

function StatusBadge({ state }: { state: string }) {
  const getStatusConfig = () => {
    switch (state) {
      case 'listening':
        return { text: 'Listening', color: '#8b5cf6', bgColor: '#8b5cf620' };
      case 'thinking':
        return { text: 'Thinking', color: '#f59e0b', bgColor: '#f59e0b20' };
      case 'speaking':
        return { text: 'Speaking', color: '#10b981', bgColor: '#10b98120' };
      case 'connecting':
        return { text: 'Connecting', color: '#6b7280', bgColor: '#6b728020' };
      case 'idle':
        return { text: 'Ready', color: '#0ea5e9', bgColor: '#0ea5e920' };
      default:
        return { text: state, color: '#6b7280', bgColor: '#6b728020' };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
}

function MemoryChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity 
      style={styles.memoryChip}
      onPress={onPress}
    >
      <Brain size={12} color="#8b5cf6" />
      <Text style={styles.memoryChipText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickAction({ 
  icon, 
  label, 
  color, 
  onPress 
}: { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: `${color}15` }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}30` }]}>
        {icon}
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------------------

export function VoiceCopilot({
  onClose,
  onNavigate,
  showMemoryPanel = true,
  showSuggestions = true,
  compact = false,
}: VoiceCopilotProps) {
  const insets = useSafeAreaInsets();
  const {
    isConnected,
    isConnecting,
    agentState,
    messages,
    memoryContext,
    isLoadingMemory,
    lastNavigationIntent,
    isMuted,
    connect,
    disconnect,
    toggleMute,
    recallContext,
    sessionDuration,
  } = useVoice();
  
  // Format session duration
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(sessionDuration / 60000);
    const seconds = Math.floor((sessionDuration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [sessionDuration]);
  
  // Convert messages to transcript format
  const transcriptMessages: TranscriptMessage[] = useMemo(() => {
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      isFinal: msg.isFinal,
      isInterim: msg.isInterim,
    }));
  }, [messages]);
  
  // Handle navigation from voice intent
  const handleNavigation = useCallback((target: string, params?: Record<string, unknown>) => {
    onNavigate?.(target, params);
    
    // Default navigation behavior
    switch (target) {
      case 'compass':
      case 'map':
        router.push('/compass' as any);
        break;
      case 'search':
        router.push('/search' as any);
        break;
      case 'favorites':
        router.push('/favorites' as any);
        break;
      case 'home':
      case 'index':
        router.push('/' as any);
        break;
      case 'academy':
        router.push('/(tabs)/(haus)/academy' as any);
        break;
      case 'vault':
        router.push('/(tabs)/(haus)/vault' as any);
        break;
      case 'profile':
        router.push('/profile' as any);
        break;
      case 'settings':
        router.push('/settings' as any);
        break;
      case 'voice':
        // Already on voice
        break;
      case 'chat':
        router.push('/ai-chat' as any);
        break;
      case 'market':
        router.push('/market' as any);
        break;
      case 'agency':
        router.push('/agency' as any);
        break;
    }
  }, [onNavigate]);
  
  // Quick suggestions
  const suggestions: SuggestionItem[] = [
    { 
      icon: <Search size={20} color="#0ea5e9" />, 
      label: 'Search', 
      action: 'search',
      color: '#0ea5e9'
    },
    { 
      icon: <Compass size={20} color="#8b5cf6" />, 
      label: 'Map', 
      action: 'compass',
      color: '#8b5cf6'
    },
    { 
      icon: <Heart size={20} color="#f43f5e" />, 
      label: 'Saved', 
      action: 'favorites',
      color: '#f43f5e'
    },
    { 
      icon: <Home size={20} color="#10b981" />, 
      label: 'Home', 
      action: 'home',
      color: '#10b981'
    },
  ];
  
  // Show navigation suggestion if intent detected
  const showNavigationSuggestion = lastNavigationIntent && lastNavigationIntent.confidence > 0.7;
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <VoiceOrb 
          state={agentState} 
          size="sm" 
          onPress={isConnected ? disconnect : connect}
        />
        <StatusBadge state={agentState} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Voice Assistant</Text>
          {isConnected && (
            <Text style={styles.duration}>{formattedDuration}</Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => handleNavigation('chat')}
          >
            <MessageSquare size={20} color="#666" />
          </TouchableOpacity>
          
          {onClose && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={onClose}
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Voice Orb Section */}
        <View style={styles.orbSection}>
          <VoiceOrb 
            state={agentState} 
            size="lg" 
            onPress={isConnected ? undefined : connect}
            disabled={isConnecting}
          />
          
          <StatusBadge state={agentState} />
          
          {/* Connection Controls */}
          {!isConnected ? (
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={connect}
              disabled={isConnecting}
            >
              <Text style={styles.connectButtonText}>
                {isConnecting ? 'Connecting...' : 'Tap to Start'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controls}>
              <TouchableOpacity 
                style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                onPress={toggleMute}
              >
                {isMuted ? (
                  <MicOff size={20} color={isMuted ? '#fff' : '#666'} />
                ) : (
                  <Mic size={20} color="#666" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.disconnectButton]}
                onPress={disconnect}
              >
                <Text style={styles.disconnectText}>End</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Navigation Suggestion */}
        {showNavigationSuggestion && (
          <TouchableOpacity 
            style={styles.navigationSuggestion}
            onPress={() => handleNavigation(
              lastNavigationIntent.target || '',
              lastNavigationIntent.params
            )}
          >
            <View style={styles.navigationIcon}>
              <ChevronRight size={16} color="#0ea5e9" />
            </View>
            <View style={styles.navigationContent}>
              <Text style={styles.navigationLabel}>
                Go to {lastNavigationIntent.target}
              </Text>
              <Text style={styles.navigationDescription}>
                Voice navigation detected
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Transcription */}
        {isConnected && messages.length > 0 && (
          <View style={styles.transcriptionSection}>
            <TranscriptionUI 
              messages={transcriptMessages}
              isThinking={agentState === 'thinking'}
              isSpeaking={agentState === 'speaking'}
            />
          </View>
        )}
        
        {/* Memory Context */}
        {showMemoryPanel && memoryContext && (
          <View style={styles.memorySection}>
            <View style={styles.memoryHeader}>
              <Brain size={16} color="#8b5cf6" />
              <Text style={styles.memoryTitle}>Memory Context</Text>
              {isLoadingMemory && (
                <Text style={styles.memoryLoading}>Loading...</Text>
              )}
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.memoryChips}
            >
              {memoryContext.suburbPreferences?.slice(0, 3).map((pref, index) => (
                <MemoryChip 
                  key={`suburb-${index}`}
                  label={`${pref.suburbName}: ${pref.preferenceScore > 0 ? '+' : ''}${pref.preferenceScore}`}
                />
              ))}
              {memoryContext.facts?.slice(0, 3).map((fact, index) => (
                <MemoryChip 
                  key={`fact-${index}`}
                  label={fact.fact}
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Quick Actions */}
        {showSuggestions && !isConnected && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Quick Actions</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map((item) => (
                <QuickAction
                  key={item.action}
                  icon={item.icon}
                  label={item.label}
                  color={item.color}
                  onPress={() => handleNavigation(item.action)}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  duration: {
    fontSize: 14,
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  orbSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  disconnectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e920',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e940',
  },
  navigationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0ea5e930',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navigationContent: {
    flex: 1,
  },
  navigationLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationDescription: {
    color: '#0ea5e9',
    fontSize: 13,
    marginTop: 2,
  },
  transcriptionSection: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  memorySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  memoryTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  memoryLoading: {
    color: '#666',
    fontSize: 12,
  },
  memoryChips: {
    flexGrow: 0,
  },
  memoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    maxWidth: 200,
  },
  memoryChipText: {
    color: '#a78bfa',
    fontSize: 13,
  },
  suggestionsSection: {
    padding: 20,
  },
  suggestionsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VoiceCopilot;
