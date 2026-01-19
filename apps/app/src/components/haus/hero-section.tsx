"use client"

import { useState } from "react"
import { VoiceCopilotModal } from "./voice-copilot-modal"
import { PropertyResults } from "./property-results"
import type { VoiceSearchResult } from "@/types/property"

export function HeroSection() {
  const [showVoiceSearch, setShowVoiceSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<VoiceSearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleVoiceSearchResults = (results: VoiceSearchResult) => {
    setSearchResults(results)
    setShowResults(true)
    setShowVoiceSearch(false)
  }

  return (
    <section className="flex flex-col max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 pb-8 sm:pb-4">
      <div className="relative overflow-hidden bg-zinc-950 border border-zinc-800/60 rounded-[20px] sm:rounded-[28px] shadow-2xl shadow-black/50 flex-1 flex flex-col">
        {/* Subtle blue glow accent at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
          {/* Main Search Area */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 flex-1 flex flex-col bg-zinc-900/80">
            {/* Background Image (hidden when voice modal is shown) */}
            {showResults && (
              <>
                <img
                  src="/modern-luxury-home-exterior-at-sunset-with-archite.png"
                  alt="Modern home exterior at sunset"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-zinc-950/20 backdrop-blur-sm" />
              </>
            )}

            <div className="relative flex-1 flex flex-col justify-start items-center p-3 sm:p-4 lg:p-5">
              {showResults && searchResults ? (
                <PropertyResults searchResult={searchResults} onBack={() => setShowResults(false)} />
              ) : (
                <div className="w-full h-full">
                  <VoiceCopilotModal onResults={handleVoiceSearchResults} onClose={() => {}} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
