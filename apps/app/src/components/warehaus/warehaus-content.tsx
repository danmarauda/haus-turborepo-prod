"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Warehouse,
  Factory,
  Store,
  Building,
  Search,
  MapPin,
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  ArrowRight,
  Heart,
  Share2,
  Ruler,
  Car,
  Truck,
  X,
  Check,
  TrendingUp,
  SquareIcon,
  ChevronRight,
} from "lucide-react"
import { Button } from "@haus/ui/button"
import { Input } from "@haus/ui/input"
import { Badge } from "@haus/ui/badge"
import { Card, CardContent } from "@haus/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@haus/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@haus/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@haus/ui/sheet"
import { Slider } from "@haus/ui/slider"
import { Checkbox } from "@haus/ui/checkbox"
import { Separator } from "@haus/ui/separator"
import type { CommercialProperty, CommercialPropertyType, ZoningType } from "@/types/commercial"

// Property type categories
const propertyCategories = [
  {
    id: "office" as CommercialPropertyType,
    label: "Office",
    icon: Building2,
    count: 234,
    description: "Professional workspaces",
  },
  {
    id: "retail" as CommercialPropertyType,
    label: "Retail",
    icon: Store,
    count: 187,
    description: "Shopfronts & centres",
  },
  {
    id: "warehouse" as CommercialPropertyType,
    label: "Warehouse",
    icon: Warehouse,
    count: 156,
    description: "Storage & distribution",
  },
  {
    id: "industrial" as CommercialPropertyType,
    label: "Industrial",
    icon: Factory,
    count: 98,
    description: "Manufacturing facilities",
  },
  {
    id: "mixed-use" as CommercialPropertyType,
    label: "Mixed Use",
    icon: Building,
    count: 67,
    description: "Multi-purpose buildings",
  },
  {
    id: "land" as CommercialPropertyType,
    label: "Land",
    icon: SquareIcon,
    count: 45,
    description: "Development sites",
  },
]

