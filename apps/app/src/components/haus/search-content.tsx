"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@v1/ui/button"
import { Card, CardContent } from "@v1/ui/card"
import { Badge } from "@v1/ui/badge"
import { Input } from "@v1/ui/input"
import { Slider } from "@v1/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@v1/ui/sheet"
import { Checkbox } from "@v1/ui/checkbox"
import { Label } from "@v1/ui/label"
import {
  Search,
  LayoutGrid,
  LayoutList,
  Map as MapIcon,
  SlidersHorizontal,
  X,
  Home,
  Building2,
  Warehouse,
  Trees,
  TrendingUp,
  Sparkles,
  Heart,
  MapPin,
  ArrowUpDown,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react"
import { PropertyCard } from "@/components/haus/property-card"
import { PropertyDetailModal } from "@/components/haus/property-detail-modal"
import { VoiceCopilotModal } from "@/components/haus/voice-copilot-modal"
import { usePropertySearch, formatPrice } from "@/hooks/use-property-search"
import type { Property, VoiceSearchResult } from "@/types/property"
import { SearchErrorBoundary } from "@/components/error-boundaries"

// Property type options
const propertyTypes = [
  { id: "house", label: "House", icon: Home },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "townhouse", label: "Townhouse", icon: Building2 },
  { id: "land", label: "Land", icon: Trees },
  { id: "commercial", label: "Commercial", icon: Warehouse },
]

// Quick filter presets
const filterPresets = [
  { id: "first-home", label: "First Home Buyer", icon: Home, description: "Under $800K, 2-3 beds" },
  { id: "investor", label: "Investor", icon: TrendingUp, description: "High yield suburbs" },
  { id: "family", label: "Family Home", icon: Heart, description: "4+ beds, good schools" },
  { id: "downsizer", label: "Downsizer", icon: Sparkles, description: "Low maintenance" },
]

// Australian cities for location search
const australianCities = [
  "Sydney, NSW",
  "Melbourne, VIC",
  "Brisbane, QLD",
  "Perth, WA",
  "Adelaide, SA",
  "Gold Coast, QLD",
  "Hobart, TAS",
  "Canberra, ACT",
  "Darwin, NT",
  "Newcastle, NSW",
  "Wollongong, NSW",
  "Geelong, VIC",
  "Sunshine Coast, QLD",
]

// Sort options
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "beds-high", label: "Most Bedrooms" },
  { value: "size-high", label: "Largest First" },
  { value: "relevance", label: "Most Relevant" },
]

// Amenity options
const amenityOptions = [
  "Swimming Pool",
  "Garage",
  "Air Conditioning",
  "Garden",
  "Balcony",
  "Security System",
  "Solar Panels",
  "Home Office",
  "Gym",
  "Tennis Court",
]

