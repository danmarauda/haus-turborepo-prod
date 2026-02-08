/**
 * useAIChat - Hook for AI chat using Convex actions
 *
 * Migrated from: hooks/usePropertyChat.ts (tRPC-based)
 * Target: Convex actions with AI SDK 4.x format
 *
 * Features:
 * - Text-based chat with AI
 * - Message streaming simulation
 * - Cortex memory integration
 * - Tool calling support
 * - Property context awareness
 */

import { useState, useCallback, useRef } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@v1/backend/convex/_generated/api';
import { useCortexMemory } from './useCortexMemory';
import { convex } from '../lib/convex';

// =============================================================================
// Types
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: {
    isStreaming?: boolean;
    isVoiceMessage?: boolean;
    propertyId?: string;
    toolCalls?: Array<{
      toolName: string;
      toolCallId: string;
      state: string;
      result?: any;
    }>;
  };
  parts?: Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
}

export interface UseAIChatOptions {
  /** Optional property ID for property-specific context */
  propertyId?: string;
  /** Custom system prompt */
  systemPrompt?: string;
  /** Enable/disable Cortex memory integration */
  enableMemory?: boolean;
  /** User ID for memory and personalization */
  userId?: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Enable tool calling */
  enableTools?: boolean;
  /** Maximum number of messages to keep in context */
  maxContextMessages?: number;
}

export interface UseAIChatReturn {
  /** Current messages in the conversation */
  messages: ChatMessage[];
  /** Whether the AI is currently generating a response */
  isLoading: boolean;
  /** Any error that occurred during the last operation */
  error: Error | null;
  /** Send a new message to the AI */
  sendMessage: (text: string) => Promise<void>;
  /** Clear all messages */
  clearMessages: () => void;
  /** Retry the last failed message */
  retryLastMessage: () => Promise<void>;
  /** Whether streaming is in progress */
  isStreaming: boolean;
  /** Stop the current generation (if streaming) */
  stopGeneration: () => void;
  /** Current streaming content (for UI display) */
  streamingContent: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Generate a unique message ID */
const generateMessageId = (prefix: string = 'msg'): string => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/** Get default system prompt */
const getDefaultSystemPrompt = (propertyId?: string): string => {
  if (propertyId) {
    return `You are HAUS, an AI assistant helping with property ID: ${propertyId}.
Provide helpful insights about this property and the Melbourne real estate market.
Be concise but informative, and use Australian real estate terminology.`;
  }
  
  return `You are HAUS, an AI assistant for Australian real estate.
Help users understand properties, analyze listings, and provide market insights for Melbourne.
Be professional, knowledgeable, and use Australian real estate terminology.
Keep responses concise but informative.`;
};

/** Convert chat messages to Convex action format */
const formatMessagesForConvex = (
  messages: ChatMessage[],
  maxMessages: number = 20
): Array<{ role: 'user' | 'assistant'; content: string }> => {
  // Get last N messages to stay within context limits
  const recentMessages = messages.slice(-maxMessages);
  
  return recentMessages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
};

// =============================================================================
// Hook
// =============================================================================

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    propertyId,
    systemPrompt,
    enableMemory = true,
    userId = 'anonymous-user',
    onError,
    enableTools = false,
    maxContextMessages = 20,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingUserMessageRef = useRef<string | null>(null);

  // Convex actions
  const chatAction = useAction(api.ai.chat);
  const chatWithToolsAction = useAction(api.ai.chatWithTools);

  // Cortex memory integration
  const cortex = useCortexMemory({
    convex,
    userId,
    enabled: enableMemory,
  });

  // Recall context from memory when starting a new conversation
  const recallContext = useCallback(
    async (query: string): Promise<string> => {
      if (!enableMemory) return '';
      
      try {
        const result = await cortex.recallForQuery(query, 5);
        
        // Build context from recalled memories
        const contextParts: string[] = [];
        
        if (result.memories.length > 0) {
          contextParts.push('Relevant past conversations:');
          result.memories.slice(0, 3).forEach((m) => {
            contextParts.push(`- ${m.content}`);
          });
        }
        
        if (result.suburbPreferences.length > 0) {
          contextParts.push('\nUser preferences:');
          result.suburbPreferences.slice(0, 3).forEach((p) => {
            contextParts.push(`- ${p.suburbName}: ${p.preferenceScore > 0 ? 'likes' : 'dislikes'} (${p.preferenceScore})`);
          });
        }
        
        return contextParts.join('\n');
      } catch (err) {
        console.error('[useAIChat] Failed to recall context:', err);
        return '';
      }
    },
    [cortex, enableMemory]
  );

