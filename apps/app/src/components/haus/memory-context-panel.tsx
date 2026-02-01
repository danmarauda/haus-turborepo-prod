"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type {
  SuburbPreference,
  VoiceFact,
  PropertyInteraction,
  VoiceMemory,
} from "@/hooks/use-cortex-memory"
import {
  MapPin,
  Heart,
  X,
  ChevronDown,
  ChevronUp,
  Brain,
  History,
  Home,
  TrendingUp,
  Sparkles,
} from "lucide-react"

interface MemoryContextPanelProps {
  suburbPreferences: SuburbPreference[]
  facts: VoiceFact[]
  propertyInteractions: PropertyInteraction[]
  memories: VoiceMemory[]
  isLoading?: boolean
  className?: string
}

export function MemoryContextPanel({
  suburbPreferences,
  facts,
  propertyInteractions,
  memories,
  isLoading = false,
  className,
}: MemoryContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<"preferences" | "facts" | "history">("preferences")

  const hasContent = suburbPreferences.length > 0 || facts.length > 0 || propertyInteractions.length > 0

  if (!hasContent && !isLoading) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400"
    if (score >= 40) return "text-sky-400"
    if (score >= 0) return "text-zinc-400"
    return "text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500/10 border-green-500/30"
    if (score >= 40) return "bg-sky-500/10 border-sky-500/30"
    if (score >= 0) return "bg-zinc-500/10 border-zinc-500/30"
    return "bg-red-500/10 border-red-500/30"
  }

  return (
    <div
      className={cn(
        "relative w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-2xl overflow-hidden transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-zinc-200">Memory Context</h3>
          {isLoading && (
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-zinc-800/50 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-zinc-950/50 rounded-lg">
            <button
              onClick={() => setActiveTab("preferences")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                activeTab === "preferences"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Preferences</span>
              {suburbPreferences.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 rounded-full text-[10px]">
                  {suburbPreferences.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("facts")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                activeTab === "facts"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Facts</span>
              {facts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 rounded-full text-[10px]">
                  {facts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                activeTab === "history"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {propertyInteractions.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 rounded-full text-[10px]">
                  {propertyInteractions.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[100px] max-h-[200px] overflow-y-auto">
            {activeTab === "preferences" && (
              <div className="space-y-2">
                {suburbPreferences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <Heart className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No suburb preferences yet</p>
                    <p className="text-xs mt-1">Tell HAUS which suburbs you love!</p>
                  </div>
                ) : (
                  suburbPreferences.map((pref, index) => (
                    <div
                      key={`${pref.suburbName}-${pref.state}-${index}`}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg border transition-all",
                        getScoreBg(pref.preferenceScore)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={cn("w-3.5 h-3.5", getScoreColor(pref.preferenceScore))} />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{pref.suburbName}</p>
                          <p className="text-xs text-zinc-500">{pref.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-semibold", getScoreColor(pref.preferenceScore))}>
                          {pref.preferenceScore > 0 ? "+" : ""}
                          {pref.preferenceScore}
                        </span>
                        {pref.preferenceScore >= 70 && <TrendingUp className="w-3 h-3 text-green-400" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "facts" && (
              <div className="space-y-2">
                {facts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No learned facts yet</p>
                    <p className="text-xs mt-1">HAUS learns from your conversations</p>
                  </div>
                ) : (
                  facts.map((fact, index) => (
                    <div
                      key={`${fact.fact}-${index}`}
                      className="p-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-lg"
                    >
                      <p className="text-sm text-zinc-300">{fact.fact}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-zinc-500">
                          {fact.category && <span className="capitalize">{fact.category}</span>}
                        </span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className={cn("text-xs font-medium", fact.confidence >= 80 ? "text-green-400" : "text-zinc-400")}>
                          {fact.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-2">
                {propertyInteractions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <Home className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No property history yet</p>
                    <p className="text-xs mt-1">View properties to build your history</p>
                  </div>
                ) : (
                  propertyInteractions.slice(0, 10).map((interaction, index) => (
                    <div
                      key={`${interaction.propertyId}-${index}`}
                      className="p-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-300">{interaction.propertyId}</p>
                            {interaction.queryText && (
                              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">"{interaction.queryText}"</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-600 uppercase">{interaction.interactionType}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Compact Memory Badge (for inline display)
// -----------------------------------------------------------------------------

interface MemoryBadgeProps {
  count: number
  type: "preferences" | "facts" | "history"
  onClick?: () => void
  className?: string
}

export function MemoryBadge({ count, type, onClick, className }: MemoryBadgeProps) {
  if (count === 0) return null

  const icons = {
    preferences: Heart,
    facts: Sparkles,
    history: History,
  }

  const colors = {
    preferences: "bg-green-500/20 text-green-400 border-green-500/30",
    facts: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    history: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  }

  const Icon = icons[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105",
        colors[type],
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{count}</span>
    </button>
  )
}

// -----------------------------------------------------------------------------
// Memory Quick Summary (shows top preferences inline)
// -----------------------------------------------------------------------------

interface MemoryQuickSummaryProps {
  suburbPreferences: SuburbPreference[]
  facts: VoiceFact[]
  onShowFullContext?: () => void
  className?: string
}

export function MemoryQuickSummary({
  suburbPreferences,
  facts,
  onShowFullContext,
  className,
}: MemoryQuickSummaryProps) {
  const topPreferences = suburbPreferences.slice(0, 3)
  const topFacts = facts.slice(0, 2)

  if (topPreferences.length === 0 && topFacts.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 px-3 py-2 bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/40 rounded-xl",
        className
      )}
    >
      {topPreferences.map((pref) => (
        <div
          key={pref.suburbName}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
            pref.preferenceScore >= 70
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/30"
          )}
        >
          <MapPin className="w-3 h-3" />
          <span>{pref.suburbName}</span>
          <span className="text-[10px] opacity-70">({pref.preferenceScore > 0 ? "+" : ""}
          {pref.preferenceScore})</span>
        </div>
      ))}

      {topFacts.map((fact, index) => (
        <div
          key={`fact-${index}`}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs"
        >
          <Sparkles className="w-3 h-3" />
          <span className="line-clamp-1 max-w-[150px]">{fact.fact}</span>
        </div>
      ))}

      {(suburbPreferences.length > 3 || facts.length > 2) && onShowFullContext && (
        <button
          onClick={onShowFullContext}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          +{suburbPreferences.length - 3 + facts.length - 2} more
        </button>
      )}
    </div>
  )
}
