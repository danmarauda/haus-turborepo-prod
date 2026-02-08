"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { SearchParameters } from "@/types/property";

export type VoiceMode =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";
export type VoiceProvider = "elevenlabs" | "browser" | "none";

type VoiceSearchResult = {
  parameters: SearchParameters;
  confidence: number;
  transcript?: string;
};

type VoiceCopilotContextValue = {
  // State
  mode: VoiceMode;
  provider: VoiceProvider;
  transcript: string;
  lastResult: VoiceSearchResult | null;
  error: string | null;
  volumeLevel: number;
  frequencyData: Uint8Array;

  // Actions
  setMode: (mode: VoiceMode) => void;
  setProvider: (provider: VoiceProvider) => void;
  setTranscript: (transcript: string) => void;
  setLastResult: (result: VoiceSearchResult | null) => void;
  setError: (error: string | null) => void;
  setVolumeLevel: (level: number) => void;
  setFrequencyData: (data: Uint8Array) => void;

  // Bridge functions
  onVoiceResult: (result: VoiceSearchResult) => void;
  onVoiceError: (error: string) => void;
  clearState: () => void;
};

const VoiceCopilotContext = createContext<VoiceCopilotContextValue | null>(
  null
);

export function VoiceCopilotProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VoiceMode>("idle");
  const [provider, setProvider] = useState<VoiceProvider>("none");
  const [transcript, setTranscript] = useState("");
  const [lastResult, setLastResult] = useState<VoiceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(
    new Uint8Array(128)
  );

  const onVoiceResult = useCallback((result: VoiceSearchResult) => {
    setLastResult(result);
    setMode("idle");
    setError(null);

    // Dispatch global event for other components to listen
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("voice-search-result", { detail: result })
      );
    }
  }, []);

  const onVoiceError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setMode("error");
  }, []);

  const clearState = useCallback(() => {
    setMode("idle");
    setTranscript("");
    setLastResult(null);
    setError(null);
    setVolumeLevel(0);
    setFrequencyData(new Uint8Array(128));
  }, []);

  return (
    <VoiceCopilotContext.Provider
      value={{
        mode,
        provider,
        transcript,
        lastResult,
        error,
        volumeLevel,
        frequencyData,
        setMode,
        setProvider,
        setTranscript,
        setLastResult,
        setError,
        setVolumeLevel,
        setFrequencyData,
        onVoiceResult,
        onVoiceError,
        clearState,
      }}
    >
      {children}
    </VoiceCopilotContext.Provider>
  );
}

export function useVoiceCopilot() {
  const context = useContext(VoiceCopilotContext);
  if (!context) {
    throw new Error(
      "useVoiceCopilot must be used within a VoiceCopilotProvider"
    );
  }
  return context;
}
