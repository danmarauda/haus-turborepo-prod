/**
 * VoiceContext - Global Voice State Management
 * 
 * Provides voice chat state and actions throughout the app.
 * Integrates with LiveKit for real-time voice and Cortex for memory.
 * 
 * Usage:
 * ```tsx
 * <VoiceProvider userId={userId}>
 *   <App />
 * </VoiceProvider>
 * ```
 * 
 * ```tsx
 * const { isConnected, connect, messages } = useVoice();
 * ```
 */

import React, { 
  createContext, 
  useContext, 
  useCallback, 
  useRef, 
  useEffect,
  useState
} from 'react';
import { ConvexClient } from 'convex/browser';
import { api } from '@v1/backend/convex/_generated/api';
import type { AgentState } from '@livekit/components-react';
import type { 
  VoiceMessage, 
  VoiceNavigationIntent, 
  VoiceSession 
} from '../hooks/useVoiceChat';

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

interface VoiceContextValue {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  agentState: AgentState;
  token: string | null;
  
  // Messages
  messages: VoiceMessage[];
  lastUserMessage: string | null;
  lastAssistantMessage: string | null;
  
  // Session
  session: VoiceSession | null;
  sessionDuration: number;
  
  // Navigation
  lastNavigationIntent: VoiceNavigationIntent | null;
  
  // Recording
  isMuted: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  toggleMute: () => void;
  clearMessages: () => void;
  recallContext: () => Promise<void>;
  
  // Memory context
  memoryContext: {
    memories: Array<{ content: string; relevance: number }>;
    facts: Array<{ fact: string; confidence: number }>;
    suburbPreferences: Array<{ suburbName: string; preferenceScore: number }>;
    propertyInteractions: Array<{ propertyId: string; interactionType: string }>;
  } | null;
  isLoadingMemory: boolean;
}

interface VoiceProviderProps {
  children: React.ReactNode;
  userId: string;
  convex: ConvexClient;
  enableMemory?: boolean;
  enableNavigation?: boolean;
  onNavigationIntent?: (intent: VoiceNavigationIntent) => void;
  onError?: (error: Error) => void;
}

// ------------------------------------------------------------------------------
// Context
// ------------------------------------------------------------------------------

const VoiceContext = createContext<VoiceContextValue | null>(null);

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
  
  const patterns: Array<{ 
    regex: RegExp; 
    type: VoiceNavigationIntent['type']; 
    extractTarget?: (match: RegExpMatchArray) => string | undefined;
    extractParams?: (match: RegExpMatchArray) => Record<string, unknown>;
  }> = [
    {
      regex: /(?:go to|open|show me|navigate to|take me to)\s+(?:the\s+)?(search|compass|map|favorites|saved|profile|settings|academy|vault|voice|chat|home|market|agency)/i,
      type: 'navigate',
      extractTarget: (match) => {
        const target = match[1]?.toLowerCase();
        const targetMap: Record<string, string> = {
          'saved': 'favorites',
          'map': 'compass',
          'home': 'index',
        };
        return targetMap[target] || target;
      }
    },
    {
      regex: /(?:search for|find|look for|show me)\s+(?:properties\s+(?:in|at|near)\s+)?(.+?)(?:\s+please)?$/i,
      type: 'search',
      extractTarget: (match) => match[1]?.trim(),
      extractParams: (match) => ({ query: match[1]?.trim() })
    },
    {
      regex: /(?:filter by|show only|only show)\s+(?:properties\s+)?(?:under\s+\$?(\d+)[kmb]?|\$?(\d+)[kmb]?\s*(?:and\s*under|or\s*less)|with\s+(\d+)\s+bedrooms?|(\d+)\s+bedrooms?\s+or\s+more)/i,
      type: 'filter',
      extractParams: (match) => {
        const maxPrice = match[1] || match[2];
        const minBedrooms = match[3] || match[4];
        return {
          maxPrice: maxPrice ? parsePrice(maxPrice) : undefined,
          minBedrooms: minBedrooms ? parseInt(minBedrooms, 10) : undefined
        };
      }
    },
    {
      regex: /(?:view|show|open)\s+(?:property\s+)?#?(\d+|[a-z0-9-]+)/i,
      type: 'view_property',
      extractTarget: (match) => match[1],
      extractParams: (match) => ({ propertyId: match[1] })
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
        params: pattern.extractParams?.(match) || { originalQuery: transcript }
      };
    }
  }
  
  return null;
}

