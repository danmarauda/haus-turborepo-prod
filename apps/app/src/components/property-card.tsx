"use client"

import type React from "react"

import type { Property } from "@/types/property"
import { Card, CardContent } from "@haus/ui/card"
import { Badge } from "@haus/ui/badge"
import { Button } from "@haus/ui/button"
import { Heart, Share2, ExternalLink } from "lucide-react"
import { useState } from "react"

interface PropertyCardProps {
  property: Property
  onClick?: () => void
  onFavorite?: (propertyId: string) => void
  onShare?: (property: Property) => void
}

export function PropertyCard({ property, onClick, onFavorite, onShare }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === "for-rent") {
      return `$${price.toLocaleString()}/week`
    }
    return `$${price.toLocaleString()}`
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavorite?.(property.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(property)
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden">
        <img
          src={property.imageUrl || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          <Badge variant={property.listingType === "for-rent" ? "secondary" : "default"} className="text-xs sm:text-xs">
            {property.listingType === "for-rent" ? "For Rent" : "For Sale"}
          </Badge>
          {property.lastPriceChange && (
            <Badge variant="outline" className="bg-green-500/90 text-white border-green-500 text-xs">
              Price Drop
            </Badge>
          )}
          {property.virtualTourUrl && (
            <Badge
              variant="outline"
              className="bg-primary/90 text-primary-foreground border-primary text-xs hidden sm:flex"
            >
              Virtual Tour
            </Badge>
          )}
        </div>

        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-full touch-target"
            onClick={handleFavorite}
          >
            <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-full touch-target"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {property.openHouseDate && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <Badge variant="outline" className="bg-orange-500/90 text-white border-orange-500 text-xs">
              Open {new Date(property.openHouseDate).toLocaleDateString()}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{property.title}</h3>
          <p className="text-muted-foreground text-sm">{property.location}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl sm:text-2xl font-bold text-primary">
            {formatPrice(property.price, property.listingType)}
          </p>
          {property.lastPriceChange && (
            <div className="text-right">
              <p className="text-xs sm:text-sm text-green-600 font-medium">
                -${(property.lastPriceChange.previousPrice - property.lastPriceChange.currentPrice).toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Price drop</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
          <span className="whitespace-nowrap">🛏️ {property.bedrooms} beds</span>
          <span className="whitespace-nowrap">🚿 {property.bathrooms} baths</span>
          <span className="whitespace-nowrap">📐 {property.squareFootage}m²</span>
          {property.yearBuilt && <span className="whitespace-nowrap hidden sm:inline">🏗️ {property.yearBuilt}</span>}
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {property.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
              {amenity.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
              +{property.amenities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 bg-transparent h-11 sm:h-10 touch-target"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            View Details
          </Button>
          {property.virtualTourUrl && (
            <Button size="sm" variant="secondary" className="h-11 sm:h-10 px-4 sm:px-3 touch-target">
              <ExternalLink className="w-4 h-4 sm:mr-0" />
              <span className="sm:hidden ml-2">Virtual Tour</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
