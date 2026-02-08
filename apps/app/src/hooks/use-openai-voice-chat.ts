"use client";

// hooks/use-openai-voice-chat.ts
// OpenAI Realtime Voice Chat hook with WebRTC and tool calling

import type { TextPart, ToolCallPart } from "ai";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { isDefaultVoiceTool } from "@/lib/ai/speech/voice-tools";
import type {
  OpenAIRealtimeServerEvent,
  OpenAIRealtimeSession,
  OpenAIVoice,
  UIMessageWithCompleted,
  VoiceChatOptions,
  VoiceChatSession,
} from "@/types/voice-chat";

// Available OpenAI voices
export const OPENAI_VOICES: Record<string, OpenAIVoice> = {
  Alloy: "alloy",
  Ballad: "ballad",
  Sage: "sage",
  Shimmer: "shimmer",
  Verse: "verse",
  Echo: "echo",
  Coral: "coral",
  Ash: "ash",
};

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Create a UI message from content
function createUIMessage(m: {
  id?: string;
  role: "user" | "assistant";
  content:
    | { type: "text"; text: string }
    | {
        type: "tool";
        name: string;
        args: unknown;
        callId: string;
        result?: unknown;
      };
  completed?: boolean;
}): UIMessageWithCompleted {
  const id = m.id ?? generateId();
  const parts: (TextPart | ToolCallPart)[] = [];

  if (m.content.type === "text") {
    parts.push({ type: "text", text: m.content.text });
  } else {
    parts.push({
      type: "tool-call",
      toolCallId: m.content.callId,
      toolName: m.content.name,
      args: m.content.args,
    });
  }

  return {
    id,
    role: m.role,
    parts,
    completed: m.completed ?? false,
  };
}

// Create empty audio track for muting
function createEmptyAudioTrack(): MediaStreamTrack {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  return destination.stream.getAudioTracks()[0];
}

