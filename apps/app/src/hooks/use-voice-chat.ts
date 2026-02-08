"use client";

/**
 * Unified Voice Chat Hook
 *
 * Provides a single interface for multiple voice providers:
 * - LiveKit: Real-time voice agent with LiveKit
 * - ElevenLabs: Conversational AI with ElevenLabs
 * - OpenAI: Realtime API with WebRTC
 * - Browser: Web Speech API (fallback)
 *
 * @example
 * ```tsx
 * const voice = useVoiceChat({
 *   provider: 'elevenlabs',
 *   onTranscript: (text) => console.log(text),
 *   onResponse: (text) => console.log(text),
 * });
 *
 * // Start voice session
 * await voice.connect();
 *
 * // Stop voice session
 * voice.disconnect();
 * ```
 */

import { useCallback, useState } from "react";
import { useElevenLabsTTS } from "./use-elevenlabs-tts";
import { useLiveKitAgent } from "./use-livekit-agent";
import { useOpenAIVoiceChat } from "./use-openai-voice-chat";
import { useVoiceNavigation } from "./use-voice-navigation";

export type VoiceProvider = "livekit" | "elevenlabs" | "openai" | "browser";

export interface UseVoiceChatOptions {
  provider: VoiceProvider;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  enableNavigation?: boolean;
}

export interface UseVoiceChatReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error: Error | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (text: string) => Promise<void>;

  // Navigation
  hasNavigationCommand: (text: string) => boolean;
  navigate: (command: string) => Promise<{
    success: boolean;
    route?: string;
    error?: string;
  }>;

  // Messages
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

export function useVoiceChat(options: UseVoiceChatOptions): UseVoiceChatReturn {
  const { provider, onTranscript, onResponse, onError, enableNavigation = true } = options;
  const [isProcessing, setIsProcessing] = useState(false);

  // Provider-specific hooks
  const liveKit = useLiveKitAgent({
    onTranscript: (text, isFinal) => {
      onTranscript?.(text, isFinal);
      if (isFinal && enableNavigation) {
        handleVoiceInput(text);
      }
    },
    onAgentMessage: (message) => {
      onResponse?.(message);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const openAI = useOpenAIVoiceChat({
    model: "gpt-4o-realtime-preview",
    voice: "ash",
  });

  const elevenLabsTTS = useElevenLabsTTS();
  const voiceNav = useVoiceNavigation();

  // Handle voice input with navigation support
  const handleVoiceInput = useCallback(
    async (text: string) => {
      if (!enableNavigation) return;

      setIsProcessing(true);
      try {
        if (voiceNav.hasNavigationCommand(text)) {
          const result = await voiceNav.navigate(text);
          if (result.success) {
            const response = `Navigating to ${result.route?.replace("/", " ")}`;
            elevenLabsTTS.speak(response);
            onResponse?.(response);
          }
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [enableNavigation, voiceNav, elevenLabsTTS, onResponse]
  );

  // Connect to voice provider
  const connect = useCallback(async () => {
    try {
      switch (provider) {
        case "livekit":
          await liveKit.connect();
          break;
        case "openai":
          await openAI.start();
          break;
        case "elevenlabs":
          // ElevenLabs uses useConversation hook directly in component
          break;
        case "browser":
          // Browser speech recognition not implemented yet
          break;
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [provider, liveKit, openAI, onError]);

  // Disconnect from voice provider
  const disconnect = useCallback(() => {
    switch (provider) {
      case "livekit":
        liveKit.disconnect();
        break;
      case "openai":
        openAI.stop();
        break;
      case "elevenlabs":
        // Handled by ElevenLabsVoiceSystem component
        break;
      case "browser":
        // Browser speech recognition not implemented yet
        break;
    }
  }, [provider, liveKit, openAI]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      switch (provider) {
        case "livekit":
          await liveKit.sendMessage(text);
          break;
        case "openai":
          // OpenAI Realtime handles this differently
          break;
        case "elevenlabs":
          // Handled by ElevenLabsVoiceSystem component
          break;
        case "browser":
          // Browser speech recognition not implemented yet
          break;
      }
    },
    [provider, liveKit]
  );

  // Get connection state based on provider
  const getConnectionState = () => {
    switch (provider) {
      case "livekit":
        return {
          isConnected: liveKit.isConnected,
          isConnecting: liveKit.isConnecting,
          isListening: liveKit.isConnected,
          isSpeaking: false,
          error: liveKit.error ? new Error(liveKit.error) : null,
          messages: liveKit.messages.map((m) => ({
            id: crypto.randomUUID(),
            role: m.from?.isLocal ? "user" : "assistant",
            content: m.message,
          })),
        };
      case "openai":
        return {
          isConnected: openAI.isActive,
          isConnecting: openAI.isLoading,
          isListening: openAI.isListening,
          isSpeaking: openAI.isAssistantSpeaking,
          error: openAI.error,
          messages: openAI.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.parts.map((p) => ("text" in p ? p.text : "")).join(""),
          })),
        };
      case "elevenlabs":
      case "browser":
      default:
        return {
          isConnected: false,
          isConnecting: false,
          isListening: false,
          isSpeaking: false,
          error: null,
          messages: [],
        };
    }
  };

  const state = getConnectionState();

  return {
    ...state,
    isProcessing,
    connect,
    disconnect,
    sendMessage,
    hasNavigationCommand: voiceNav.hasNavigationCommand,
    navigate: voiceNav.navigate,
  };
}
