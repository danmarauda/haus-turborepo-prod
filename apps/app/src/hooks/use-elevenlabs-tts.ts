"use client";

import { useCallback, useRef, useState } from "react";

type UseElevenLabsTTSOptions = {
  voiceId?: string;
  autoPlay?: boolean;
};

type UseElevenLabsTTSReturn = {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: Error | null;
};

export function useElevenLabsTTS(
  options: UseElevenLabsTTSOptions = {}
): UseElevenLabsTTSReturn {
  const { voiceId = "21m00Tcm4TlvDq8ikWAM", autoPlay = true } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        return;
      }

      stop();
      setError(null);
      setIsLoading(true);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/elevenlabs-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice_id: voiceId }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`TTS failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setError(new Error("Audio playback failed"));
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        setIsLoading(false);

        if (autoPlay) {
          setIsSpeaking(true);
          await audio.play();
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err : new Error("TTS failed"));
        setIsLoading(false);
      }
    },
    [voiceId, autoPlay, stop]
  );

  return { speak, stop, isSpeaking, isLoading, error };
}
