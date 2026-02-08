"use client";

import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  bars?: number;
  isActive?: boolean;
  volumeLevel?: number;
  className?: string;
}

export function VoiceWaveform({
  bars = 5,
  isActive = false,
  volumeLevel = 0,
  className,
}: VoiceWaveformProps) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5 h-full", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            isActive ? "bg-current animate-pulse" : "bg-current/30"
          )}
          style={{
            height: isActive
              ? `${Math.max(20, Math.min(100, (volumeLevel || 0.3) * 100 * (0.5 + Math.sin(Date.now() / 200 + i) * 0.5)))}%`
              : "30%",
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
