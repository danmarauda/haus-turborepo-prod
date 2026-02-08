"use client";

import * as React from "react";
import { cn } from "../../utils";

interface VoiceOrbBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  isListening?: boolean;
  isProcessing?: boolean;
  audioLevel?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function VoiceOrbBase({
  isListening = false,
  isProcessing = false,
  audioLevel = 0,
  size = "md",
  className,
  ...props
}: VoiceOrbBaseProps) {
  const [pulseIntensity, setPulseIntensity] = React.useState(0);
  const [waveformBars, setWaveformBars] = React.useState<number[]>(Array(8).fill(0));
  const animationRef = React.useRef<number>();

  React.useEffect(() => {
    if (isListening) {
      const updateAnimation = () => {
        const basePulse = Math.random() * 0.6 + 0.2;
        const audioPulse = audioLevel * 0.8;
        setPulseIntensity(Math.max(basePulse, audioPulse));

        setWaveformBars((prev) =>
          prev.map(() => Math.random() * (0.5 + audioLevel * 0.5) + 0.1)
        );

        animationRef.current = requestAnimationFrame(updateAnimation);
      };
      updateAnimation();
    } else {
      setPulseIntensity(0);
      setWaveformBars(Array(8).fill(0));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, audioLevel]);

  const sizes = {
    sm: { orb: "w-12 h-12", icon: "w-5 h-5" },
    md: { orb: "w-16 h-16", icon: "w-6 h-6" },
    lg: { orb: "w-20 h-20", icon: "w-8 h-8" },
    xl: { orb: "w-24 h-24", icon: "w-10 h-10" },
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      {/* Outer pulse ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isListening && "bg-[#D4AF37]/15"
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.8})`,
          opacity: isListening ? pulseIntensity * 0.8 : 0,
          filter: `blur(${pulseIntensity * 2}px)`,
        }}
      />

      {/* Middle pulse ring */}
      <div
        className={cn(
          "absolute inset-1 rounded-full transition-all duration-200",
          isListening && "bg-[#D4AF37]/25"
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.6})`,
          opacity: isListening ? pulseIntensity * 0.9 : 0,
        }}
      />

      {/* Inner ring */}
      <div
        className={cn(
          "absolute inset-2 rounded-full transition-all duration-200",
          isListening ? "bg-[#D4AF37]/40" : "bg-[#D4AF37]/10"
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.4})`,
        }}
      />

      {/* Waveform bars */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className="absolute bg-[#D4AF37]/60 rounded-full"
              style={{
                width: "2px",
                height: `${height * 20 + 4}px`,
                transform: `rotate(${index * 45}deg) translateY(-${32 + height * 8}px)`,
                transition: "height 0.1s ease-out",
              }}
            />
          ))}
        </div>
      )}

      {/* Core orb */}
      <div
        className={cn(
          "relative rounded-full transition-all duration-300 flex items-center justify-center",
          sizes[size].orb,
          isListening
            ? "bg-[#D4AF37] shadow-2xl shadow-[#D4AF37]/60"
            : "bg-[#D4AF37]/80 hover:bg-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/30",
          isProcessing && "animate-pulse"
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.1})`,
          boxShadow: isListening
            ? `0 0 ${20 + pulseIntensity * 20}px rgba(212, 175, 55, ${0.4 + pulseIntensity * 0.3})`
            : undefined,
        }}
      >
        {/* Microphone icon */}
        <svg
          className={cn(
            "transition-all duration-200 text-black",
            sizes[size].icon
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{
            transform: `scale(${1 + pulseIntensity * 0.05})`,
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>

        {/* Processing spinner */}
        {isProcessing && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-black/20 border-t-black animate-spin" />
            <div
              className="absolute inset-1 rounded-full border border-black/30 border-r-black animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            />
          </>
        )}

        {/* Inner glow */}
        {isListening && (
          <div
            className="absolute inset-2 rounded-full bg-white/10"
            style={{
              opacity: pulseIntensity * 0.5,
              transform: `scale(${0.8 + pulseIntensity * 0.2})`,
            }}
          />
        )}
      </div>

      {/* Status dots */}
      <div className="absolute -bottom-3 flex gap-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            isListening ? "bg-[#D4AF37] animate-pulse" : "bg-white/30"
          )}
        />
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300 delay-100",
            isProcessing ? "bg-[#D4AF37] animate-pulse" : "bg-white/30"
          )}
        />
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300 delay-200",
            isListening || isProcessing ? "bg-[#D4AF37]/50" : "bg-white/30"
          )}
        />
      </div>
    </div>
  );
}
