"use client";

import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TranscriptEntry, VoiceMessage, VoiceSystemProps } from "./types";
import { VoiceWaveform } from "./voice-waveform";

export function ElevenLabsVoiceSystem({
  variant = "orb",
  position = "bottom-right",
  className,
  config,
  onMessage,
  onTranscript,
  onToolCall,
  onError,
}: VoiceSystemProps) {
  // State
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSignedUrl, setIsLoadingSignedUrl] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
      setError(null);
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
      setVolumeLevel(0);
    },
    onError: (err: Error | string) => {
      const errorMessage = typeof err === "string" ? err : err.message;
      console.error("[ElevenLabs] Error:", errorMessage);
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    },
    onMessage: (message) => {
      // Handle user messages
      if (message.source === "user" && message.message) {
        const userMessage: VoiceMessage = {
          id: Date.now().toString(),
          content: message.message,
          role: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        onMessage?.(userMessage);

        // Add to transcript
        if (config?.enableTranscription) {
          const entry: TranscriptEntry = {
            id: Date.now().toString(),
            text: message.message,
            speaker: "user",
            timestamp: new Date(),
            isFinal: true,
          };
          setTranscript((prev) => [...prev, entry]);
          onTranscript?.(entry);
        }
      }

      // Handle AI messages
      if (message.source === "ai" && message.message) {
        const aiMessage: VoiceMessage = {
          id: Date.now().toString(),
          content: message.message,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        onMessage?.(aiMessage);

        // Add to transcript
        if (config?.enableTranscription) {
          const entry: TranscriptEntry = {
            id: Date.now().toString(),
            text: message.message,
            speaker: "agent",
            timestamp: new Date(),
            isFinal: true,
          };
          setTranscript((prev) => [...prev, entry]);
          onTranscript?.(entry);
        }
      }
    },
  });

  // Voice state
  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;
  const status = conversation.status;

  // Update volume level
  useEffect(() => {
    if (status !== "connected") {
      setVolumeLevel(0);
      return;
    }

    const updateVolume = () => {
      try {
        const frequencyData = conversation.getOutputByteFrequencyData?.();
        if (frequencyData && frequencyData.length > 0) {
          const sum = frequencyData.reduce((a: number, b: number) => a + b, 0);
          const average = sum / frequencyData.length;
          setVolumeLevel(average / 255);
        }
      } catch {
        // Method not available
      }
    };

    const intervalId = setInterval(updateVolume, 50);
    return () => clearInterval(intervalId);
  }, [status, conversation]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start voice session
  const startVoiceSession = useCallback(async () => {
    try {
      setIsLoadingSignedUrl(true);
      setError(null);

      const response = await fetch("/api/elevenlabs/signed-url");
      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }

      const data = await response.json();
      if (!data.signedUrl) {
        throw new Error("No signed URL received");
      }

      await conversation.startSession({
        signedUrl: data.signedUrl,
      });

      if (variant !== "orb") {
        setIsExpanded(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start voice session";
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoadingSignedUrl(false);
    }
  }, [conversation, variant, onError]);

  // Stop voice session
  const stopVoiceSession = useCallback(async () => {
    try {
      await conversation.endSession();
      setIsExpanded(false);
    } catch (err) {
      console.error("Failed to stop session:", err);
    }
  }, [conversation]);

  // Toggle voice
  const toggleVoice = async () => {
    if (isConnected) {
      await stopVoiceSession();
    } else {
      await startVoiceSession();
    }
  };

  // Send text message
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onMessage?.(userMessage);

    // TODO: Send to ElevenLabs via text endpoint
    // For now, clear input
    setInput("");
  }, [input, onMessage]);

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case "orb":
        return renderOrbVariant();
      case "sheet":
        return renderSheetVariant();
      case "fullscreen":
        return renderFullscreenVariant();
      default:
        return renderOrbVariant();
    }
  };

  // Orb variant (floating button)
  const renderOrbVariant = () => {
    const positionClasses = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    };

    return (
      <div className={cn("fixed z-50", positionClasses[position], className)}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-4 w-80 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl"
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
            >
              {renderMessages()}
              {renderInput()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orb Button */}
        <motion.button
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all",
            isConnected
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : "bg-gradient-to-br from-zinc-800 to-zinc-900",
            isLoadingSignedUrl && "cursor-not-allowed opacity-50"
          )}
          disabled={isLoadingSignedUrl}
          onClick={toggleVoice}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoadingSignedUrl ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : isConnected ? (
            <div className="h-8 w-8 text-white">
              <VoiceWaveform
                bars={4}
                className="h-full"
                isActive={isConnected}
                volumeLevel={volumeLevel}
              />
            </div>
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}

          {/* Pulse animation when active */}
          {isConnected && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              className="absolute inset-0 rounded-full bg-emerald-500"
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>

        {/* Error indicator */}
        {error && (
          <motion.div
            animate={{ opacity: 1 }}
            className="-top-12 -translate-x-1/2 absolute left-1/2 whitespace-nowrap rounded-lg bg-red-500/90 px-3 py-1 text-white text-xs backdrop-blur"
            initial={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </div>
    );
  };

  // Sheet variant (modal)
  const renderSheetVariant = () => {
    return (
      <div className={cn("h-full w-full", className)}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-white/10 border-b p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isConnected
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : "bg-zinc-800"
                )}
              >
                {isLoadingSignedUrl ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : isConnected ? (
                  <div className="h-6 w-6 text-white">
                    <VoiceWaveform
                      bars={4}
                      className="h-full"
                      isActive={isConnected}
                      volumeLevel={volumeLevel}
                    />
                  </div>
                ) : (
                  <MicOff className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">HAUS Voice Assistant</h3>
                <p className="text-muted-foreground text-xs">
                  {status === "connected"
                    ? "Listening..."
                    : status === "connecting"
                      ? "Connecting..."
                      : "Ready to help"}
                </p>
              </div>
            </div>
            <Button
              disabled={isLoadingSignedUrl}
              onClick={toggleVoice}
              size="icon"
              variant="ghost"
            >
              {isConnected ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1">{renderMessages()}</div>

          {/* Input */}
          <div className="border-white/10 border-t p-4">{renderInput()}</div>

          {/* Error */}
          {error && (
            <div className="border-red-500/20 border-t bg-red-500/10 p-3 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fullscreen variant
  const renderFullscreenVariant = () => {
    return (
      <div
        className={cn(
          "flex h-screen w-screen flex-col bg-black text-white",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-white/10 border-b p-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isConnected
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : "bg-zinc-800"
              )}
            >
              {isLoadingSignedUrl ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isConnected ? (
                <div className="h-8 w-8">
                  <VoiceWaveform
                    bars={5}
                    className="h-full"
                    isActive={isConnected}
                    volumeLevel={volumeLevel}
                  />
                </div>
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-xl">HAUS Voice Assistant</h1>
              <p className="text-muted-foreground text-sm">
                {status === "connected"
                  ? "Listening to your property needs..."
                  : status === "connecting"
                    ? "Connecting to voice assistant..."
                    : "Ready to help you find properties"}
              </p>
            </div>
          </div>
          <Button
            disabled={isLoadingSignedUrl}
            onClick={toggleVoice}
            size="lg"
            variant="outline"
          >
            {isConnected ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Voice
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Voice
              </>
            )}
          </Button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Messages - 2/3 */}
          <div className="flex-[2] border-white/10 border-r">
            {renderMessages()}
          </div>

          {/* Transcript - 1/3 */}
          {config?.enableTranscription && (
            <div className="flex-1 p-6">
              <h3 className="mb-4 font-semibold text-lg">Live Transcript</h3>
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {transcript.map((entry) => (
                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        entry.speaker === "user"
                          ? "bg-blue-500/10 text-blue-100"
                          : "bg-emerald-500/10 text-emerald-100"
                      )}
                      key={entry.id}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
                        <span>
                          {entry.speaker === "user" ? "You" : "Assistant"}
                        </span>
                        <span>•</span>
                        <span>{entry.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p>{entry.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-white/10 border-t p-6">{renderInput()}</div>

        {/* Error */}
        {error && (
          <div className="border-red-500/20 border-t bg-red-500/10 p-4 text-center text-red-500">
            {error}
          </div>
        )}
      </div>
    );
  };

  // Shared: Messages component
  const renderMessages = () => (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            key={message.id}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-white"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <span className="mt-1 block text-[10px] opacity-50">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );

  // Shared: Input component
  const renderInput = () => (
    <div className="flex gap-2">
      <Input
        className="flex-1 border-white/10 bg-white/5"
        disabled={!isConnected}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Type a message or use voice..."
        ref={inputRef}
        value={input}
      />
      <Button
        disabled={!(input.trim() && isConnected)}
        onClick={sendMessage}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );

  return renderContent();
}