function parsePrice(priceStr: string): number {
  const clean = priceStr.toLowerCase().replace(/[$,\s]/g, '');
  if (clean.endsWith('m')) {
    return parseFloat(clean) * 1000000;
  } else if (clean.endsWith('k')) {
    return parseFloat(clean) * 1000;
  } else if (clean.endsWith('b')) {
    return parseFloat(clean) * 1000000000;
  }
  return parseFloat(clean);
}

// ------------------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------------------

export function VoiceProvider({
  children,
  userId,
  convex,
  enableMemory = true,
  enableNavigation = true,
  onNavigationIntent,
  onError
}: VoiceProviderProps) {
  // Connection state
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  
  // Messages
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const messagesRef = useRef<VoiceMessage[]>([]);
  
  // Session
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memory
  const [memoryContext, setMemoryContext] = useState<VoiceContextValue['memoryContext']>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  
  // Navigation
  const [lastNavigationIntent, setLastNavigationIntent] = useState<VoiceNavigationIntent | null>(null);
  
  // Recording
  const [isMuted, setIsMuted] = useState(false);
  
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
          roomName: `voice-room-${userId}-${Date.now()}`,
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
          try {
            await convex.mutation(api.cortex.ensureMemorySpace, { userId });
          } catch (err) {
            console.warn('Failed to ensure memory space:', err);
          }
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
  }, [convex, userId, enableMemory, isConnecting, token, onError]);
  
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
  
  // Add a message
  const addMessage = useCallback((message: Omit<VoiceMessage, 'id' | 'timestamp'>) => {
    const newMessage: VoiceMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setSession(prev => prev ? { ...prev, messageCount: prev.messageCount + 1 } : null);
    
    // Check for navigation intent
    if (enableNavigation && message.role === 'user' && message.isFinal) {
      const intent = parseNavigationIntent(message.content);
      if (intent) {
        setLastNavigationIntent(intent);
        onNavigationIntent?.(intent);
      }
    }
    
    // Store conversation in memory
    if (enableMemory && message.role === 'assistant' && message.isFinal) {
      const userMessages = messagesRef.current.filter(m => m.role === 'user' && m.isFinal);
      const lastUserMsg = userMessages[userMessages.length - 1];
      
      if (lastUserMsg) {
        convex.mutation(api.cortex.rememberVoiceSearch, {
          userId,
          userQuery: lastUserMsg.content,
          agentResponse: message.content
        }).catch(err => {
          console.warn('Failed to store conversation:', err);
        });
      }
    }
    
    return newMessage;
  }, [enableMemory, enableNavigation, userId, convex, onNavigationIntent]);
  
  // Send a text message
  const sendMessage = useCallback((text: string) => {
    addMessage({
      content: text,
      role: 'user',
      isFinal: true
    });
  }, [addMessage]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setMemoryContext(null);
    setLastNavigationIntent(null);
  }, []);
  
  // Recall context from memory
  const recallContext = useCallback(async () => {
    if (!enableMemory) return;
    
    setIsLoadingMemory(true);
    try {
      const userMessages = messagesRef.current.filter(m => m.role === 'user' && m.isFinal);
      const query = userMessages[userMessages.length - 1]?.content || '';
      
      const result = await convex.query(api.cortex.recallForQuery, {
        userId,
        query,
        limit: 10
      });
      
      setMemoryContext(result);
    } catch (err) {
      console.error('Failed to recall context:', err);
    } finally {
      setIsLoadingMemory(false);
    }
  }, [enableMemory, convex, userId]);
  
  // Computed values
  const isConnected = agentState !== 'disconnected' && agentState !== 'failed' && !!token;
  const lastUserMessage = messages.filter(m => m.role === 'user' && m.isFinal).pop()?.content || null;
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant' && m.isFinal).pop()?.content || null;
  
  const value: VoiceContextValue = {
    // Connection
    isConnected,
    isConnecting,
    connectionError,
    agentState,
    token,
    
    // Messages
    messages,
    lastUserMessage,
    lastAssistantMessage,
    
    // Session
    session,
    sessionDuration,
    
    // Navigation
    lastNavigationIntent,
    
    // Recording
    isMuted,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    toggleMute,
    clearMessages,
    recallContext,
    
    // Memory
    memoryContext,
    isLoadingMemory
  };
  
  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

// ------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------

export function useVoice(): VoiceContextValue {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export function useVoiceOptional(): VoiceContextValue | null {
  return useContext(VoiceContext);
}

export default VoiceContext;
