"use client"

import { useState, useEffect } from "react"
import type { VoiceSearchResult, Property } from "@/types/property"
import { PropertyCard } from "./property-card"
import { PropertyDetailModal } from "./property-detail-modal"
import { AdvancedSearchFilters } from "./advanced-search-filters"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { ArrowLeft, Filter, MapPin, Grid, List } from "lucide-react"
import { generateMockProperties } from "@/lib/mock-data"

interface PropertyResultsProps {
  searchResult: VoiceSearchResult
  onBack: () => void
}

export function PropertyResults({ searchResult, onBack }: PropertyResultsProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchParameters, setSearchParameters] = useState(searchResult.parameters)

  useEffect(() => {
    const mockProperties = generateMockProperties(searchParameters, 12)

    setTimeout(() => {
      setProperties(mockProperties)
      setLoading(false)
    }, 1000)
  }, [searchParameters])

  const formatSearchSummary = () => {
    const { parameters } = searchResult
    const parts = []

    if (parameters.location) parts.push(parameters.location)
    if (parameters.propertyType) parts.push(parameters.propertyType)
    if (parameters.bedrooms) parts.push(`${parameters.bedrooms}+ beds`)
    if (parameters.priceRange) {
      const { min, max } = parameters.priceRange
      if (min && max) parts.push(`$${min.toLocaleString()} - $${max.toLocaleString()}`)
      else if (max) parts.push(`Under $${max.toLocaleString()}`)
      else if (min) parts.push(`Over $${min.toLocaleString()}`)
    }

    return parts.join(" • ") || "All properties"
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleFavorite = (propertyId: string) => {
    console.log("[v0] Property favorited:", propertyId)
  }

  const handleShare = (property: Property) => {
    console.log("[v0] Property shared:", property.id)
    if (navigator.share) {
      try {
        navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled share - this is expected behavior
      }
    }
  }

  const handleParametersChange = (newParameters: typeof searchParameters) => {
    setSearchParameters(newParameters)
    setLoading(true)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 mb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Search Results</h1>
          <p className="text-muted-foreground">{formatSearchSummary()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            {viewMode === "grid" ? "List" : "Grid"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-transparent"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search Parameters Display */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-2">Your Search</h3>
            <p className="text-sm text-muted-foreground mb-3">"{searchResult.sourceText}"</p>

            <div className="flex flex-wrap gap-2">
              {searchResult.parameters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {searchResult.parameters.location}
                </Badge>
              )}
              {searchResult.parameters.propertyType && (
                <Badge variant="secondary">{searchResult.parameters.propertyType}</Badge>
              )}
              {searchResult.parameters.bedrooms && (
                <Badge variant="secondary">{searchResult.parameters.bedrooms}+ bedrooms</Badge>
              )}
              {searchResult.parameters.priceRange && (
                <Badge variant="secondary">
                  {searchResult.parameters.priceRange.max
                    ? `Under $${searchResult.parameters.priceRange.max.toLocaleString()}`
                    : "Price range specified"}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-lg font-semibold text-primary">{Math.round(searchResult.confidence * 100)}%</p>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              ×
            </Button>
          </div>
          <AdvancedSearchFilters parameters={searchParameters} onParametersChange={handleParametersChange} />
        </div>
      )}

      {loading ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">Found {properties.length} properties matching your search</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <select className="bg-background border border-border rounded px-2 py-1">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Bedrooms</option>
                <option>Square Footage</option>
              </select>
            </div>
          </div>

          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl"}`}
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

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Properties
            </Button>
          </div>
        </>
      )}

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProperty(null)
        }}
      />
    </section>
  )
}