export function useOpenAIVoiceChat(
  options?: VoiceChatOptions
): VoiceChatSession {
  const { model = "gpt-4o-realtime-preview", voice = "ash" } = options || {};

  // State
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<UIMessageWithCompleted[]>([]);

  // Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const tracks = useRef<RTCRtpSender[]>([]);
  // biome-ignore lint/suspicious/noEmptyBlockStatements: Initial no-op for ref
  const stopRef = useRef<() => void>(() => {});

  // Hooks
  const { setTheme } = useTheme();
  const router = useRouter();

  // Update a message by ID
  const updateUIMessage = useCallback(
    (
      id: string,
      action:
        | Partial<UIMessageWithCompleted>
        | ((m: UIMessageWithCompleted) => Partial<UIMessageWithCompleted>)
    ) => {
      setMessages((prev) => {
        const message = prev.find((m) => m.id === id);
        if (!message) {
          return prev;
        }
        const updates = typeof action === "function" ? action(message) : action;
        return prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      });
    },
    []
  );

  // Start listening (enable microphone)
  const startListening = useCallback(async () => {
    try {
      if (!audioStream.current) {
        audioStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }
      if (tracks.current.length) {
        const micTrack = audioStream.current.getAudioTracks()[0];
        for (const sender of tracks.current) {
          sender.replaceTrack(micTrack);
        }
      }
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Stop listening (mute microphone)
  const stopListening = useCallback(() => {
    try {
      if (audioStream.current) {
        for (const track of audioStream.current.getTracks()) {
          track.stop();
        }
        audioStream.current = null;
      }
      if (tracks.current.length) {
        const placeholderTrack = createEmptyAudioTrack();
        for (const sender of tracks.current) {
          sender.replaceTrack(placeholderTrack);
        }
      }
      setIsListening(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Create session via API
  const createSession =
    useCallback(async (): Promise<OpenAIRealtimeSession> => {
      const response = await fetch("/api/voice/openai-realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, voice, customTools: options?.tools }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const session = await response.json();
      if (session.error) {
        throw new Error(session.error.message || session.error);
      }
      return session;
    }, [model, voice, options?.tools]);

  // Handle tool calls from the assistant
  const handleToolCall = useCallback(
    ({
      callId,
      toolName,
      args,
      itemId,
    }: {
      callId: string;
      toolName: string;
      args: string;
      itemId: string;
    }) => {
      let toolResult: unknown = "success";
      const toolArgs = JSON.parse(args);

      // Handle default HAUS voice tools
      if (isDefaultVoiceTool(toolName)) {
        switch (toolName) {
          case "changeTheme":
            setTheme(toolArgs?.theme);
            toolResult = { success: true, theme: toolArgs?.theme };
            break;
          case "navigateTo": {
            const routes: Record<string, string> = {
              home: "/",
              search: "/search",
              explore: "/explore",
              market: "/market",
              compass: "/compass",
              "buyers-agent": "/buyers-agent",
              profile: "/profile",
              saved: "/saved",
              affordability: "/affordability",
              preapproval: "/preapproval",
            };
            const path = routes[toolArgs?.page] || "/";
            router.push(path);
            toolResult = { success: true, navigatedTo: path };
            break;
          }
          case "endConversation":
            stopRef.current();
            setError(null);
            setMessages([]);
            return; // Exit early, don't send result
          case "searchProperties":
            // TODO: Integrate with actual property search
            toolResult = {
              success: true,
              message: "Property search initiated",
              criteria: toolArgs,
            };
            break;
          case "getPropertyDetails":
            // TODO: Integrate with actual property data
            toolResult = {
              success: true,
              message: "Property details requested",
              propertyId: toolArgs?.propertyId,
            };
            break;
          case "calculateAffordability":
            // TODO: Integrate with affordability calculator
            toolResult = {
              success: true,
              message: "Affordability calculated",
              inputs: toolArgs,
            };
            break;
          case "getMarketInsights":
            // TODO: Integrate with market data
            toolResult = {
              success: true,
              message: "Market insights retrieved",
              location: toolArgs?.location,
            };
            break;
          default:
            // Unknown tool, return generic success
            toolResult = { success: true, toolName };
        }
      }

      // Update UI with tool result
      updateUIMessage(itemId, (prev) => ({
        ...prev,
        parts: prev.parts.map((p) =>
          p.type === "tool-call" && (p as ToolCallPart).toolCallId === callId
            ? { ...p, result: toolResult }
            : p
        ),
      }));

      // Send result back to OpenAI
      const resultText = JSON.stringify(toolResult).slice(0, 15_000);
      dataChannel.current?.send(
        JSON.stringify({
          type: "conversation.item.create",
          previous_item_id: itemId,
          item: {
            type: "function_call_output",
            call_id: callId,
            output: resultText,
          },
        })
      );
      dataChannel.current?.send(JSON.stringify({ type: "response.create" }));
    },
    [setTheme, router, updateUIMessage]
  );

  // Handle server events
  const handleServerEvent = useCallback(
    (event: OpenAIRealtimeServerEvent) => {
      switch (event.type) {
        case "input_audio_buffer.speech_started":
          setIsUserSpeaking(true);
          setMessages((prev) => [
            ...prev,
            createUIMessage({
              id: event.item_id,
              role: "user",
              content: { type: "text", text: "" },
            }),
          ]);
          break;
        case "input_audio_buffer.speech_stopped":
          setIsUserSpeaking(false);
          break;
        case "input_audio_buffer.committed":
          updateUIMessage(event.item_id, { completed: true });
          break;
        case "conversation.item.input_audio_transcription.completed":
          updateUIMessage(event.item_id, {
            parts: [{ type: "text", text: event.transcript || "...speaking" }],
            completed: true,
          });
          break;
        case "response.audio_transcript.delta":
          setIsAssistantSpeaking(true);
          setMessages((prev) => {
            const existing = prev.find((m) => m.id === event.item_id);
            if (existing) {
              return prev.map((m) =>
                m.id === event.item_id
                  ? {
                      ...m,
                      parts: [
                        {
                          type: "text",
                          text:
                            ((m.parts[0] as TextPart)?.text || "") +
                            event.delta,
                        },
                      ],
                    }
                  : m
              );
            }
            return [
              ...prev,
              createUIMessage({
                id: event.item_id,
                role: "assistant",
                content: { type: "text", text: event.delta },
              }),
            ];
          });
          break;
        case "response.audio_transcript.done":
          updateUIMessage(event.item_id, { completed: true });
          break;
        case "output_audio_buffer.stopped":
          setIsAssistantSpeaking(false);
          break;
        case "response.function_call_arguments.done":
          setMessages((prev) => [
            ...prev,
            createUIMessage({
              id: event.item_id,
              role: "assistant",
              content: {
                type: "tool",
                name: event.name,
                args: JSON.parse(event.arguments),
                callId: event.call_id,
              },
              completed: true,
            }),
          ]);
          handleToolCall({
            callId: event.call_id,
            toolName: event.name,
            args: event.arguments,
            itemId: event.item_id,
          });
          break;
        case "error":
          setError(new Error(event.error.message));
          break;
        default:
          // Unhandled event type, ignore
          break;
      }
    },
    [handleToolCall, updateUIMessage]
  );

  // Stop the voice session
  const stop = useCallback(() => {
    try {
      dataChannel.current?.close();
      dataChannel.current = null;
      peerConnection.current?.close();
      peerConnection.current = null;
      tracks.current = [];
      stopListening();
      setIsActive(false);
      setIsListening(false);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [stopListening]);

  // Keep stopRef updated
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  // Setup WebRTC connection
  const setupWebRTC = useCallback(
    async (sessionToken: string) => {
      const pc = new RTCPeerConnection();
      if (!audioElement.current) {
        audioElement.current = document.createElement("audio");
      }
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };
      if (!audioStream.current) {
        audioStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }
      tracks.current = [];
      for (const track of audioStream.current.getTracks()) {
        const sender = pc.addTrack(track, audioStream.current);
        if (sender) {
          tracks.current.push(sender);
        }
      }
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data) as OpenAIRealtimeServerEvent;
          handleServerEvent(event);
        } catch (err) {
          console.error("[Voice] Message parse error:", err);
        }
      });
      dc.addEventListener("open", () => {
        setIsActive(true);
        setIsListening(true);
        setIsLoading(false);
      });
      dc.addEventListener("close", () => {
        setIsActive(false);
        setIsListening(false);
        setIsLoading(false);
      });
      dc.addEventListener("error", () => {
        setError(new Error("WebRTC data channel error"));
        setIsActive(false);
        setIsListening(false);
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/sdp",
        },
      });
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
      peerConnection.current = pc;
    },
    [handleServerEvent]
  );

  // Start the voice session
  const start = useCallback(async () => {
    if (isActive || isLoading) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessages([]);
    try {
      const session = await createSession();
      const sessionToken = session.client_secret.value;
      await setupWebRTC(sessionToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsActive(false);
      setIsListening(false);
      setIsLoading(false);
    }
  }, [isActive, isLoading, createSession, setupWebRTC]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      stop();
    },
    [stop]
  );

  return {
    isActive,
    isUserSpeaking,
    isAssistantSpeaking,
    isListening,
    isLoading,
    error,
    messages,
    start,
    stop,
    startListening,
    stopListening,
  };
}
