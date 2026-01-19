"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@haus/ui/card"
import { Button } from "@haus/ui/button"
import { Badge } from "@haus/ui/badge"
import { Input } from "@haus/ui/input"
import { Checkbox } from "@haus/ui/checkbox"
import { Slider } from "@haus/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@haus/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@haus/ui/select"
import {
  Shield,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  Search,
  MapPin,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronRight,
  ChevronLeft,
  Zap,
  X,
  ArrowUpDown,
  Building2,
} from "lucide-react"
import Link from "next/link"
import type { ServiceProvider, ServiceCategory } from "@/types/marketplace"

interface CategoryContentProps {
  category: string
  title: string
  description: string
}

// Mock providers data generator
function generateMockProviders(category: string, count: number): ServiceProvider[] {
  const providers: ServiceProvider[] = []
  const cities = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart"]
  const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS"]

  const businessNames: Record<string, string[]> = {
    conveyancing: [
      "Settle Smart",
      "QuickConvey",
      "Property Legal Co",
      "EasySettle",
      "Premier Conveyancing",
      "Swift Settlements",
    ],
    "buyers-agent": [
      "Buyer First",
      "Property Advocates",
      "Smart Buy Agency",
      "Your Property Agent",
      "Elite Buyers",
      "Advocate Pro",
    ],
    "property-lawyer": [
      "Legal Property Co",
      "Law & Property",
      "Estate Lawyers",
      "Property Law Group",
      "Legal First",
      "Premier Property Law",
    ],
    "building-inspection": [
      "PropInspect",
      "Building Check",
      "Inspect Pro",
      "Safe Home Inspections",
      "Building Reports",
      "Home Check",
    ],
    "pest-inspection": [
      "Pest Free",
      "Termite Experts",
      "Bug Busters",
      "Pest Patrol",
      "Safe Home Pest",
      "Pest Detectors",
    ],
    "mortgage-broker": [
      "HomeStart",
      "Loan Market",
      "Mortgage Choice",
      "Finance Pro",
      "Home Loans Direct",
      "Better Rate",
    ],
    removalist: ["Quick Move", "Easy Relocate", "Premier Movers", "Swift Removals", "All Moves", "Safe Hands Moving"],
    styling: ["Style & Stage", "Home Styled", "Property Presence", "Stage Right", "Styled to Sell", "Design Impact"],
    photography: [
      "Property Shots",
      "Real Estate Media",
      "Home Imagery",
      "Pixel Perfect Property",
      "Pro Property Photos",
      "Estate Visuals",
    ],
    valuation: [
      "ValuePro",
      "Property Valuers",
      "Accurate Valuations",
      "Market Value Co",
      "Valuation Experts",
      "True Value",
    ],
    cleaning: [
      "Sparkle Clean",
      "Bond Clean Pro",
      "Fresh Start Cleaning",
      "Spotless Homes",
      "Deep Clean Co",
      "Pristine Properties",
    ],
    renovation: [
      "Reno Kings",
      "Build & Transform",
      "Home Makeover",
      "Premier Renovations",
      "Quality Builds",
      "Transform Homes",
    ],
  }

  const names = businessNames[category] || ["Service Provider"]

  for (let i = 0; i < count; i++) {
    const cityIndex = i % cities.length
    const nameIndex = i % names.length
    const cityName = cities[cityIndex] ?? "Sydney"
    const stateName = states[cityIndex] ?? "NSW"
    const businessName = names[nameIndex] ?? "Service Provider"
    const rating = 4.5 + Math.random() * 0.5
    const reviewCount = Math.floor(100 + Math.random() * 2000)
    const completedJobs = Math.floor(500 + Math.random() * 5000)
    const yearsInBusiness = Math.floor(3 + Math.random() * 20)
    const verificationLevels: ("verified" | "premium" | "elite")[] = ["verified", "premium", "elite"]
    const verificationLevel = verificationLevels[Math.floor(Math.random() * 3)] ?? "verified"

    providers.push({
      id: `${category}-${i + 1}`,
      businessName: `${businessName} ${cityName}`,
      slug: `${businessName.toLowerCase().replace(/\s+/g, "-")}-${cityName.toLowerCase()}`,
      category: category as ServiceCategory,
      description: `Professional ${category.replace(/-/g, " ")} services with over ${yearsInBusiness} years of experience.`,
      shortDescription: `Trusted ${category.replace(/-/g, " ")} in ${cityName}`,
      logoUrl: `/placeholder.svg?height=80&width=80&query=${category} logo`,
      verificationLevel,
      badges: ["haus-verified", verificationLevel === "elite" ? "top-rated" : "fast-response"],
      rating: Math.round(rating * 10) / 10,
      reviewCount,
      completedJobs,
      responseTime:
        verificationLevel === "elite" ? "< 30 mins" : verificationLevel === "premium" ? "< 1 hour" : "< 2 hours",
      yearsInBusiness,
      location: {
        city: cityName,
        state: stateName,
        suburbs: ["CBD", "Inner Suburbs", "Outer Suburbs"],
      },
      pricing: {
        type: "fixed",
        startingFrom: Math.floor(200 + Math.random() * 2000),
        currency: "AUD",
        description: "Competitive pricing",
      },
      contact: {
        phone: "02 9000 " + Math.floor(1000 + Math.random() * 9000),
        email: `info@${businessName.toLowerCase().replace(/\s+/g, "")}.com.au`,
      },
      operatingHours: {
        weekdays: "8:00 AM - 6:00 PM",
        weekends: "By appointment",
      },
      languages: ["English"],
      licenses: [
        {
          name: "Professional License",
          number: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
          verifiedAt: "2024-01-01",
        },
      ],
      insurance: [{ type: "Professional Indemnity", coverage: 2000000, verifiedAt: "2024-01-01" }],
      teamSize: Math.floor(2 + Math.random() * 15),
      featured: i < 3,
      availableForUrgent: Math.random() > 0.3,
      createdAt: "2020-01-01",
      lastActiveAt: "2024-12-23",
    })
  }

  return providers
}

