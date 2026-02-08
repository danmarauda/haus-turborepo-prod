/**
 * ChatContainer - Main AI chat container component
 *
 * Features:
 * - Message list with scroll
 * - Input field with send button
 * - Integration with existing ChatInterface component
 * - Cortex memory context display
 * - Suggestion chips
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Send, Mic, X, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatInterface, type ExtendedMessage } from '../chat/chat-interface';
import { WelcomeMessage } from '../chat/welcome-message';
import { useAIChat, type ChatMessage } from '../../hooks/useAIChat';
import { cn } from '../../lib/utils';

// =============================================================================
// Types
// =============================================================================

interface ChatContainerProps {
  /** Optional property ID for property-specific chat */
  propertyId?: string;
  /** Custom system prompt */
  systemPrompt?: string;
  /** User ID for personalization */
  userId?: string;
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Suggestions to show in welcome screen */
  suggestions?: string[];
  /** Enable memory features */
  enableMemory?: boolean;
  /** Enable tool calling */
  enableTools?: boolean;
  /** Callback when user wants to switch to voice */
  onSwitchToVoice?: () => void;
  /** Callback when a property is selected from chat */
  onPropertySelect?: (propertyId: string) => void;
  /** Additional class names for the container */
  className?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Convert internal ChatMessage to ExtendedMessage for ChatInterface */
const convertToExtendedMessage = (message: ChatMessage): ExtendedMessage => {
  return {
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    content: message.content,
    createdAt: new Date(message.timestamp),
    parts: message.parts,
    metadata: message.metadata,
    toolInvocations: message.metadata?.toolCalls,
  };
};

// =============================================================================
// Components
// =============================================================================

export function ChatContainer({
  propertyId,
  systemPrompt,
  userId,
  initialMessages = [],
  suggestions,
  enableMemory = true,
  enableTools = true,
  onSwitchToVoice,
  onPropertySelect,
  className,
}: ChatContainerProps) {
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Local state
  const [inputText, setInputText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  // AI Chat hook
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isStreaming,
    streamingContent,
    stopGeneration,
  } = useAIChat({
    propertyId,
    systemPrompt,
    userId,
    enableMemory,
    enableTools,
  });

  // Convert messages for ChatInterface
  const extendedMessages = React.useMemo(() => {
    const converted = messages.map(convertToExtendedMessage);
    
    // If streaming, add a temporary message
    if (isStreaming && streamingContent) {
      converted.push({
        id: 'streaming',
        role: 'assistant',
        content: streamingContent,
        createdAt: new Date(),
      });
    }
    
    return converted;
  }, [messages, isStreaming, streamingContent]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, isLoading, sendMessage]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setInputText(suggestion);
    // Auto-send suggestion
    setTimeout(() => {
      sendMessage(suggestion);
    }, 100);
  }, [sendMessage]);

  // Handle scroll
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollButton(distanceFromBottom > 100);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Handle voice switch
  const handleVoiceSwitch = useCallback(() => {
    onSwitchToVoice?.();
  }, [onSwitchToVoice]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={cn('flex-1 bg-background', className)}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView className="flex-1" edges={['bottom']}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <View className="flex-row items-center gap-2">
            <View className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles size={16} className="text-primary" />
            </View>
            <View>
              <Text className="font-semibold text-foreground">HAUS AI</Text>
              {propertyId && (
                <Text className="text-xs text-muted-foreground">
                  Property: {propertyId.slice(0, 8)}...
                </Text>
              )}
            </View>
          </View>
          
          <View className="flex-row gap-2">
            {messages.length > 0 && (
              <TouchableOpacity
                onPress={clearMessages}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
              >
                <X size={16} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
            {onSwitchToVoice && (
              <TouchableOpacity
                onPress={handleVoiceSwitch}
                className="flex h-8 items-center justify-center rounded-full bg-primary px-3"
              >
                <Mic size={16} className="text-primary-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat Messages */}
        <View className="flex-1">
          {messages.length === 0 ? (
            <WelcomeMessage
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionSelect}
            />
          ) : (
            <ChatInterface
              messages={extendedMessages}
              scrollViewRef={scrollViewRef}
              isLoading={isLoading && !isStreaming}
              ref={scrollViewRef}
            />
          )}
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <TouchableOpacity
              onPress={scrollToBottom}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg"
            >
              <Text className="text-lg text-primary-foreground">↓</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error banner */}
        {error && (
          <View className="mx-4 mb-2 rounded-lg bg-destructive/10 p-3">
            <Text className="text-sm text-destructive">
              {error.message}
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View className="border-t border-border bg-background px-4 py-3">
          <View className="flex-row items-end gap-2">
            <View className="flex-1 flex-row items-center rounded-2xl bg-muted px-4 py-2">
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about properties..."
                placeholderTextColor="#888"
                multiline
                maxLength={2000}
                className="max-h-32 flex-1 text-foreground"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                returnKeyType="send"
              />
              {isStreaming && (
                <TouchableOpacity
                  onPress={stopGeneration}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive"
                >
                  <Text className="text-xs text-destructive-foreground">■</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                inputText.trim() && !isLoading
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
            >
              {isLoading && !isStreaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send
                  size={20}
                  className={inputText.trim() && !isLoading ? 'text-primary-foreground' : 'text-muted-foreground'}
                />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Memory indicator */}
          {enableMemory && messages.length > 0 && (
            <View className="mt-2 flex-row items-center justify-center gap-1">
              <Sparkles size={12} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                Memory enabled - HAUS learns from your conversations
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// Compact Chat Variant for Embedding in Other Screens
// =============================================================================

interface CompactChatProps {
  propertyId?: string;
  userId?: string;
  placeholder?: string;
  onClose?: () => void;
  maxHeight?: number;
}

export function CompactChat({
  propertyId,
  userId,
  placeholder = 'Ask a question...',
  onClose,
  maxHeight = 400,
}: CompactChatProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  
  const {
    messages,
    isLoading,
    sendMessage,
    isStreaming,
    streamingContent,
  } = useAIChat({
    propertyId,
    userId,
    enableMemory: true,
    enableTools: false,
  });

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  const extendedMessages = React.useMemo(() => {
    const converted = messages.map(convertToExtendedMessage);
    
    if (isStreaming && streamingContent) {
      converted.push({
        id: 'streaming',
        role: 'assistant',
        content: streamingContent,
        createdAt: new Date(),
      });
    }
    
    return converted;
  }, [messages, isStreaming, streamingContent]);

  return (
    <View className="rounded-2xl bg-background shadow-lg" style={{ maxHeight }}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="font-semibold text-foreground">Ask HAUS</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <X size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <View className="flex-1">
        {messages.length === 0 ? (
          <View className="items-center justify-center p-8">
            <Text className="text-center text-muted-foreground">
              Ask me anything about this property or the market
            </Text>
          </View>
        ) : (
          <ChatInterface
            messages={extendedMessages}
            scrollViewRef={scrollViewRef}
            isLoading={isLoading && !isStreaming}
            ref={scrollViewRef}
          />
        )}
      </View>

      {/* Input */}
      <View className="border-t border-border p-3">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            placeholderTextColor="#888"
            className="flex-1 rounded-xl bg-muted px-3 py-2 text-foreground"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              inputText.trim() && !isLoading ? 'bg-primary' : 'bg-muted'
            )}
          >
            {isLoading && !isStreaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={16} className="text-primary-foreground" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
