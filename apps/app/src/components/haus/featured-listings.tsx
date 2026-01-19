"use client"

import Link from "next/link"
import { Button } from "@haus/ui/button"
import { ArrowUpRight } from "lucide-react"
import { generateMockProperties } from "@/lib/mock-data"
import { PropertyCard } from "./property-card"
import { PropertyDetailModal } from "./property-detail-modal"
import { useState, useEffect } from "react"
import type { Property } from "@/types/property"

export function FeaturedListings() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())

  useEffect(() => {
    const featuredProperties = generateMockProperties({}, 6)
    setProperties(featuredProperties)

    const saved = localStorage.getItem("haus_saved_properties")
    if (saved) {
      setSavedProperties(new Set(JSON.parse(saved)))
    }
  }, [])

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleFavorite = (propertyId: string) => {
    const newSaved = new Set(savedProperties)
    if (newSaved.has(propertyId)) {
      newSaved.delete(propertyId)
    } else {
      newSaved.add(propertyId)
    }
    setSavedProperties(newSaved)
    localStorage.setItem("haus_saved_properties", JSON.stringify([...newSaved]))
  }

  const handleShare = (property: Property) => {
    if (navigator.share) {
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
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 mb-8">
      <div className="relative overflow-hidden rounded-[40px] border border-border bg-card backdrop-blur shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] dark:border-white/10">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-transparent dark:from-white/10"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight">Featured Listings</h2>
            <Link href="/search">
              <Button
                variant="ghost"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 border border-border dark:border-white/10"
              >
                <span>View all</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>

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
