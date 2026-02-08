"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface VoiceOrbProps {
  isListening: boolean
  isProcessing: boolean
  audioLevel?: number
  className?: string
}

export function VoiceOrb({ isListening, isProcessing, audioLevel = 0, className }: VoiceOrbProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0)
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(8).fill(0))
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (isListening) {
      const updateAnimation = () => {
        const basePulse = Math.random() * 0.6 + 0.2
        const audioPulse = audioLevel * 0.8
        setPulseIntensity(Math.max(basePulse, audioPulse))

        setWaveformBars((prev) => prev.map(() => Math.random() * (0.5 + audioLevel * 0.5) + 0.1))

        animationRef.current = requestAnimationFrame(updateAnimation)
      }
      updateAnimation()
    } else {
      setPulseIntensity(0)
      setWaveformBars(Array(8).fill(0))
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening, audioLevel])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn("absolute inset-0 rounded-full transition-all duration-300", isListening && "bg-primary/15")}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.8})`,
          opacity: isListening ? pulseIntensity * 0.8 : 0,
          filter: `blur(${pulseIntensity * 2}px)`,
        }}
      />

      <div
        className={cn("absolute inset-1 rounded-full transition-all duration-200", isListening && "bg-primary/25")}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.6})`,
          opacity: isListening ? pulseIntensity * 0.9 : 0,
        }}
      />

      {/* Middle ring */}
      <div
        className={cn(
          "absolute inset-2 rounded-full transition-all duration-200",
          isListening ? "bg-primary/40" : "bg-primary/10",
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.4})`,
        }}
      />

      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className="absolute bg-primary/60 rounded-full"
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
          "relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center",
          isListening
            ? "bg-primary shadow-2xl shadow-primary/60"
            : "bg-primary/80 hover:bg-primary hover:shadow-lg hover:shadow-primary/30",
          isProcessing && "animate-pulse",
        )}
        style={{
          transform: `scale(${1 + pulseIntensity * 0.1})`,
          boxShadow: isListening
            ? `0 0 ${20 + pulseIntensity * 20}px rgba(var(--primary), ${0.4 + pulseIntensity * 0.3})`
            : undefined,
        }}
      >
        <svg
          className={cn(
            "w-6 h-6 transition-all duration-200",
            isListening ? "text-primary-foreground" : "text-primary-foreground/80",
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

        {isProcessing && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground animate-spin" />
            <div
              className="absolute inset-1 rounded-full border border-primary-foreground/30 border-r-primary-foreground animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            />
          </>
        )}

        {isListening && (
          <div
            className="absolute inset-2 rounded-full bg-primary-foreground/10"
            style={{
              opacity: pulseIntensity * 0.5,
              transform: `scale(${0.8 + pulseIntensity * 0.2})`,
            }}
          />
        )}
      </div>

      <div className="absolute -bottom-2 flex gap-1">
        <div
          className={cn(
            "w-1 h-1 rounded-full transition-all duration-300",
            isListening ? "bg-primary animate-pulse" : "bg-muted-foreground/30",
          )}
        />
        <div
          className={cn(
            "w-1 h-1 rounded-full transition-all duration-300 delay-100",
            isProcessing ? "bg-primary animate-pulse" : "bg-muted-foreground/30",
          )}
        />
        <div
          className={cn(
            "w-1 h-1 rounded-full transition-all duration-300 delay-200",
            isListening || isProcessing ? "bg-primary/50" : "bg-muted-foreground/30",
          )}
        />
      </div>
    </div>
  )
}