function SearchContentInner() {
  // Use the real property search hook
  const {
    data: properties,
    isLoading,
    error,
    search,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    setPage,
  } = usePropertySearch()

  // View and layout state
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Modal state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())

  // Load saved data on mount
  const loadSavedData = useCallback(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("haus_saved_properties")
    if (saved) {
      setSavedProperties(new Set(JSON.parse(saved)))
    }
    const searches = localStorage.getItem("haus_saved_searches")
    if (searches) {
      setSavedSearches(JSON.parse(searches))
    }
  }, [])

  // Load saved data once on mount
  useState(() => {
    loadSavedData()
  })

  // Handle voice search results
  const handleVoiceSearchComplete = useCallback(
    async (result: VoiceSearchResult) => {
      const params = result.parameters
      const newFilters: Parameters<typeof updateFilters>[0] = {}

      if (params.location) {
        newFilters.location = params.location
      }
      if (params.priceRange) {
        newFilters.priceRange = {
          min: params.priceRange.min,
          max: params.priceRange.max,
        }
      }
      if (params.bedrooms !== undefined) {
        newFilters.bedrooms = params.bedrooms
      }
      if (params.propertyType) {
        newFilters.propertyType = params.propertyType
      }
      if (params.amenities) {
        newFilters.amenities = params.amenities
      }

      updateFilters(newFilters)
      await search(newFilters)
    },
    [updateFilters, search]
  )

  // Apply preset filters
  const applyPreset = useCallback(
    async (presetId: string) => {
      const isActive = filters.listingType === presetId

      if (isActive) {
        // Toggle off
        updateFilters({ listingType: "all" })
        await search({ listingType: "all" })
        return
      }

      let newFilters: Parameters<typeof updateFilters>[0] = { listingType: presetId as "all" | "for-sale" | "for-rent" }

      switch (presetId) {
        case "first-home":
          newFilters = {
            ...newFilters,
            priceRange: { min: 0, max: 800000 },
            bedrooms: 2,
          }
          break
        case "investor":
          newFilters = {
            ...newFilters,
            priceRange: { min: 400000, max: 1200000 },
            propertyType: "apartment",
          }
          break
        case "family":
          newFilters = {
            ...newFilters,
            bedrooms: 4,
            amenities: ["Garden", "Garage"],
          }
          break
        case "downsizer":
          newFilters = {
            ...newFilters,
            bedrooms: 2,
            propertyType: "apartment",
            amenities: ["Air Conditioning", "Security System"],
          }
          break
      }

      updateFilters(newFilters)
      await search(newFilters)
    },
    [filters.listingType, updateFilters, search]
  )

  // Clear all filters
  const handleClearFilters = useCallback(async () => {
    resetFilters()
    await search({
      page: 1,
      pageSize: 24,
      sortBy: "newest",
      listingType: "all",
    })
  }, [resetFilters, search])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.location) count++
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++
    if (filters.bedrooms !== undefined) count++
    if (filters.bathrooms !== undefined) count++
    if (filters.propertyType) count++
    if (filters.listingType && filters.listingType !== "all") count++
    if (filters.amenities && filters.amenities.length > 0) count++
    return count
  }, [filters])

  // Format price for display
  const formatPriceDisplay = useCallback((price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }, [])

  // Handle property interactions
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }, [])

  const handleFavorite = useCallback(
    (propertyId: string) => {
      const newSaved = new Set(savedProperties)
      if (newSaved.has(propertyId)) {
        newSaved.delete(propertyId)
      } else {
        newSaved.add(propertyId)
      }
      setSavedProperties(newSaved)
      if (typeof window !== "undefined") {
        localStorage.setItem("haus_saved_properties", JSON.stringify([...newSaved]))
      }
    },
    [savedProperties]
  )

  const handleShare = useCallback((property: Property) => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        })
        .catch(() => {
          // User cancelled share - this is expected behavior
        })
    }
  }, [])

  // Save current search
  const saveCurrentSearch = useCallback(() => {
    const searchConfig = {
      location: filters.location,
      priceRange: filters.priceRange,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      propertyType: filters.propertyType,
      listingType: filters.listingType,
      amenities: filters.amenities,
      timestamp: new Date().toISOString(),
    }
    const newSearches = [...savedSearches, JSON.stringify(searchConfig)]
    setSavedSearches(newSearches)
    if (typeof window !== "undefined") {
      localStorage.setItem("haus_saved_searches", JSON.stringify(newSearches))
    }
  }, [filters, savedSearches])

  // Handle sort change
  const handleSortChange = useCallback(
    async (value: string) => {
      const newFilters = { sortBy: value as typeof filters.sortBy }
      updateFilters(newFilters)
      await search(newFilters)
    },
    [updateFilters, search]
  )

  // Handle search button click
  const handleSearch = useCallback(async () => {
    await search()
  }, [search])

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    await setPage(pagination.page + 1)
  }, [setPage, pagination.page])

  // Get current price range for display
  const currentPriceRange = useMemo<[number, number]>(() => {
    const min = filters.priceRange?.min ?? 0
    const max = filters.priceRange?.max ?? 5000000
    return [min, max]
  }, [filters.priceRange])

  // Get current bedrooms display value
  const currentBedrooms = useMemo(() => {
    if (filters.bedrooms === undefined) return "any"
    if (filters.bedrooms >= 5) return "5+"
    return String(filters.bedrooms)
  }, [filters.bedrooms])

  // Get current bathrooms display value
  const currentBathrooms = useMemo(() => {
    if (filters.bathrooms === undefined) return "any"
    if (filters.bathrooms >= 4) return "4+"
    return String(filters.bathrooms)
  }, [filters.bathrooms])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Embedded Voice Search */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-zinc-950 dark:border-white/10 min-h-[500px]">
          <VoiceCopilotModal onResults={handleVoiceSearchComplete} onClose={() => {}} />
        </div>
      </section>

      {/* Text Search Bar */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card backdrop-blur shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] dark:border-white/10">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-transparent dark:from-white/10" />
          <div className="relative p-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Text Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by suburb, postcode, or keyword..."
                  value={filters.query || ""}
                  onChange={(e) => updateFilters({ query: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 pr-4 h-14 text-lg rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 transition-colors"
                />
              </div>

              {/* Location Select */}
              <Select value={filters.location || ""} onValueChange={(value) => updateFilters({ location: value })}>
                <SelectTrigger className="w-full lg:w-64 h-14 rounded-2xl border-white/10 bg-white/5">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {australianCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-white/90"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>

            {/* Quick Filter Presets */}
            <div className="mt-6 flex flex-wrap gap-3">
              {filterPresets.map((preset) => {
                const Icon = preset.icon
                const isActive = filters.listingType === preset.id
                return (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    className={`rounded-full border-white/10 gap-2 transition-all ${
                      isActive ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{preset.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Results count and active filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </span>
              ) : error ? (
                <span className="text-destructive">Error loading properties</span>
              ) : (
                <span>
                  <strong className="text-foreground">{pagination.totalCount.toLocaleString()}</strong> properties found
                </span>
              )}
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {filters.location && (
                  <Badge variant="secondary" className="rounded-full gap-1 pr-1">
                    {filters.location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        updateFilters({ location: undefined })
                        search({ location: undefined })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {(filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) && (
                  <Badge variant="secondary" className="rounded-full gap-1 pr-1">
                    {formatPriceDisplay(filters.priceRange?.min || 0)} - {formatPriceDisplay(filters.priceRange?.max || 5000000)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        updateFilters({ priceRange: undefined })
                        search({ priceRange: undefined })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {filters.bedrooms !== undefined && (
                  <Badge variant="secondary" className="rounded-full gap-1 pr-1">
                    {currentBedrooms}+ beds
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        updateFilters({ bedrooms: undefined })
                        search({ bedrooms: undefined })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {filters.propertyType && (
                  <Badge variant="secondary" className="rounded-full gap-1 pr-1">
                    {filters.propertyType}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        updateFilters({ propertyType: undefined })
                        search({ propertyType: undefined })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1"
                  onClick={handleClearFilters}
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Right: View controls and sort */}
          <div className="flex items-center gap-3">
            {/* Save Search */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border bg-transparent gap-2"
              onClick={saveCurrentSearch}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Search</span>
            </Button>

            {/* Sort */}
            <Select value={filters.sortBy || "newest"} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] rounded-full border-border bg-transparent">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center rounded-full border border-border p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 ${viewMode === "grid" ? "bg-border" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 ${viewMode === "list" ? "bg-border" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 ${viewMode === "map" ? "bg-border" : ""}`}
                onClick={() => setViewMode("map")}
              >
                <MapIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters Sheet */}
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-border bg-transparent gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Search Filters</SheetTitle>
                  <SheetDescription>Refine your property search with detailed filters</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={currentPriceRange}
                        min={0}
                        max={5000000}
                        step={50000}
                        onValueChange={(value) => {
                          updateFilters({
                            priceRange: { min: value[0], max: value[1] },
                          })
                        }}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatPriceDisplay(currentPriceRange[0])}</span>
                        <span>{formatPriceDisplay(currentPriceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* Listing Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Listing Type</Label>
                    <div className="flex gap-2">
                      {["all", "for-sale", "for-rent"].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          className={`flex-1 rounded-full ${
                            filters.listingType === type ? "bg-primary text-primary-foreground border-primary" : ""
                          }`}
                          onClick={() => updateFilters({ listingType: type as typeof filters.listingType })}
                        >
                          {type === "all" ? "All" : type === "for-sale" ? "Buy" : "Rent"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Property Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {propertyTypes.map((type) => {
                        const Icon = type.icon
                        const isSelected = filters.propertyType === type.id
                        return (
                          <Button
                            key={type.id}
                            variant="outline"
                            size="sm"
                            className={`justify-start gap-2 ${isSelected ? "bg-primary/20 border-primary" : ""}`}
                            onClick={() =>
                              updateFilters({ propertyType: isSelected ? undefined : (type.id as typeof filters.propertyType) })
                            }
                          >
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Bedrooms</Label>
                    <div className="flex gap-2">
                      {["any", "1", "2", "3", "4", "5+"].map((num) => (
                        <Button
                          key={num}
                          variant="outline"
                          size="sm"
                          className={`flex-1 rounded-full ${
                            currentBedrooms === num ? "bg-primary text-primary-foreground border-primary" : ""
                          }`}
                          onClick={() =>
                            updateFilters({
                              bedrooms: num === "any" ? undefined : num === "5+" ? 5 : Number.parseInt(num),
                            })
                          }
                        >
                          {num === "any" ? "Any" : num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Bathrooms</Label>
                    <div className="flex gap-2">
                      {["any", "1", "2", "3", "4+"].map((num) => (
                        <Button
                          key={num}
                          variant="outline"
                          size="sm"
                          className={`flex-1 rounded-full ${
                            currentBathrooms === num ? "bg-primary text-primary-foreground border-primary" : ""
                          }`}
                          onClick={() =>
                            updateFilters({
                              bathrooms: num === "any" ? undefined : num === "4+" ? 4 : Number.parseInt(num),
                            })
                          }
                        >
                          {num === "any" ? "Any" : num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {amenityOptions.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={filters.amenities?.includes(amenity) ?? false}
                            onCheckedChange={(checked) => {
                              const currentAmenities = filters.amenities || []
                              if (checked) {
                                updateFilters({ amenities: [...currentAmenities, amenity] })
                              } else {
                                updateFilters({ amenities: currentAmenities.filter((a) => a !== amenity) })
                              }
                            }}
                          />
                          <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Filters */}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClearFilters}>
                      Clear All
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        search()
                        setIsFiltersOpen(false)
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="mb-8">
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">Failed to load properties</p>
            <p className="text-muted-foreground text-sm mt-1">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => search()}>
              Try Again
            </Button>
          </div>
        </section>
      )}

      {/* Results Grid */}
      <section className="mb-12">
        {isLoading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-border bg-muted dark:border-white/10">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "map" ? (
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-muted h-[600px] flex items-center justify-center dark:border-white/10">
            <div className="text-center text-muted-foreground">
              <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Map view coming soon</p>
              <p className="text-sm">Switch to grid or list view to see results</p>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
                onFavorite={handleFavorite}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </section>

      {/* Load More */}
      {!isLoading && properties.length > 0 && (
        <section className="text-center mb-12">
          {pagination.hasMore ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-border bg-transparent px-8"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Load More Properties
            </Button>
          ) : null}
          <p className="text-sm text-muted-foreground mt-3">
            Showing {properties.length} of {pagination.totalCount.toLocaleString()} properties
          </p>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && properties.length === 0 && !error && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria</p>
          <Button onClick={handleClearFilters}>Clear All Filters</Button>
        </div>
      )}

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProperty(null)
        }}
      />
    </main>
  )
}

export function SearchContent() {
  return (
    <SearchErrorBoundary
      onReset={() => {
        // Reset logic handled by the hook
        console.log('Search error boundary reset')
      }}
      onClearFilters={() => {
        // Clear filters logic
        console.log('Clear filters from error boundary')
      }}
    >
      <SearchContentInner />
    </SearchErrorBoundary>
  )
}