export function CategoryContent({ category, title, description }: CategoryContentProps) {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [sortBy, setSortBy] = useState("recommended")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filter states
  const [filters, setFilters] = useState({
    verificationLevels: [] as string[],
    minRating: 0,
    priceRange: [0, 5000] as [number, number],
    urgentAvailable: false,
    responseTime: "any",
  })

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)
    const timer = setTimeout(() => {
      const mockProviders = generateMockProviders(category, 48)
      setProviders(mockProviders)
      setFilteredProviders(mockProviders)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [category])

  useEffect(() => {
    let result = [...providers]

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.city.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Location filter
    if (selectedLocation !== "all") {
      result = result.filter((p) => p.location.state.toLowerCase() === selectedLocation)
    }

    // Verification level filter
    if (filters.verificationLevels.length > 0) {
      result = result.filter((p) => filters.verificationLevels.includes(p.verificationLevel))
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((p) => p.rating >= filters.minRating)
    }

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) {
      result = result.filter(
        (p) =>
          p.pricing.startingFrom &&
          p.pricing.startingFrom >= filters.priceRange[0] &&
          p.pricing.startingFrom <= filters.priceRange[1],
      )
    }

    // Urgent available filter
    if (filters.urgentAvailable) {
      result = result.filter((p) => p.availableForUrgent)
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        result.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case "price-low":
        result.sort((a, b) => (a.pricing.startingFrom || 0) - (b.pricing.startingFrom || 0))
        break
      case "price-high":
        result.sort((a, b) => (b.pricing.startingFrom || 0) - (a.pricing.startingFrom || 0))
        break
      case "response":
        result.sort((a, b) => {
          const aTime = a.responseTime.includes("30") ? 30 : a.responseTime.includes("1") ? 60 : 120
          const bTime = b.responseTime.includes("30") ? 30 : b.responseTime.includes("1") ? 60 : 120
          return aTime - bTime
        })
        break
      default:
        // Recommended: featured first, then by rating
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
        })
    }

    setFilteredProviders(result)
    setCurrentPage(1)
  }, [providers, searchQuery, selectedLocation, sortBy, filters])

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage)
  const paginatedProviders = filteredProviders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const activeFilterCount =
    filters.verificationLevels.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0) +
    (filters.urgentAvailable ? 1 : 0) +
    (filters.responseTime !== "any" ? 1 : 0)

  const clearFilters = () => {
    setFilters({
      verificationLevels: [],
      minRating: 0,
      priceRange: [0, 5000],
      urgentAvailable: false,
      responseTime: "any",
    })
  }

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case "elite":
        return {
          label: "Elite",
          className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
        }
      case "premium":
        return { label: "Premium", className: "bg-primary/20 text-primary border-primary/30" }
      default:
        return { label: "Verified", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/market" className="hover:text-foreground transition-colors">
          Market
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{title}</span>
      </nav>

      {/* Page Header */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card backdrop-blur dark:border-white/10">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-transparent dark:from-white/10" />
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{filteredProviders.length} Verified Providers</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">{title}</h1>
                <p className="text-muted-foreground max-w-2xl">{description}</p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{providers.length}</p>
                  <p className="text-muted-foreground">Providers</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">4.8</p>
                  <p className="text-muted-foreground">Avg Rating</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">2hr</p>
                  <p className="text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Location */}
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-white/10 bg-white/5">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Australia</SelectItem>
              <SelectItem value="nsw">New South Wales</SelectItem>
              <SelectItem value="vic">Victoria</SelectItem>
              <SelectItem value="qld">Queensland</SelectItem>
              <SelectItem value="wa">Western Australia</SelectItem>
              <SelectItem value="sa">South Australia</SelectItem>
              <SelectItem value="tas">Tasmania</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-white/10 bg-white/5">
              <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="response">Fastest Response</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-1">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-background border-white/10">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Filters
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-8">
                {/* Verification Level */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Verification Level</h3>
                  <div className="space-y-3">
                    {["elite", "premium", "verified"].map((level) => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.verificationLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({
                              ...prev,
                              verificationLevels: checked
                                ? [...prev.verificationLevels, level]
                                : prev.verificationLevels.filter((l) => l !== level),
                            }))
                          }}
                        />
                        <span className="capitalize text-foreground">{level} Partners</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Minimum Rating</h3>
                  <div className="flex gap-2">
                    {[0, 4, 4.5, 4.8].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        className={`rounded-full ${filters.minRating === rating ? "bg-primary text-primary-foreground border-primary" : "border-white/10 bg-white/5"}`}
                        onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                        {rating > 0 && <Star className="w-3 h-3 ml-1 fill-current" />}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </h3>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
                    }
                    min={0}
                    max={5000}
                    step={100}
                    className="mt-2"
                  />
                </div>

                {/* Urgent Availability */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.urgentAvailable}
                      onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, urgentAvailable: !!checked }))}
                    />
                    <div>
                      <span className="text-foreground">Available for urgent jobs</span>
                      <p className="text-xs text-muted-foreground">Providers who can start within 24-48 hours</p>
                    </div>
                  </label>
                </div>

                {/* Response Time */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Response Time</h3>
                  <Select
                    value={filters.responseTime}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, responseTime: value }))}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any response time</SelectItem>
                      <SelectItem value="30min">Under 30 minutes</SelectItem>
                      <SelectItem value="1hour">Under 1 hour</SelectItem>
                      <SelectItem value="2hours">Under 2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Show {filteredProviders.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-xl p-1 bg-white/5">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg ${viewMode === "grid" ? "bg-white/10" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg ${viewMode === "list" ? "bg-white/10" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.verificationLevels.map((level) => (
              <Badge
                key={level}
                variant="outline"
                className="border-white/10 bg-white/5 gap-1 cursor-pointer hover:bg-white/10"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    verificationLevels: prev.verificationLevels.filter((l) => l !== level),
                  }))
                }
              >
                {level}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            {filters.minRating > 0 && (
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 gap-1 cursor-pointer hover:bg-white/10"
                onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
              >
                {filters.minRating}+ stars
                <X className="w-3 h-3" />
              </Badge>
            )}
            {filters.urgentAvailable && (
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 gap-1 cursor-pointer hover:bg-white/10"
                onClick={() => setFilters((prev) => ({ ...prev, urgentAvailable: false }))}
              >
                Urgent available
                <X className="w-3 h-3" />
              </Badge>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="mb-8">
        {isLoading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border bg-muted backdrop-blur animate-pulse dark:border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-muted-foreground/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
                      <div className="h-5 w-40 bg-muted-foreground/20 rounded" />
                      <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted-foreground/20 rounded mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-muted-foreground/20 rounded-full" />
                    <div className="h-6 w-20 bg-muted-foreground/20 rounded-full" />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
                    <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No providers found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={clearFilters} className="border-white/10 bg-transparent">
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {paginatedProviders.map((provider) => {
                const badge = getVerificationBadge(provider.verificationLevel)
                return (
                  <Link key={provider.id} href={`/market/provider/${provider.slug}`}>
                    <Card className="group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full dark:border-white/10">
                      <CardContent className={`p-6 ${viewMode === "list" ? "flex items-center gap-6" : ""}`}>
                        {/* Header */}
                        <div className={`flex items-start gap-4 ${viewMode === "list" ? "flex-1" : "mb-4"}`}>
                          <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={provider.logoUrl || "/placeholder.svg"}
                              alt={provider.businessName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs ${badge.className}`}>
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                {badge.label}
                              </Badge>
                              {provider.featured && (
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {provider.businessName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>
                                {provider.location.city}, {provider.location.state}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description - Grid only */}
                        {viewMode === "grid" && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{provider.shortDescription}</p>
                        )}

                        {/* Stats */}
                        <div className={`flex items-center gap-4 text-sm ${viewMode === "list" ? "" : "mb-4"}`}>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-foreground">{provider.rating}</span>
                            <span className="text-muted-foreground">({provider.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{provider.completedJobs.toLocaleString()} jobs</span>
                          </div>
                        </div>

                        {/* Badges - Grid only */}
                        {viewMode === "grid" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {provider.availableForUrgent && (
                              <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                                <Zap className="w-3 h-3 mr-1 text-amber-400" />
                                Urgent Available
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                              <Clock className="w-3 h-3 mr-1" />
                              {provider.responseTime}
                            </Badge>
                          </div>
                        )}

                        {/* Footer */}
                        <div
                          className={`flex items-center justify-between ${viewMode === "grid" ? "pt-4 border-t border-white/5" : ""}`}
                        >
                          <div>
                            <p className="text-xs text-muted-foreground">Starting from</p>
                            <p className="font-semibold text-foreground">
                              {provider.pricing.startingFrom
                                ? `$${provider.pricing.startingFrom.toLocaleString()}`
                                : "Quote"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            View Profile
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border bg-white/5 dark:border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`border-border ${currentPage === page ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 dark:border-white/10"}`}
                    >
                      {page}
                    </Button>
                  )
                })}
                {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border bg-white/5 dark:border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-medium text-foreground mb-2">Not sure which provider to choose?</h3>
              <p className="text-muted-foreground">Request quotes from multiple providers and compare offers.</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full whitespace-nowrap">
              Request Quotes
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
