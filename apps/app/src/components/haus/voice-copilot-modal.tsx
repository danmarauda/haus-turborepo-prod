"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { SearchParameters, VoiceSearchResult, AmenityType } from "@/types/property"
import {
  MapPin,
  Home,
  Bed,
  Bath,
  DollarSign,
  X,
  Mic,
  Search,
  Ruler,
  Key,
  Layers,
  Upload,
  Waves,
  Dog,
  Car,
  Trees,
  Dumbbell,
  Flame,
  Wind,
  Sofa,
  Shield,
  Zap,
  Sun,
  ArrowUpDown,
  BookOpen,
  Users,
  Mountain,
  Tag,
  Star,
  Gavel,
} from "lucide-react"
import { PriceRangeSlider } from "./price-range-slider"

interface VoiceCopilotModalProps {
  onResults: (results: VoiceSearchResult) => void
  onClose: () => void
  initialParams?: SearchParameters
}

type SearchStatus = "demo" | "idle" | "listening" | "processing" | "confirming" | "done"
type PermanentTag = "new" | "premium" | "open-house" | "auction"

const SpeechRecognition =
  typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null

interface ExtendedSearchParams extends SearchParameters {
  style?: string
  styleImage?: string
  tags?: PermanentTag[]
  sizeMetersMin?: number
  sizeMetersMax?: number
}

const initialSearchParams: ExtendedSearchParams = {
  location: undefined,
  propertyType: undefined,
  listingType: undefined,
  priceRange: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  squareFootage: undefined,
  amenities: [],
  style: undefined,
  styleImage: undefined,
  tags: [],
  sizeMetersMin: undefined,
  sizeMetersMax: undefined,
}

interface DemoParam {
  keyword: string
  paramKey: keyof ExtendedSearchParams | "amenities" | "tags"
  value: any
}

interface DemoSearch {
  phrase: string
  params: DemoParam[]
}

const demoSearches: DemoSearch[] = [
  {
    phrase: "Show me a luxury apartment in Sydney with a pool and at least 2 bedrooms under $1.5M.",
    params: [
      { keyword: "luxury", paramKey: "tags", value: "premium" },
      { keyword: "apartment", paramKey: "propertyType", value: "apartment" },
      { keyword: "Sydney", paramKey: "location", value: "Sydney" },
      { keyword: "pool", paramKey: "amenities", value: "pool" },
      { keyword: "2 bedrooms", paramKey: "bedrooms", value: 2 },
      { keyword: "$1.5M", paramKey: "priceRange", value: { max: 1500000 } },
    ],
  },
  {
    phrase: "I'm looking for a pet-friendly house for rent in Melbourne with a garage and at least 3 bedrooms.",
    params: [
      { keyword: "pet-friendly", paramKey: "amenities", value: "pet-friendly" },
      { keyword: "house", paramKey: "propertyType", value: "house" },
      { keyword: "for rent", paramKey: "listingType", value: "for-rent" },
      { keyword: "Melbourne", paramKey: "location", value: "Melbourne" },
      { keyword: "garage", paramKey: "amenities", value: "garage" },
      { keyword: "3 bedrooms", paramKey: "bedrooms", value: 3 },
    ],
  },
  {
    phrase:
      "Find a modern apartment in Auckland with a gym, parking, and good school district, between $800k and $1.2M.",
    params: [
      { keyword: "modern", paramKey: "style", value: "Modern" },
      { keyword: "apartment", paramKey: "propertyType", value: "apartment" },
      { keyword: "Auckland", paramKey: "location", value: "Auckland" },
      { keyword: "gym", paramKey: "amenities", value: "gym" },
      { keyword: "parking", paramKey: "amenities", value: "covered-parking" },
      { keyword: "$800k", paramKey: "priceRange", value: { min: 800000, max: 1200000 } },
    ],
  },
  {
    phrase:
      "Show me a luxury penthouse in Queenstown with a mountain view, spa and at least 4 bedrooms under $4M that's a new listing.",
    params: [
      { keyword: "luxury", paramKey: "tags", value: "premium" },
      { keyword: "penthouse", paramKey: "propertyType", value: "penthouse" },
      { keyword: "Queenstown", paramKey: "location", value: "Queenstown" },
      { keyword: "mountain view", paramKey: "features", value: "mountain-view" },
      { keyword: "spa", paramKey: "amenities", value: "spa" },
      { keyword: "4 bedrooms", paramKey: "bedrooms", value: 4 },
      { keyword: "$4M", paramKey: "priceRange", value: { max: 4000000 } },
      { keyword: "new listing", paramKey: "tags", value: "new" },
    ],
  },
]

