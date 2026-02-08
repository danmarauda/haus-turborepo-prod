/**
 * useVoiceChat - Unified Voice Chat Hook
 * 
 * Provides a complete voice chat experience with:
 * - LiveKit integration for real-time voice
 * - Cortex memory integration for context awareness
 * - Transcription management
 * - Voice navigation capabilities
 * - Connection state management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ConvexClient } from 'convex/browser';
import { api } from '@v1/backend/convex/_generated/api';
import type { AgentState } from '@livekit/components-react';
import { useCortexMemory, RecallResult } from './useCortexMemory';

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface VoiceMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isFinal: boolean;
  isInterim?: boolean;
}

export interface VoiceSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
}

export interface VoiceNavigationIntent {
  type: 'navigate' | 'search' | 'filter' | 'view_property' | 'save_property' | 'compare' | 'unknown';
  target?: string;
  params?: Record<string, unknown>;
  confidence: number;
}

export interface UseVoiceChatOptions {
  convex: ConvexClient;
  userId: string;
  enableMemory?: boolean;
  enableNavigation?: boolean;
  onNavigationIntent?: (intent: VoiceNavigationIntent) => void;
  onError?: (error: Error) => void;
}

export interface UseVoiceChatReturn {
  // Connection
  token: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectionError: string | null;
  agentState: AgentState;
  
  // Messages
  messages: VoiceMessage[];
  lastUserMessage: string | null;
  lastAssistantMessage: string | null;
  
  // Memory
  memoryContext: RecallResult | null;
  isRecallingMemory: boolean;
  
  // Session
  session: VoiceSession | null;
  sessionDuration: number;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTextMessage: (text: string) => void;
  recallContext: (query?: string) => Promise<void>;
  clearMessages: () => void;
  
  // Navigation
  lastNavigationIntent: VoiceNavigationIntent | null;
  
  // Recording control
  isMuted: boolean;
  toggleMute: () => void;
}

// ------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseNavigationIntent(transcript: string): VoiceNavigationIntent | null {
  const lowerTranscript = transcript.toLowerCase();
  
  // Navigation patterns
  const patterns: Array<{ 
    regex: RegExp; 
    type: VoiceNavigationIntent['type']; 
    extractTarget?: (match: RegExpMatchArray) => string | undefined;
  }> = [
    {
      regex: /(?:go to|open|show me|navigate to|take me to)\s+(?:the\s+)?(search|compass|map|favorites|saved|profile|settings|academy|vault|voice|chat)/i,
      type: 'navigate',
      extractTarget: (match) => {
        const target = match[1]?.toLowerCase();
        const targetMap: Record<string, string> = {
          'saved': 'favorites',
          'map': 'compass',
        };
        return targetMap[target] || target;
      }
    },
    {
      regex: /(?:search for|find|look for|show me)\s+(?:properties\s+(?:in|at|near)\s+)?(.+?)(?:\s+please)?$/i,
      type: 'search',
      extractTarget: (match) => match[1]?.trim()
    },
    {
      regex: /(?:filter by|show only|only show)\s+(.+)/i,
      type: 'filter',
      extractTarget: (match) => match[1]?.trim()
    },
    {
      regex: /(?:view|show|open)\s+(?:property\s+)?#?(\d+|[a-z0-9-]+)/i,
      type: 'view_property',
      extractTarget: (match) => match[1]
    },
    {
      regex: /(?:save|add to favorites|bookmark)\s+(?:this\s+)?(?:property)?/i,
      type: 'save_property'
    },
    {
      regex: /(?:compare|show comparison|difference between)\s+(.+)/i,
      type: 'compare',
      extractTarget: (match) => match[1]?.trim()
    }
  ];
  
  for (const pattern of patterns) {
    const match = lowerTranscript.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        target: pattern.extractTarget?.(match),
        confidence: 0.85,
        params: { originalQuery: transcript }
      };
    }
  }
  
  return null;
}

// ------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------

export function useVoiceChat(options: UseVoiceChatOptions): UseVoiceChatReturn {
  const { convex, userId, enableMemory = true, enableNavigation = true, onNavigationIntent, onError } = options;
  
  // Connection state
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  
  // Messages
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const messagesRef = useRef<VoiceMessage[]>([]);
  
  // Memory
  const [memoryContext, setMemoryContext] = useState<RecallResult | null>(null);
  const [isRecallingMemory, setIsRecallingMemory] = useState(false);
  
  // Session
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation
  const [lastNavigationIntent, setLastNavigationIntent] = useState<VoiceNavigationIntent | null>(null);
  
  // Recording control
  const [isMuted, setIsMuted] = useState(false);
  
  // Cortex memory hook
  const cortex = useCortexMemory({
    convex,
    userId,
    enabled: enableMemory
  });
  
  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // Session duration timer
  useEffect(() => {
    if (session && !session.endedAt) {
      durationIntervalRef.current = setInterval(() => {
        if (sessionStartTimeRef.current) {
          setSessionDuration(Date.now() - sessionStartTimeRef.current);
        }
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [session]);
  
  // Connect to voice service
  const connect = useCallback(async () => {
    if (isConnecting || token) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    setAgentState('connecting');
    
    try {
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
      const response = await fetch(`${convexUrl}/voice/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: `voice-room-${userId}`,
          participantName: `user-${userId}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.token) {
        setToken(data.token);
        setAgentState('initializing');
        
        // Start session
        const newSession: VoiceSession = {
          id: generateSessionId(),
          startedAt: Date.now(),
          messageCount: 0
        };
        setSession(newSession);
        sessionStartTimeRef.current = newSession.startedAt;
        
        // Ensure memory space exists
        if (enableMemory) {
          cortex.ensureMemorySpace();
        }
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setConnectionError(error.message);
      setAgentState('failed');
      onError?.(error);
    } finally {
      setIsConnecting(false);
    }
  }, [convex, userId, enableMemory, isConnecting, token, cortex, onError]);
  
  // Disconnect from voice service
  const disconnect = useCallback(() => {
    setToken(null);
    setAgentState('disconnected');
    
    // End session
    if (session) {
      setSession(prev => prev ? { ...prev, endedAt: Date.now() } : null);
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, [session]);
  
  // Add a message to the conversation
  const addMessage = useCallback((message: Omit<VoiceMessage, 'id' | 'timestamp'>) => {
    const newMessage: VoiceMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setSession(prev => prev ? { ...prev, messageCount: prev.messageCount + 1 } : null);
    
    // Check for navigation intent in user messages
    if (enableNavigation && message.role === 'user' && message.isFinal) {
      const intent = parseNavigationIntent(message.content);
      if (intent) {
        setLastNavigationIntent(intent);
        onNavigationIntent?.(intent);
      }
    }
    
    return newMessage;
  }, [enableNavigation, onNavigationIntent]);
  
  // Send a text message (for text-based interaction alongside voice)
  const sendTextMessage = useCallback((text: string) => {
    addMessage({
      content: text,
      role: 'user',
      isFinal: true
    });
  }, [addMessage]);
  
  // Recall context from memory
  const recallContext = useCallback(async (query?: string) => {
    if (!enableMemory) return;
    
    setIsRecallingMemory(true);
    try {
      const searchQuery = query || lastUserMessage || '';
      const context = await cortex.recallForQuery(searchQuery, 10);
      setMemoryContext(context);
    } catch (err) {
      console.error('Failed to recall context:', err);
    } finally {
      setIsRecallingMemory(false);
    }
  }, [enableMemory, cortex, lastUserMessage]);
  
  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setMemoryContext(null);
    setLastNavigationIntent(null);
  }, []);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Store conversation in memory when complete
  const storeConversation = useCallback(async (userQuery: string, agentResponse: string) => {
    if (!enableMemory) return;
    
    try {
      await cortex.rememberVoiceSearch({
        userQuery,
        agentResponse
      });
    } catch (err) {
      console.error('Failed to store conversation:', err);
    }
  }, [enableMemory, cortex]);
  
  // Computed values
  const isConnected = agentState !== 'disconnected' && agentState !== 'failed' && !!token;
  const lastUserMessage = messages.filter(m => m.role === 'user' && m.isFinal).pop()?.content || null;
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant' && m.isFinal).pop()?.content || null;
  
  return {
    // Connection
    token,
    isConnecting,
    isConnected,
    connectionError,
    agentState,
    
    // Messages
    messages,
    lastUserMessage,
    lastAssistantMessage,
    
    // Memory
    memoryContext,
    isRecallingMemory,
    
    // Session
    session,
    sessionDuration,
    
    // Actions
    connect,
    disconnect,
    sendTextMessage,
    recallContext,
    clearMessages,
    
    // Navigation
    lastNavigationIntent,
    
    // Recording control
    isMuted,
    toggleMute,
    
    // Internal: for integration with LiveKit
    _addMessage: addMessage,
    _storeConversation: storeConversation,
    _setAgentState: setAgentState
  } as UseVoiceChatReturn;
}

export default useVoiceChat;
