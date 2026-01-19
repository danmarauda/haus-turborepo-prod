"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { SearchParameters } from "@/types/property"

interface AIVoiceInterfaceProps {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  extractedParams: SearchParameters
  confidence: number
  className?: string
}

export function AIVoiceInterface({
  isListening,
  isProcessing,
  transcript,
  extractedParams,
  confidence,
  className,
}: AIVoiceInterfaceProps) {
  const [highlightedText, setHighlightedText] = useState("")
  const [parameterGlows, setParameterGlows] = useState<Record<string, boolean>>({})
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0))

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setWaveform((prev) => prev.map(() => Math.random() * 0.8 + 0.1))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setWaveform(Array(20).fill(0))
    }
  }, [isListening])

  useEffect(() => {
    // Simulate parameter highlighting as they're extracted
    const newGlows: Record<string, boolean> = {}
    Object.keys(extractedParams).forEach((key) => {
      newGlows[key] = true
      setTimeout(() => {
        setParameterGlows((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    })
    setParameterGlows((prev) => ({ ...prev, ...newGlows }))
  }, [extractedParams])

  const getParameterColor = (param: string) => {
    const colors = {
      location: "text-blue-400",
      propertyType: "text-green-400",
      bedrooms: "text-purple-400",
      bathrooms: "text-sky-400",
      priceRange: "text-blue-400",
      listingType: "text-pink-400",
    }
    return colors[param as keyof typeof colors] || "text-primary"
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Waveform Visualization */}
      <div className="flex items-center justify-center h-16 gap-1">
        {waveform.map((height, index) => (
          <div
            key={index}
            className={cn(
              "bg-primary/60 rounded-full transition-all duration-100 ease-out",
              isListening ? "opacity-100" : "opacity-30",
            )}
            style={{
              width: "3px",
              height: `${height * 40 + 4}px`,
              animationDelay: `${index * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Real-time Transcript with Highlighting */}
      {transcript && (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn("w-2 h-2 rounded-full", isListening ? "bg-red-500 animate-pulse" : "bg-muted-foreground")}
            />
            <span className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Processing..."}</span>
          </div>
          <p className="text-foreground leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Parameter Extraction Visualization */}
      {Object.keys(extractedParams).length > 0 && (
        <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Extracted Parameters</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">{Math.round(confidence * 100)}% confident</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(extractedParams).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md transition-all duration-500",
                  parameterGlows[key] ? "bg-primary/20 shadow-lg shadow-primary/20 scale-105" : "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    parameterGlows[key] ? "bg-primary animate-pulse" : "bg-muted-foreground/50",
                  )}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    parameterGlows[key] ? getParameterColor(key) : "text-foreground",
                  )}
                >
                  {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 p-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Processing your request...</span>
        </div>
      )}

      {/* Confidence Meter */}
      {confidence > 0 && (
        <div className="bg-card/20 backdrop-blur-sm border border-border/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Understanding Confidence</span>
            <span className="text-xs font-medium text-foreground">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-1000 ease-out",
                confidence > 0.8 ? "bg-green-500" : confidence > 0.6 ? "bg-sky-500" : "bg-blue-500",
              )}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
