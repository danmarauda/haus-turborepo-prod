"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { useCallback, useEffect, useState } from "react";
import { useElevenLabsTTS } from "@/hooks/use-elevenlabs-tts";
import { useLiveKitAgent } from "@/hooks/use-livekit-agent";
import { useVoiceNavigation } from "@/hooks/use-voice-navigation";

/**
 * Unified Voice + CopilotKit Integration Hook
 *
 * Combines LiveKit voice input with CopilotKit AI chat for a seamless
 * voice-first agent experience. Handles:
 * - Voice input transcription (LiveKit)
 * - Navigation commands (enhanced voice nav)
 * - AI chat with tools (CopilotKit)
 * - Voice response (ElevenLabs TTS)
 *
 * @example
 * ```tsx
 * function VoiceAgent() {
 *   const { connect, isConnected, messages } = useVoiceCopilotIntegration();
 *
 *   return (
 *     <div>
 *       <button onClick={connect}>
 *         {isConnected ? "Disconnect" : "Connect"}
 *       </button>
 *       <MessageList messages={messages} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useVoiceCopilotIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  // CopilotKit integration
  const { appendMessage, messages } = useCopilotChat();

  // ElevenLabs TTS for voice responses
  const { speak, isSpeaking, stop: stopSpeaking } = useElevenLabsTTS();

  // Voice navigation for simple commands
  const { hasNavigationCommand, navigate } = useVoiceNavigation();

  /**
   * Process voice input with priority system:
   * 1. Navigation commands → Direct navigation
   * 2. Property queries → CopilotKit with tools
   * 3. General chat → CopilotKit conversation
   */
  const handleVoiceInput = useCallback(
    async (text: string) => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);

      try {
        // Priority 1: Check for navigation commands
        if (hasNavigationCommand(text)) {
          const result = await navigate(text);

          if (result.success) {
            const response = `Navigating to ${result.route?.replace("/", " ")}`;
            speak(response);
            setLastResponse(response);
          } else {
            const response =
              result.suggestions && result.suggestions.length > 0
                ? `Did you mean ${result.suggestions[0]}?`
                : "I didn't understand that navigation command.";
            speak(response);
            setLastResponse(response);
          }

          setIsProcessing(false);
          return;
        }

        // Priority 2: Send to CopilotKit for AI processing
        // This will trigger any registered CopilotKit actions
        // (e.g., searchProperties, displayProperty, saveProperty)
        const response = await appendMessage({
          role: "user",
          content: text,
        });

        // Priority 3: Speak the AI response
        if (response?.content) {
          speak(response.content);
          setLastResponse(response.content);
        }
      } catch (error) {
        console.error("Error processing voice input:", error);
        const errorMessage = "Sorry, I encountered an error. Please try again.";
        speak(errorMessage);
        setLastResponse(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, hasNavigationCommand, navigate, speak, appendMessage]
  );

  // LiveKit agent integration
  const {
    room,
    isConnected,
    isConnecting,
    agentState,
    messages: liveKitMessages,
    error: connectionError,
    connect: liveKitConnect,
    disconnect: liveKitDisconnect,
    sendMessage,
  } = useLiveKitAgent({
    onAgentMessage: (message) => {
      // AI agent messages are handled by CopilotKit
      // This is for any direct agent responses
      speak(message);
    },
    onTranscript: async (text, isFinal) => {
      if (isFinal && text.trim()) {
        // Process final transcription
        await handleVoiceInput(text);
      }
    },
  });

  /**
   * Connect to LiveKit room
   */
  const connect = useCallback(async () => {
    await liveKitConnect();
  }, [liveKitConnect]);

  /**
   * Disconnect from LiveKit room
   */
  const disconnect = useCallback(() => {
    liveKitDisconnect();
    stopSpeaking();
  }, [liveKitDisconnect, stopSpeaking]);

  /**
   * Send a text message (alternative to voice)
   */
  const sendTextMessage = useCallback(
    async (text: string) => {
      await handleVoiceInput(text);
    },
    [handleVoiceInput]
  );

  /**
   * Stop all voice output
   */
  const stopVoice = useCallback(() => {
    stopSpeaking();
  }, [stopSpeaking]);

  // Auto-stop speaking when disconnecting
  useEffect(() => {
    if (!isConnected && isSpeaking) {
      stopSpeaking();
    }
  }, [isConnected, isSpeaking, stopSpeaking]);

  return {
    // LiveKit state
    room,
    isConnected,
    isConnecting,
    agentState,
    connectionError,

    // Voice state
    isSpeaking,
    isProcessing,
    lastResponse,

    // Messages (unified from CopilotKit + LiveKit)
    messages: [
      ...messages,
      ...liveKitMessages.map((msg) => ({
        id: `lk-${msg.timestamp}`,
        role: msg.role as "user" | "assistant",
        content: msg.text,
      })),
    ],

    // Actions
    connect,
    disconnect,
    sendTextMessage,
    sendMessage,
    stopVoice,
  };
}
