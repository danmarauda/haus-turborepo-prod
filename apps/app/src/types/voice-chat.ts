import type { TextPart, ToolCallPart } from "ai";

export type OpenAIVoice =
  | "alloy"
  | "ballad"
  | "sage"
  | "shimmer"
  | "verse"
  | "echo"
  | "coral"
  | "ash";

export interface OpenAIRealtimeSession {
  id: string;
  object: "realtime.session";
  model: string;
  expires_at: number;
  client_secret: {
    value: string;
  };
}

export type OpenAIRealtimeServerEvent =
  | { type: "input_audio_buffer.speech_started"; item_id: string }
  | { type: "input_audio_buffer.speech_stopped"; item_id: string }
  | { type: "input_audio_buffer.committed"; item_id: string }
  | {
      type: "conversation.item.input_audio_transcription.completed";
      item_id: string;
      transcript: string;
    }
  | { type: "response.audio_transcript.delta"; item_id: string; delta: string }
  | { type: "response.audio_transcript.done"; item_id: string }
  | { type: "output_audio_buffer.stopped" }
  | {
      type: "response.function_call_arguments.done";
      item_id: string;
      call_id: string;
      name: string;
      arguments: string;
    }
  | { type: "error"; error: { message: string } };

export interface UIMessageWithCompleted {
  id: string;
  role: "user" | "assistant";
  parts: (TextPart | ToolCallPart)[];
  completed: boolean;
}

export interface VoiceTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface VoiceChatOptions {
  model?: string;
  voice?: OpenAIVoice;
  tools?: VoiceTool[];
}

export interface VoiceChatSession {
  isActive: boolean;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  error: Error | null;
  messages: UIMessageWithCompleted[];
  start: () => Promise<void>;
  stop: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
}