// Mock commercial properties
const mockCommercialProperties: CommercialProperty[] = [
  {
    id: "1",
    title: "Premium A-Grade Office Tower",
    address: "123 Collins Street",
    suburb: "Melbourne CBD",
    state: "VIC",
    postcode: "3000",
    propertyType: "office",
    listingType: "for-lease",
    leasePrice: 650,
    leaseType: "gross",
    outgoings: 120,
    totalArea: 2500,
    floorArea: 2500,
    floors: 3,
    parkingSpaces: 45,
    ceilingHeight: 3.2,
    airConditioning: true,
    securitySystem: true,
    receptionArea: true,
    disabledAccess: true,
    zoning: "commercial",
    imageUrl: "/modern-office-building-melbourne.jpg",
    description: "Prestigious A-grade office space in the heart of Melbourne's CBD with stunning city views.",
    highlights: ["End of trip facilities", "24/7 access", "On-site management", "Recently refurbished"],
    availableFrom: "Immediate",
    lastUpdated: "2024-01-15",
    agent: {
      name: "Michael Chen",
      company: "HAUS Commercial",
      phone: "0412 345 678",
      email: "michael@haus.com.au",
      image: "/professional-man-headshot.png",
    },
  },
  {
    id: "2",
    title: "High-Clearance Distribution Centre",
    address: "45 Industrial Drive",
    suburb: "Dandenong South",
    state: "VIC",
    postcode: "3175",
    propertyType: "warehouse",
    listingType: "for-sale",
    price: 8500000,
    pricePerSqm: 1700,
    totalArea: 5000,
    landArea: 8000,
    ceilingHeight: 12,
    loadingDocks: 8,
    containerAccess: true,
    parkingSpaces: 30,
    powerSupply: "3-phase 500amp",
    sprinklerSystem: true,
    securitySystem: true,
    zoning: "industrial",
    imageUrl: "/large-warehouse-industrial-facility.jpg",
    description: "Modern high-clearance warehouse with excellent truck access and multiple loading facilities.",
    highlights: ["12m clear height", "8 loading docks", "Container access", "Hardstand yard"],
    lastUpdated: "2024-01-14",
    agent: {
      name: "Sarah Williams",
      company: "HAUS Industrial",
      phone: "0423 456 789",
      email: "sarah@haus.com.au",
      image: "/professional-woman-headshot.png",
    },
  },
  {
    id: "3",
    title: "Prime Retail Strip Shop",
    address: "78 Chapel Street",
    suburb: "South Yarra",
    state: "VIC",
    postcode: "3141",
    propertyType: "retail",
    listingType: "for-lease",
    leasePrice: 850,
    leaseType: "net",
    outgoings: 80,
    totalArea: 180,
    floorArea: 180,
    ceilingHeight: 4,
    airConditioning: true,
    disabledAccess: true,
    zoning: "retail",
    imageUrl: "/retail-shop-front-chapel-street.jpg",
    description: "High-exposure retail space on one of Melbourne's premier shopping strips.",
    highlights: ["High foot traffic", "Street frontage", "Rear access", "Fit-out included"],
    availableFrom: "March 2024",
    lastUpdated: "2024-01-12",
    agent: {
      name: "David Park",
      company: "HAUS Retail",
      phone: "0434 567 890",
      email: "david@haus.com.au",
      image: "/professional-asian-man-headshot.png",
    },
  },
  {
    id: "4",
    title: "Food Manufacturing Facility",
    address: "22 Production Way",
    suburb: "Laverton North",
    state: "VIC",
    postcode: "3026",
    propertyType: "industrial",
    listingType: "for-sale",
    price: 12500000,
    pricePerSqm: 2083,
    totalArea: 6000,
    landArea: 12000,
    ceilingHeight: 8,
    loadingDocks: 6,
    parkingSpaces: 50,
    powerSupply: "3-phase 1000amp",
    sprinklerSystem: true,
    securitySystem: true,
    airConditioning: true,
    zoning: "industrial",
    councilApproved: true,
    imageUrl: "/food-manufacturing-facility-industrial.jpg",
    description: "Purpose-built food manufacturing facility with all necessary certifications and cold storage.",
    highlights: ["Food-grade certified", "Cold storage", "Office component", "Hardstand"],
    lastUpdated: "2024-01-10",
    agent: {
      name: "Emma Thompson",
      company: "HAUS Industrial",
      phone: "0445 678 901",
      email: "emma@haus.com.au",
      image: "/professional-blonde-woman-headshot.png",
    },
  },
  {
    id: "5",
    title: "Boutique Office Suite",
    address: "55 Flinders Lane",
    suburb: "Melbourne CBD",
    state: "VIC",
    postcode: "3000",
    propertyType: "office",
    listingType: "for-lease",
    leasePrice: 550,
    leaseType: "gross",
    outgoings: 0,
    totalArea: 350,
    floorArea: 350,
    ceilingHeight: 3,
    parkingSpaces: 4,
    airConditioning: true,
    kitchenette: true,
    showers: true,
    disabledAccess: true,
    zoning: "commercial",
    imageUrl: "/boutique-office-space-modern-interior.jpg",
    description: "Stylish boutique office in heritage building with modern fit-out and natural light.",
    highlights: ["Natural light", "Heritage character", "Modern fit-out", "Bike storage"],
    availableFrom: "February 2024",
    lastUpdated: "2024-01-08",
    agent: {
      name: "Michael Chen",
      company: "HAUS Commercial",
      phone: "0412 345 678",
      email: "michael@haus.com.au",
      image: "/professional-man-headshot.png",
    },
  },
  {
    id: "6",
    title: "Development Site - Mixed Use",
    address: "100 Victoria Street",
    suburb: "Richmond",
    state: "VIC",
    postcode: "3121",
    propertyType: "land",
    listingType: "for-sale",
    price: 15000000,
    totalArea: 2800,
    landArea: 2800,
    zoning: "mixed-use",
    permitReady: true,
    councilApproved: true,
    imageUrl: "/vacant-development-site-urban.jpg",
    description: "Prime development site with approved plans for 12-storey mixed-use development.",
    highlights: ["Permit approved", "12 storeys", "Mixed-use zoning", "Corner position"],
    lastUpdated: "2024-01-05",
    agent: {
      name: "James Mitchell",
      company: "HAUS Developments",
      phone: "0456 789 012",
      email: "james@haus.com.au",
      image: "/professional-man-suit-headshot.png",
    },
  },
]