const PARAMETER_CONFIG = [
  { key: "location", label: "Location", icon: MapPin, colSpan: "sm:col-span-2" },
  { key: "listingType", label: "Type", icon: Key },
  { key: "propertyType", label: "Property", icon: Home },
  { key: "bedrooms", label: "Bedrooms", icon: Bed },
  { key: "bathrooms", label: "Bathrooms", icon: Bath },
  { key: "sizeMetersMin", label: "Min Size", icon: Ruler },
  { key: "sizeMetersMax", label: "Max Size", icon: Ruler },
  { key: "style", label: "Style", icon: Layers, colSpan: "sm:col-span-2" },
  { key: "priceSlider", label: "Price Range", colSpan: "sm:col-span-2" },
]

const AMENITY_CONFIG: { key: AmenityType; label: string; icon: typeof Waves }[] = [
  { key: "pool", label: "Pool", icon: Waves },
  { key: "pet-friendly", label: "Pet-Friendly", icon: Dog },
  { key: "garage", label: "Garage", icon: Car },
  { key: "garden", label: "Garden", icon: Trees },
  { key: "gym", label: "Gym", icon: Dumbbell },
  { key: "balcony", label: "Balcony", icon: Mountain },
  { key: "fireplace", label: "Fireplace", icon: Flame },
  { key: "air-conditioning", label: "A/C", icon: Wind },
  { key: "furnished", label: "Furnished", icon: Sofa },
  { key: "security-system", label: "Security", icon: Shield },
  { key: "solar-panels", label: "Solar", icon: Sun },
  { key: "smart-home", label: "Smart Home", icon: Zap },
  { key: "laundry", label: "Laundry", icon: Wind },
  { key: "study", label: "Study", icon: BookOpen },
  { key: "concierge", label: "Concierge", icon: Users },
  { key: "elevator", label: "Elevator", icon: ArrowUpDown },
]

const PERMANENT_TAG_CONFIG: { key: PermanentTag; label: string; icon: typeof Tag; activeColor: string }[] = [
  { key: "new", label: "New", icon: Tag, activeColor: "bg-cyan-600/80 border-cyan-500" },
  { key: "premium", label: "Premium", icon: Star, activeColor: "bg-indigo-600/80 border-indigo-500" },
  { key: "open-house", label: "Open House", icon: Users, activeColor: "bg-sky-600/80 border-sky-500" },
  { key: "auction", label: "Auction", icon: Gavel, activeColor: "bg-blue-600/80 border-blue-500" },
]

const formatValue = (key: string, value: any): string => {
  if (value === undefined || value === null) return "-"
  switch (key) {
    case "bedrooms":
      return `${value}+ beds`
    case "bathrooms":
      return `${value}+ baths`
    case "sizeMetersMin":
      return `${value.toLocaleString()}+ sqm`
    case "sizeMetersMax":
      return `Up to ${value.toLocaleString()} sqm`
    case "priceRange":
      if (value.min && value.max) return `$${(value.min / 1000000).toFixed(1)}M - $${(value.max / 1000000).toFixed(1)}M`
      if (value.max) return `Under $${(value.max / 1000000).toFixed(1)}M`
      if (value.min) return `Over $${(value.min / 1000000).toFixed(1)}M`
      return "-"
    default:
      return String(value)
  }
}

