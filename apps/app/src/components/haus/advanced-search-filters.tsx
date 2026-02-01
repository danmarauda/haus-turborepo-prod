"use client"

import { useState } from "react"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Checkbox } from "@v1/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select"
import type { SearchParameters, AmenityType, PropertyFeature, PropertyCondition } from "@/types/property"

interface AdvancedSearchFiltersProps {
  parameters: SearchParameters
  onParametersChange: (parameters: SearchParameters) => void
  className?: string
}

export function AdvancedSearchFilters({ parameters, onParametersChange, className }: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const amenityOptions: { value: AmenityType; label: string }[] = [
    { value: "pool", label: "Swimming Pool" },
    { value: "spa", label: "Spa/Hot Tub" },
    { value: "gym", label: "Gym/Fitness Center" },
    { value: "tennis-court", label: "Tennis Court" },
    { value: "garage", label: "Garage" },
    { value: "carport", label: "Carport" },
    { value: "garden", label: "Garden" },
    { value: "balcony", label: "Balcony" },
    { value: "fireplace", label: "Fireplace" },
    { value: "air-conditioning", label: "Air Conditioning" },
    { value: "dishwasher", label: "Dishwasher" },
    { value: "laundry", label: "Laundry" },
    { value: "walk-in-closet", label: "Walk-in Closet" },
    { value: "study", label: "Study/Office" },
    { value: "security-system", label: "Security System" },
    { value: "elevator", label: "Elevator" },
    { value: "pet-friendly", label: "Pet Friendly" },
    { value: "furnished", label: "Furnished" },
    { value: "solar-panels", label: "Solar Panels" },
    { value: "smart-home", label: "Smart Home" },
  ]

  const featureOptions: { value: PropertyFeature; label: string }[] = [
    { value: "corner-lot", label: "Corner Lot" },
    { value: "waterfront", label: "Waterfront" },
    { value: "mountain-view", label: "Mountain View" },
    { value: "city-view", label: "City View" },
    { value: "gated-community", label: "Gated Community" },
    { value: "new-construction", label: "New Construction" },
    { value: "recently-renovated", label: "Recently Renovated" },
    { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
    { value: "single-story", label: "Single Story" },
    { value: "basement", label: "Basement" },
  ]

  const updateParameter = (key: keyof SearchParameters, value: any) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    })
  }

  const toggleAmenity = (amenity: AmenityType) => {
    const current = parameters.amenities || []
    const updated = current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity]
    updateParameter("amenities", updated.length > 0 ? updated : undefined)
  }

  const toggleFeature = (feature: PropertyFeature) => {
    const current = parameters.features || []
    const updated = current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature]
    updateParameter("features", updated.length > 0 ? updated : undefined)
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="square-footage">Square Footage (min)</Label>
            <Input
              id="square-footage"
              type="number"
              placeholder="e.g. 1000"
              value={parameters.squareFootage?.min || ""}
              onChange={(e) =>
                updateParameter(
                  "squareFootage",
                  e.target.value ? { ...parameters.squareFootage, min: Number.parseInt(e.target.value) } : undefined,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="year-built">Year Built (min)</Label>
            <Input
              id="year-built"
              type="number"
              placeholder="e.g. 2000"
              value={parameters.yearBuilt?.min || ""}
              onChange={(e) =>
                updateParameter(
                  "yearBuilt",
                  e.target.value ? { ...parameters.yearBuilt, min: Number.parseInt(e.target.value) } : undefined,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="condition">Property Condition</Label>
            <Select
              value={parameters.condition || ""}
              onValueChange={(value) => updateParameter("condition", value as PropertyCondition)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="needs-work">Needs Work</SelectItem>
                <SelectItem value="fixer-upper">Fixer Upper</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="w-full">
          {isExpanded ? "Hide" : "Show"} Advanced Filters
        </Button>

        {isExpanded && (
          <div className="space-y-6 border-t pt-6">
            {/* Amenities */}
            <div>
              <Label className="text-base font-semibold">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.value}
                      checked={parameters.amenities?.includes(amenity.value) || false}
                      onCheckedChange={() => toggleAmenity(amenity.value)}
                    />
                    <Label htmlFor={amenity.value} className="text-sm">
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Features */}
            <div>
              <Label className="text-base font-semibold">Property Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {featureOptions.map((feature) => (
                  <div key={feature.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.value}
                      checked={parameters.features?.includes(feature.value) || false}
                      onCheckedChange={() => toggleFeature(feature.value)}
                    />
                    <Label htmlFor={feature.value} className="text-sm">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoa-max">Max HOA Fees (monthly)</Label>
                <Input
                  id="hoa-max"
                  type="number"
                  placeholder="e.g. 500"
                  value={parameters.hoaFees?.max || ""}
                  onChange={(e) =>
                    updateParameter(
                      "hoaFees",
                      e.target.value ? { ...parameters.hoaFees, max: Number.parseInt(e.target.value) } : undefined,
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="property-tax-max">Max Property Tax (annual)</Label>
                <Input
                  id="property-tax-max"
                  type="number"
                  placeholder="e.g. 10000"
                  value={parameters.propertyTax?.max || ""}
                  onChange={(e) =>
                    updateParameter(
                      "propertyTax",
                      e.target.value ? { ...parameters.propertyTax, max: Number.parseInt(e.target.value) } : undefined,
                    )
                  }
                />
              </div>
            </div>

            {/* Listing Preferences */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Listing Preferences</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="virtual-tour"
                    checked={parameters.virtualTourAvailable || false}
                    onCheckedChange={(checked) => updateParameter("virtualTourAvailable", checked || undefined)}
                  />
                  <Label htmlFor="virtual-tour">Virtual Tour Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-house"
                    checked={parameters.openHouseScheduled || false}
                    onCheckedChange={(checked) => updateParameter("openHouseScheduled", checked || undefined)}
                  />
                  <Label htmlFor="open-house">Open House Scheduled</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-listing"
                    checked={parameters.newListing || false}
                    onCheckedChange={(checked) => updateParameter("newListing", checked || undefined)}
                  />
                  <Label htmlFor="new-listing">New Listing (Last 7 Days)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="price-reduced"
                    checked={parameters.priceReduced || false}
                    onCheckedChange={(checked) => updateParameter("priceReduced", checked || undefined)}
                  />
                  <Label htmlFor="price-reduced">Price Recently Reduced</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(parameters.amenities?.length || parameters.features?.length || parameters.condition) && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {parameters.amenities?.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenityOptions.find((a) => a.value === amenity)?.label} ×
                </Badge>
              ))}
              {parameters.features?.map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleFeature(feature)}
                >
                  {featureOptions.find((f) => f.value === feature)?.label} ×
                </Badge>
              ))}
              {parameters.condition && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateParameter("condition", undefined)}
                >
                  {parameters.condition} ×
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