// Format price for display
const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`
  }
  return `$${price.toLocaleString()}`
}

// Format area for display
const formatArea = (area: number) => {
  return `${area.toLocaleString()} sqm`
}

export function WAREHAUSContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<CommercialPropertyType | "all">("all")
  const [listingType, setListingType] = useState<"all" | "for-sale" | "for-lease">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState([0, 20000000])
  const [areaRange, setAreaRange] = useState([0, 10000])
  const [savedProperties, setSavedProperties] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Advanced filter states
  const [minCeilingHeight, setMinCeilingHeight] = useState<number | undefined>()
  const [minLoadingDocks, setMinLoadingDocks] = useState<number | undefined>()
  const [requireContainerAccess, setRequireContainerAccess] = useState(false)
  const [requireAirCon, setRequireAirCon] = useState(false)
  const [selectedZoning, setSelectedZoning] = useState<ZoningType[]>([])

  // Filter properties
  const filteredProperties = useMemo(() => {
    return mockCommercialProperties.filter((property) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          property.title.toLowerCase().includes(query) ||
          property.suburb.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategory !== "all" && property.propertyType !== selectedCategory) {
        return false
      }

      // Listing type filter
      if (listingType !== "all" && property.listingType !== listingType) {
        return false
      }

      // Price range
      const propertyPrice = property.price || (property.leasePrice ? property.leasePrice * 12 * property.totalArea : 0)
      const minPrice = priceRange[0] ?? 0
      const maxPrice = priceRange[1] ?? Number.POSITIVE_INFINITY
      if (propertyPrice < minPrice || propertyPrice > maxPrice) {
        return false
      }

      // Area range
      const minArea = areaRange[0] ?? 0
      const maxArea = areaRange[1] ?? Number.POSITIVE_INFINITY
      if (property.totalArea < minArea || property.totalArea > maxArea) {
        return false
      }

      // Ceiling height
      if (minCeilingHeight && (!property.ceilingHeight || property.ceilingHeight < minCeilingHeight)) {
        return false
      }

      // Loading docks
      if (minLoadingDocks && (!property.loadingDocks || property.loadingDocks < minLoadingDocks)) {
        return false
      }

      // Container access
      if (requireContainerAccess && !property.containerAccess) {
        return false
      }

      // Air conditioning
      if (requireAirCon && !property.airConditioning) {
        return false
      }

      return true
    })
  }, [
    searchQuery,
    selectedCategory,
    listingType,
    priceRange,
    areaRange,
    minCeilingHeight,
    minLoadingDocks,
    requireContainerAccess,
    requireAirCon,
  ])

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties]
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "area-large":
        return sorted.sort((a, b) => b.totalArea - a.totalArea)
      case "area-small":
        return sorted.sort((a, b) => a.totalArea - b.totalArea)
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    }
  }, [filteredProperties, sortBy])

  const toggleSaved = (id: string) => {
    setSavedProperties((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setListingType("all")
    setPriceRange([0, 20000000])
    setAreaRange([0, 10000])
    setMinCeilingHeight(undefined)
    setMinLoadingDocks(undefined)
    setRequireContainerAccess(false)
    setRequireAirCon(false)
    setSelectedZoning([])
  }

  const activeFiltersCount = [
    selectedCategory !== "all",
    listingType !== "all",
    (priceRange[0] ?? 0) > 0 || (priceRange[1] ?? 20000000) < 20000000,
    (areaRange[0] ?? 0) > 0 || (areaRange[1] ?? 10000) < 10000,
    minCeilingHeight,
    minLoadingDocks,
    requireContainerAccess,
    requireAirCon,
    selectedZoning.length > 0,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[32px] bg-card border border-border overflow-hidden">
            <div className="relative p-8 md:p-12">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

              <div className="relative">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  <Warehouse className="w-3 h-3 mr-1" />
                  Commercial & Industrial
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">WAREHAUS</h1>

                <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                  Discover premium commercial, industrial, and warehouse properties across Australia. From modern office
                  spaces to high-clearance distribution centres.
                </p>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by suburb, address, or property type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 bg-background border-border rounded-xl text-base"
                    />
                  </div>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full md:w-[200px] h-14 bg-background border-border rounded-xl">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Australia</SelectItem>
                      <SelectItem value="vic">Victoria</SelectItem>
                      <SelectItem value="nsw">New South Wales</SelectItem>
                      <SelectItem value="qld">Queensland</SelectItem>
                      <SelectItem value="wa">Western Australia</SelectItem>
                      <SelectItem value="sa">South Australia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Search
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-foreground">787</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">$2.4B</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <div className="text-sm text-muted-foreground">Warehouses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">234</div>
                    <div className="text-sm text-muted-foreground">Office Spaces</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Type Categories */}
      <section className="px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Browse by Type</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View all types
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {propertyCategories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id

              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(isSelected ? "all" : category.id)}
                  className={`relative p-4 rounded-2xl border transition-all text-left ${
                    isSelected ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="font-medium text-foreground">{category.label}</div>
                  <div className="text-xs text-muted-foreground">{category.count} properties</div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Listing Type Tabs */}
              <Tabs value={listingType} onValueChange={(v) => setListingType(v as any)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="for-sale">For Sale</TabsTrigger>
                  <TabsTrigger value="for-lease">For Lease</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filters Button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative bg-transparent">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your commercial property search</SheetDescription>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Price Range</label>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">{formatPrice(priceRange[0] ?? 0)}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">{formatPrice(priceRange[1] ?? 20000000)}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={20000000}
                        step={100000}
                        className="mt-2"
                      />
                    </div>

                    <Separator />

                    {/* Area Range */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Total Area (sqm)</label>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">{formatArea(areaRange[0] ?? 0)}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">{formatArea(areaRange[1] ?? 10000)}</span>
                      </div>
                      <Slider
                        value={areaRange}
                        onValueChange={setAreaRange}
                        min={0}
                        max={10000}
                        step={100}
                        className="mt-2"
                      />
                    </div>

                    <Separator />

                    {/* Warehouse/Industrial Specific */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Warehouse Features</label>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Min. Ceiling Height (m)</label>
                          <Select
                            value={minCeilingHeight?.toString() || "any"}
                            onValueChange={(v) => setMinCeilingHeight(v ? Number.parseInt(v) : undefined)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Any height" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any height</SelectItem>
                              <SelectItem value="6">6m+</SelectItem>
                              <SelectItem value="8">8m+</SelectItem>
                              <SelectItem value="10">10m+</SelectItem>
                              <SelectItem value="12">12m+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Min. Loading Docks</label>
                          <Select
                            value={minLoadingDocks?.toString() || "any"}
                            onValueChange={(v) => setMinLoadingDocks(v ? Number.parseInt(v) : undefined)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="2">2+</SelectItem>
                              <SelectItem value="4">4+</SelectItem>
                              <SelectItem value="6">6+</SelectItem>
                              <SelectItem value="8">8+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="container"
                            checked={requireContainerAccess}
                            onCheckedChange={(checked) => setRequireContainerAccess(checked as boolean)}
                          />
                          <label htmlFor="container" className="text-sm text-foreground">
                            Container access required
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Building Features */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Building Features</label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="aircon"
                            checked={requireAirCon}
                            onCheckedChange={(checked) => setRequireAirCon(checked as boolean)}
                          />
                          <label htmlFor="aircon" className="text-sm text-foreground">
                            Air conditioning
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 bg-transparent" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button
                        className="flex-1 bg-primary text-primary-foreground"
                        onClick={() => setFiltersOpen(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-3 h-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {sortedProperties.length} {sortedProperties.length === 1 ? "property" : "properties"}
              </span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="area-large">Area: Large to Small</SelectItem>
                  <SelectItem value="area-small">Area: Small to Large</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none h-9 w-9"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Property Grid */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedProperties.map((property, index) => (
                  <CommercialPropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    isSaved={savedProperties.includes(property.id)}
                    onToggleSave={() => toggleSaved(property.id)}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === "list" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {sortedProperties.map((property, index) => (
                  <CommercialPropertyListItem
                    key={property.id}
                    property={property}
                    index={index}
                    isSaved={savedProperties.includes(property.id)}
                    onToggleSave={() => toggleSaved(property.id)}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === "map" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] rounded-2xl bg-muted border border-border flex items-center justify-center"
              >
                <div className="text-center">
                  <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Map view coming soon</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sortedProperties.length === 0 && (
            <div className="text-center py-16">
              <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">List Your Commercial Property</h3>
                <p className="text-muted-foreground mb-6">
                  Reach thousands of qualified buyers and tenants looking for commercial properties.
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  List Property
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Commercial Property Valuation</h3>
                <p className="text-muted-foreground mb-6">
                  Get an accurate market valuation for your commercial property from our experts.
                </p>
                <Button variant="outline">
                  Request Valuation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

// Commercial Property Card Component
function CommercialPropertyCard({
  property,
  index,
  isSaved,
  onToggleSave,
}: {
  property: CommercialProperty
  index: number
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={property.imageUrl || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              className={`${
                property.listingType === "for-sale" ? "bg-emerald-500/90 text-white" : "bg-blue-500/90 text-white"
              }`}
            >
              {property.listingType === "for-sale" ? "For Sale" : "For Lease"}
            </Badge>
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-border">
              {propertyCategories.find((c) => c.id === property.propertyType)?.label}
            </Badge>
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault()
                onToggleSave()
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Share2 className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {property.suburb}, {property.state}
            </p>
          </div>

          {/* Price */}
          <div className="mb-4">
            {property.listingType === "for-sale" ? (
              <div className="text-xl font-bold text-foreground">
                {formatPrice(property.price!)}
                {property.pricePerSqm && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">${property.pricePerSqm}/sqm</span>
                )}
              </div>
            ) : (
              <div className="text-xl font-bold text-foreground">
                ${property.leasePrice}/sqm/year
                {property.outgoings && property.outgoings > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    +${property.outgoings} outgoings
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              {formatArea(property.totalArea)}
            </div>
            {property.ceilingHeight && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {property.ceilingHeight}m clear
              </div>
            )}
            {property.parkingSpaces && (
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                {property.parkingSpaces} parks
              </div>
            )}
            {property.loadingDocks && (
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                {property.loadingDocks} docks
              </div>
            )}
          </div>

          {/* Highlights */}
          {property.highlights && property.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
              {property.highlights.slice(0, 3).map((highlight, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Commercial Property List Item Component
function CommercialPropertyListItem({
  property,
  index,
  isSaved,
  onToggleSave,
}: {
  property: CommercialProperty
  index: number
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-72 aspect-[16/10] md:aspect-auto md:h-auto overflow-hidden">
            <img
              src={property.imageUrl || "/placeholder.svg"}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <Badge
              className={`absolute top-3 left-3 ${
                property.listingType === "for-sale" ? "bg-emerald-500/90 text-white" : "bg-blue-500/90 text-white"
              }`}
            >
              {property.listingType === "for-sale" ? "For Sale" : "For Lease"}
            </Badge>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4 md:p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {propertyCategories.find((c) => c.id === property.propertyType)?.label}
                  </Badge>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.address}, {property.suburb}, {property.state} {property.postcode}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      onToggleSave()
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                {property.listingType === "for-sale" ? (
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(property.price!)}
                    {property.pricePerSqm && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ${property.pricePerSqm}/sqm
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    ${property.leasePrice}/sqm/year
                    {property.outgoings && property.outgoings > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        +${property.outgoings} outgoings
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{formatArea(property.totalArea)}</span>
                </div>
                {property.ceilingHeight && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{property.ceilingHeight}m clear</span>
                  </div>
                )}
                {property.parkingSpaces && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{property.parkingSpaces} parks</span>
                  </div>
                )}
                {property.loadingDocks && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{property.loadingDocks} docks</span>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {property.highlights && property.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border">
                  {property.highlights.map((highlight, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