const highlightTranscript = (transcript: string, highlights: string[]) => {
  if (!highlights.length || !transcript) return <>{transcript}</>
  const escapedHighlights = highlights.map((h) => h.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
  if (escapedHighlights.length === 0) return <>{transcript}</>
  const regex = new RegExp(`(${escapedHighlights.join("|")})`, "gi")
  const parts = transcript.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="text-blue-400 font-semibold drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

// Seeded pseudo-random for consistent SSR/client rendering
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

const generateHistogramData = (length: number): number[] => {
  const data = Array.from({ length }, (_, i) => seededRandom(i + 1))
  for (let i = 1; i < length - 1; i++) {
    const prev = data[i - 1] ?? 0
    const curr = data[i] ?? 0
    const next = data[i + 1] ?? 0
    data[i] = (prev + curr + next) / 3
  }
  return data
}

export function VoiceCopilotModal({ onResults, onClose, initialParams }: VoiceCopilotModalProps) {
  const [status, setStatus] = useState<SearchStatus>("demo")
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Demo animation state
  const [exampleIndex, setExampleIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [animatedText, setAnimatedText] = useState("")
  const [demoSearchParams, setDemoSearchParams] = useState<ExtendedSearchParams>(initialSearchParams)

  // Real search state
  const [transcript, setTranscript] = useState("")
  const [searchParams, setSearchParams] = useState<ExtendedSearchParams>(initialParams || initialSearchParams)
  const [glowingParams, setGlowingParams] = useState<Set<string>>(new Set())
  const [highlightedText, setHighlightedText] = useState<string[]>([])

  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastFinalTranscript = useRef("")
  const processedParamsRef = useRef<Set<string>>(new Set())

  const displayedSearchParams = isDemoMode ? demoSearchParams : searchParams
  const histogramData = useMemo(() => generateHistogramData(60), [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const addGlowingParams = useCallback((paramKeys: string[]) => {
    setGlowingParams((prev) => {
      const newSet = new Set(prev)
      paramKeys.forEach((key) => newSet.add(key))
      return newSet
    })
    // Auto-remove glow after 2 seconds
    setTimeout(() => {
      setGlowingParams((prev) => {
        const newSet = new Set(prev)
        paramKeys.forEach((key) => newSet.delete(key))
        return newSet
      })
    }, 2000)
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (!isDemoMode) return

    if (subIndex === 0 && !isDeleting) {
      const timer = setTimeout(() => setSubIndex(1), 100)
      return () => clearTimeout(timer)
    }

    if (isDeleting) {
      if (subIndex > 0) {
        const timer = setTimeout(() => setSubIndex(subIndex - 1), 30)
        return () => clearTimeout(timer)
      } else {
        setIsDeleting(false)
        setExampleIndex((prev) => (prev + 1) % demoSearches.length)
        processedParamsRef.current = new Set()
        return
      }
    }

    const currentSearch = demoSearches[exampleIndex]
    if (!currentSearch) return
    const currentPhrase = currentSearch.phrase
    if (subIndex < currentPhrase.length) {
      const timer = setTimeout(() => setSubIndex(subIndex + 1), 50)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setIsDeleting(true), 2500)
    return () => clearTimeout(timer)
  }, [subIndex, isDeleting, exampleIndex, isDemoMode])

  useEffect(() => {
    if (!isDemoMode) return
    if (isDeleting && subIndex === 1) {
      setDemoSearchParams(initialSearchParams)
      setGlowingParams(new Set())
      processedParamsRef.current = new Set()
    }
    const currentDemo = demoSearches[exampleIndex]
    if (!currentDemo) return
    const currentPhrase = currentDemo.phrase
    const newAnimatedText = currentPhrase.substring(0, subIndex)
    setAnimatedText(newAnimatedText)
    if (isDeleting || subIndex === 0) return

    const newlyRecognizedKeywords: string[] = []

    currentDemo.params.forEach((param) => {
      const paramId = `${exampleIndex}-${param.keyword}`
      if (
        newAnimatedText.toLowerCase().includes(param.keyword.toLowerCase()) &&
        !processedParamsRef.current.has(paramId)
      ) {
        processedParamsRef.current.add(paramId)
        const { paramKey, value } = param

        setDemoSearchParams((prev) => {
          if (paramKey === "amenities") {
            if (prev.amenities?.includes(value)) return prev
            return { ...prev, amenities: [...(prev.amenities || []), value] }
          } else if (paramKey === "tags") {
            if (prev.tags?.includes(value)) return prev
            return { ...prev, tags: [...(prev.tags || []), value as PermanentTag] }
          } else if (paramKey === "priceRange") {
            return { ...prev, priceRange: { ...prev.priceRange, ...value } }
          } else {
            return { ...prev, [paramKey]: value }
          }
        })

        newlyRecognizedKeywords.push(paramKey === "amenities" || paramKey === "tags" ? value : paramKey)
      }
    })

    if (newlyRecognizedKeywords.length > 0) addGlowingParams(newlyRecognizedKeywords)
  }, [subIndex, isDeleting, exampleIndex, isDemoMode, addGlowingParams])

  const switchToRealSearch = () => {
    if (isDemoMode) {
      setIsDemoMode(false)
      setAnimatedText("")
      setGlowingParams(new Set())
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStatus("idle")
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    switchToRealSearch()
    setTranscript("")
    lastFinalTranscript.current = ""
    setHighlightedText([])
    setSearchParams((prev) => ({ ...initialSearchParams, tags: prev.tags }))
    setGlowingParams(new Set())
  }

  const handleStartListening = () => {
    if (isDemoMode) {
      switchToRealSearch()
    } else if (status === "done" || status === "idle" || status === "confirming") {
      setSearchParams((prev) => ({ ...initialSearchParams, tags: prev.tags }))
      setGlowingParams(new Set())
    }
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.")
      return
    }
    if (recognitionRef.current) return

    setTranscript("")
    lastFinalTranscript.current = ""
    setHighlightedText([])
    setStatus("listening")

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-AU"

    recognition.onresult = (event: any) => {
      if (isDemoMode) switchToRealSearch()
      let final_transcript = ""
      let interim_transcript = ""
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final_transcript += event.results[i][0].transcript
        else interim_transcript += event.results[i][0].transcript
      }
      const fullTranscript = final_transcript + interim_transcript
      setTranscript(fullTranscript)

      if (final_transcript && final_transcript !== lastFinalTranscript.current) {
        const newChunk = final_transcript.substring(lastFinalTranscript.current.length)
        lastFinalTranscript.current = final_transcript
        if (newChunk.trim()) processTranscript(newChunk.trim())
      }
    }
    recognition.onend = () => {
      recognitionRef.current = null
      if (status === "listening") setStatus("confirming")
    }
    recognition.start()
    recognitionRef.current = recognition
  }

  const handleStopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
  }

  const processTranscript = async (text: string) => {
    if (
      text
        .trim()
        .toLowerCase()
        .match(/^(search|let's go|lets go|find|ok|find my house|find my haus)$/)
    ) {
      handleSearch()
      return
    }
    if (text.trim().length < 3) return
    setStatus("processing")

    try {
      const response = await fetch("/api/voice-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, currentParams: searchParams }),
      })

      if (!response.ok) throw new Error("Failed to process voice input")

      const result = await response.json()
      const updatedParams = result.parameters || {}
      const newGlowing: string[] = []

      Object.keys(updatedParams).forEach((key) => {
        if (updatedParams[key] !== undefined) {
          newGlowing.push(key)
        }
      })

      if (updatedParams.priceRange) newGlowing.push("priceSlider")

      setSearchParams((prev) => ({ ...prev, ...updatedParams }))
      addGlowingParams(newGlowing)
      setStatus("confirming")
    } catch (error) {
      console.error("Error processing transcript:", error)
      setStatus(recognitionRef.current ? "listening" : "idle")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setSearchParams((prev) => ({ ...prev, styleImage: dataUrl, style: "Analyzing..." }))
      switchToRealSearch()
      addGlowingParams(["style"])

      try {
        // Call style recognition API
        const response = await fetch("/api/style-recognition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        })

        if (response.ok) {
          const result = await response.json()
          setSearchParams((prev) => ({ ...prev, style: result.style || "Modern" }))
        } else {
          setSearchParams((prev) => ({ ...prev, style: "Modern" }))
        }
        setStatus("confirming")
      } catch (error) {
        console.error("Error identifying style:", error)
        setSearchParams((prev) => ({ ...prev, style: "Modern" }))
        setStatus("confirming")
      }
    }
    reader.readAsDataURL(file)
    if (event.target) event.target.value = ""
  }

  const handleSearch = () => {
    if (isDemoMode) {
      switchToRealSearch()
      setSearchParams(demoSearchParams as ExtendedSearchParams)
    }
    setStatus("done")
    if (recognitionRef.current) recognitionRef.current.stop()

    const result: VoiceSearchResult = {
      parameters: searchParams,
      sourceText: transcript || animatedText,
      confidence: 0.85,
    }
    setTimeout(() => onResults(result), 800)
  }

  const handleToggleTag = (tagKey: PermanentTag) => {
    switchToRealSearch()
    setSearchParams((prev) => {
      const currentTags = new Set(prev.tags || [])
      if (currentTags.has(tagKey)) {
        currentTags.delete(tagKey)
      } else {
        currentTags.add(tagKey)
      }
      return { ...prev, tags: Array.from(currentTags) }
    })
    addGlowingParams([tagKey])
  }

  const handleToggleAmenity = (amenityKey: AmenityType) => {
    switchToRealSearch()
    setSearchParams((prev) => {
      const currentAmenities = new Set(prev.amenities || [])
      if (currentAmenities.has(amenityKey)) {
        currentAmenities.delete(amenityKey)
      } else {
        currentAmenities.add(amenityKey)
      }
      return { ...prev, amenities: Array.from(currentAmenities) }
    })
    addGlowingParams([amenityKey])
  }

  const handlePriceChange = (newRange: [number, number]) => {
    switchToRealSearch()
    setSearchParams((prev) => ({
      ...prev,
      priceRange: { min: newRange[0], max: newRange[1] },
    }))
    addGlowingParams(["priceSlider"])
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const displayedTranscript = isDemoMode ? animatedText : transcript
  const keywordsForHighlight = isDemoMode ? (demoSearches[exampleIndex]?.params.map((p) => p.keyword) ?? []) : highlightedText
  const isDone = status === "done"

  const isRent = displayedSearchParams.listingType === "for-rent"
  const priceValue: [number, number] = [
    displayedSearchParams.priceRange?.min ?? (isRent ? 500 : 100000),
    displayedSearchParams.priceRange?.max ?? (isRent ? 15000 : 10000000),
  ]

  const getButtonContent = () => {
    switch (status) {
      case "listening":
      case "processing":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 overflow-hidden opacity-40">
              {isClient &&
                [...Array(48)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-primary-foreground/80 animate-pulse"
                    style={{
                      height: `${10 + seededRandom(i + 100) * 60}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
            </div>
            <span className="relative z-10">{status === "processing" && "Updating..."}</span>
            {status === "listening" && (
              <button
                onClick={handleCancel}
                className="absolute right-4 z-20 p-1.5 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                aria-label="Cancel search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )
      case "confirming":
        return (
          <>
            <Search className="w-5 h-5 stroke-[1.5]" />
            <span>Find My HAUS</span>
          </>
        )
      case "done":
        return <span>Finding properties...</span>
      default:
        return (
          <>
            <Mic className="w-5 h-5" />
            <span>Try HAUS Finder</span>
          </>
        )
    }
  }

  const getButtonAction = () => {
    switch (status) {
      case "listening":
        return handleStopListening
      case "confirming":
        return handleSearch
      default:
        return handleStartListening
    }
  }

  const getMainButtonClassName = () => {
    const baseClasses =
      "inline-flex items-center justify-center gap-3 rounded-2xl px-8 h-14 text-lg font-medium tracking-tight text-primary-foreground border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 relative overflow-hidden touch-target"
    switch (status) {
      case "confirming":
        return `${baseClasses} bg-green-600 hover:bg-green-700 border-green-500/50 focus-visible:outline-green-500`
      case "listening":
      case "processing":
        return `${baseClasses} bg-red-600/80 border-red-500/50 cursor-pointer`
      case "done":
        return `${baseClasses} bg-muted border-transparent`
      default:
        return `${baseClasses} bg-primary hover:bg-primary/90 border-transparent focus-visible:outline-primary`
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 sm:p-3 scrollbar-hide">
      {/* Dark background with subtle blue glow */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* Close button */}
      

      <div className="relative w-full max-w-6xl text-center flex flex-col min-h-full">
        {/* Transcript Display */}
        <div className="flex-shrink-0 pt-2 sm:pt-4">
          <p
            className="h-20 sm:h-24 text-2xl sm:text-3xl text-white/90 font-medium leading-relaxed transition-opacity duration-300 p-2 flex items-center justify-center drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            aria-live="polite"
          >
            <span className="block max-w-2xl">
              {status === "listening" && transcript.length === 0 && !isDemoMode && (
                <span className="text-zinc-500">Listening...</span>
              )}
              {highlightTranscript(displayedTranscript, keywordsForHighlight)}
              {(isDemoMode || (status === "listening" && transcript.length === 0)) && (
                <span className="animate-pulse text-white/40">|</span>
              )}
            </span>
          </p>
        </div>

        {/* Parameter Grid */}
        <div className="flex-grow my-2 overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {PARAMETER_CONFIG.map((param) => {
              const key = param.key as keyof ExtendedSearchParams
              const Icon = param.icon

              if (param.key === "priceSlider") {
              const highlightClass = glowingParams.has(param.key)
                ? isDone
                  ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/60"
                  : "animate-[glow-pulse_2s_ease-in-out_infinite] border-blue-500/50"
                : ""
              return (
                <div
                  key={param.key}
                  className={cn(
                    param.colSpan || "sm:col-span-1",
                    "p-3 rounded-xl border transition-all duration-500 bg-zinc-900/80 border-zinc-700/60 hover:border-zinc-600/70",
                    highlightClass,
                  )}
                >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-blue-500/15 text-blue-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-500 text-left">{param.label}</h3>
                    </div>
                    <PriceRangeSlider
                      data={histogramData}
                      value={priceValue}
                      onValueChange={handlePriceChange}
                      listingType={displayedSearchParams.listingType}
                    />
                  </div>
                )
              }

              if (key === "style") {
                const highlightClass = glowingParams.has("style")
                  ? isDone
                    ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/60"
                    : "animate-[glow-pulse_2s_ease-in-out_infinite] border-blue-500/50"
                  : ""
                const styleValue = displayedSearchParams.style
                const styleImage = displayedSearchParams.styleImage

                const clearStyle = (e: React.MouseEvent) => {
                  e.stopPropagation()
                  setSearchParams((prev) => ({ ...prev, style: undefined, styleImage: undefined }))
                }

                return (
                  <div
                    key={param.key}
                    className={cn(
                      "relative",
                      param.colSpan,
                      "p-3 rounded-xl border transition-all duration-500",
                      styleValue || styleImage ? "bg-zinc-900/80 border-zinc-700/60" : "bg-zinc-900/50 border-zinc-800/40 hover:border-zinc-700/50",
                      highlightClass,
                    )}
                  >
                    <div className="flex items-center gap-3 absolute top-3 left-3 z-10">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          styleValue || styleImage ? "bg-blue-500/15 text-blue-400" : "bg-zinc-800/80 text-zinc-500",
                        )}
                      >
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-500">{param.label}</h3>
                    </div>

                    {(styleValue || styleImage) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {styleImage && (
                          <div className="relative w-full h-full min-h-[96px] flex items-center justify-center rounded-lg overflow-hidden mt-4">
                            <img
                              src={styleImage || "/placeholder.svg"}
                              alt="Style reference"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />
                            <div className="relative z-10 text-center text-foreground mt-auto p-2">
                              <p className="text-xs text-muted-foreground">Identified Style</p>
                              <p className="text-base font-semibold">{styleValue}</p>
                            </div>
                          </div>
                        )}
                        {!styleImage && styleValue && (
                          <div className="relative z-10 text-center text-foreground p-2">
                            <p className="text-lg font-semibold">{styleValue}</p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-1 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 px-2 py-1 rounded-md backdrop-blur-sm"
                            >
                              Upload new reference
                            </button>
                          </div>
                        )}
                        {!styleImage && !styleValue && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-zinc-700/60 hover:border-blue-500/50 hover:bg-zinc-800/40 rounded-lg transition-colors p-4"
                          >
                            <Upload className="w-8 h-8 text-zinc-500" />
                            <span className="text-sm text-zinc-500 text-center">Upload style reference</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              // Regular parameters
              let hasValue = false
              let displayValue = "-"
              let isGlowing = false

              if (key === "location") {
                const locationValue = displayedSearchParams.location
                hasValue = !!locationValue
                if (locationValue) {
                  displayValue = locationValue
                }
                isGlowing = glowingParams.has("location")
              } else {
                const value = displayedSearchParams[key]
                hasValue = value !== undefined && value !== null && value !== ""
                if (hasValue) {
                  displayValue = formatValue(key, value)
                }
                isGlowing = glowingParams.has(key)
              }

              const highlightClass = isGlowing
                ? isDone
                  ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/60"
                  : "animate-[glow-pulse_2s_ease-in-out_infinite] border-blue-500/50"
                : ""

              return (
                <div
                  key={param.key}
                  className={cn(
                    param.colSpan || "sm:col-span-1",
                    "p-3 rounded-xl border transition-all duration-500",
                    hasValue ? "bg-zinc-900/80 border-zinc-700/60" : "bg-zinc-900/50 border-zinc-800/40 hover:border-zinc-700/50",
                    highlightClass,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        hasValue ? "bg-blue-500/15 text-blue-400" : "bg-zinc-800/80 text-zinc-500",
                      )}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow self-center overflow-hidden">
                      <h3 className="text-sm font-medium text-zinc-500 text-left">{param.label}</h3>
                      <p className="text-base font-semibold text-white text-left min-h-[24px] truncate">
                        {displayValue}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Amenities */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1 text-left">
              Amenities
            </h4>
            <div className="flex flex-wrap gap-2">
              {AMENITY_CONFIG.map((amenity) => {
                const Icon = amenity.icon
                const isActive = displayedSearchParams.amenities?.includes(amenity.key)
                const isGlowing = glowingParams.has(amenity.key)
                const highlightClass = isGlowing
                  ? isDone
                    ? "shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/60"
                    : "animate-[glow-pulse_2s_ease-in-out_infinite] border-blue-500/50"
                  : ""

                return (
                  <button
                    key={amenity.key}
                    onClick={() => handleToggleAmenity(amenity.key)}
                    className={cn(
                      "p-2 sm:p-3 rounded-xl border transition-all duration-500 flex items-center gap-2 touch-target",
                      isActive
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        : "bg-zinc-900/50 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-300 hover:border-zinc-700/70",
                      highlightClass,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <p className="text-xs font-medium truncate">{amenity.label}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex-shrink-0 mt-auto pt-3 pb-1 w-full border-t border-zinc-800/60">
          <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {PERMANENT_TAG_CONFIG.slice(0, 2).map((tag) => {
              const Icon = tag.icon
              const isActive = displayedSearchParams.tags?.includes(tag.key)
              const isGlowing = glowingParams.has(tag.key)
              const highlightClass = isGlowing
                ? isDone
                  ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/60"
                  : "animate-[glow-intense_1.5s_ease-in-out_infinite] border-blue-500/50"
                : ""

              return (
                <button
                  key={tag.key}
                  onClick={() => handleToggleTag(tag.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl h-11 sm:h-12 text-sm font-medium tracking-tight border transition-all duration-500 touch-target",
                    isActive
                      ? `${tag.activeColor} text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]`
                      : "bg-transparent border-zinc-700/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-300 hover:border-zinc-600/70",
                    highlightClass,
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tag.label}</span>
                </button>
              )
            })}

            <div className="flex-[4] flex flex-col items-center gap-2">
              <button
                onClick={getButtonAction()}
                disabled={status === "done" || status === "processing"}
                className={cn(getMainButtonClassName(), "w-full")}
              >
                {getButtonContent()}
              </button>
            </div>

            {PERMANENT_TAG_CONFIG.slice(2, 4).map((tag) => {
              const Icon = tag.icon
              const isActive = displayedSearchParams.tags?.includes(tag.key)
              const isGlowing = glowingParams.has(tag.key)
              const highlightClass = isGlowing
                ? isDone
                  ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/60"
                  : "animate-[glow-intense_1.5s_ease-in-out_infinite] border-blue-500/50"
                : ""

              return (
                <button
                  key={tag.key}
                  onClick={() => handleToggleTag(tag.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl h-11 sm:h-12 text-sm font-medium tracking-tight border transition-all duration-500 touch-target",
                    isActive
                      ? `${tag.activeColor} text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]`
                      : "bg-transparent border-zinc-700/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-300 hover:border-zinc-600/70",
                    highlightClass,
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tag.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