  // Store conversation in memory
  const storeInMemory = useCallback(
    async (userQuery: string, agentResponse: string) => {
      if (!enableMemory || userId === 'anonymous-user') return;
      
      try {
        await cortex.rememberVoiceSearch({
          userQuery,
          agentResponse,
          propertyId,
          propertyContext: propertyId ? { propertyId } : undefined,
        });
      } catch (err) {
        console.error('[useAIChat] Failed to store in memory:', err);
      }
    },
    [cortex, enableMemory, userId, propertyId]
  );

  // Send a message to the AI
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const trimmedText = text.trim();
      pendingUserMessageRef.current = trimmedText;

      // Create user message
      const userMessage: ChatMessage = {
        id: generateMessageId('user'),
        role: 'user',
        content: trimmedText,
        timestamp: Date.now(),
      };

      // Add user message to state
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setIsStreaming(true);
      setStreamingContent('');

      try {
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Recall context from memory
        const memoryContext = await recallContext(trimmedText);

        // Build conversation history
        const conversationHistory = formatMessagesForConvex(
          [...messages, userMessage],
          maxContextMessages
        );

        // Build system prompt with memory context
        const basePrompt = systemPrompt || getDefaultSystemPrompt(propertyId);
        const enhancedPrompt = memoryContext
          ? `${basePrompt}\n\n${memoryContext}`
          : basePrompt;

        // Call appropriate Convex action
        let result;
        
        if (enableTools) {
          result = await chatWithToolsAction({
            messages: conversationHistory,
            systemPrompt: enhancedPrompt,
            userId,
            enablePropertySearch: true,
          });
        } else {
          result = await chatAction({
            messages: conversationHistory,
            systemPrompt: enhancedPrompt,
            userId,
          });
        }

        // Simulate streaming by revealing content progressively
        const fullText = result.text;
        const words = fullText.split(' ');
        let currentContent = '';
        
        for (let i = 0; i < words.length; i++) {
          // Check if generation was aborted
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }
          
          currentContent += (i > 0 ? ' ' : '') + words[i];
          setStreamingContent(currentContent);
          
          // Small delay to simulate streaming (adjust for desired speed)
          if (i < words.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        }

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: generateMessageId('assistant'),
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
          metadata: {
            toolCalls: result.toolCalls,
          },
        };

        // Add assistant message to state
        setMessages((prev) => [...prev, assistantMessage]);

        // Store conversation in memory
        await storeInMemory(trimmedText, fullText);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send message');
        setError(error);
        onError?.(error);

        // Add error message
        const errorMessage: ChatMessage = {
          id: generateMessageId('error'),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
          metadata: { isStreaming: false },
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingContent('');
        pendingUserMessageRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      isLoading,
      systemPrompt,
      propertyId,
      enableTools,
      userId,
      maxContextMessages,
      chatAction,
      chatWithToolsAction,
      recallContext,
      storeInMemory,
      onError,
    ]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
    pendingUserMessageRef.current = null;
  }, []);

  // Retry the last failed message
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    
    if (lastUserMessage) {
      // Remove the last assistant message (error message)
      setMessages((prev) => {
        const lastAssistantIndex = prev.findLastIndex(
          (m) => m.role === 'assistant'
        );
        if (lastAssistantIndex > -1) {
          return prev.slice(0, lastAssistantIndex);
        }
        return prev;
      });
      
      // Resend the message
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Stop current generation
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    isStreaming,
    streamingContent,
    stopGeneration,
  };
}

// =============================================================================
// Additional Hooks for Specific Use Cases
// =============================================================================

/**
 * Hook for property analysis using AI
 */
export function usePropertyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const analyzePropertyAction = useAction(api.ai.analyzeProperty);
  const summarizePropertyAction = useAction(api.ai.summarizeProperty);

  const analyzeProperty = useCallback(
    async (imageBase64: string, additionalContext?: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await analyzePropertyAction({
          imageBase64,
          additionalContext,
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to analyze property');
        setError(error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyzePropertyAction]
  );

  const summarizeProperty = useCallback(
    async (imageBase64: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await summarizePropertyAction({
          imageBase64,
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to summarize property');
        setError(error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [summarizePropertyAction]
  );

  return {
    isAnalyzing,
    error,
    analyzeProperty,
    summarizeProperty,
  };
}

/**
 * Hook for market insights using AI
 */
export function useMarketInsights() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const marketInsightsAction = useAction(api.ai.marketInsights);

  const getInsights = useCallback(
    async (suburb: string, propertyType?: 'house' | 'apartment' | 'townhouse') => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await marketInsightsAction({
          suburb,
          propertyType,
        });
        return result.insights;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get market insights');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [marketInsightsAction]
  );

  return {
    isLoading,
    error,
    getInsights,
  };
}
