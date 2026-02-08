/**
 * HAUS Voice System Types
 * ElevenLabs Conversational AI + Scribe V2
 */

export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type MessageRole = "user" | "assistant" | "system";

export type VoiceMessage = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  isStreaming?: boolean;
};

export type TranscriptEntry = {
  id: string;
  text: string;
  speaker: "user" | "agent";
  timestamp: Date;
  confidence?: number;
  isFinal: boolean;
};

export type VoiceVariant = "orb" | "sheet" | "fullscreen";

export type VoicePosition =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left";

export type PropertySearchParams = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: "house" | "apartment" | "townhouse" | "land";
  features?: string[];
};

export type VoiceTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: unknown) => Promise<unknown>;
};

export type VoiceConfig = {
  agentId: string;
  enableTranscription?: boolean;
  enableTools?: boolean;
  autoStart?: boolean;
  customTools?: VoiceTool[];
};

export type VoiceSystemProps = {
  variant?: VoiceVariant;
  position?: VoicePosition;
  className?: string;
  config?: Partial<VoiceConfig>;
  onMessage?: (message: VoiceMessage) => void;
  onTranscript?: (entry: TranscriptEntry) => void;
  onToolCall?: (toolName: string, params: unknown, result: unknown) => void;
  onError?: (error: Error) => void;
};
