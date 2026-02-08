"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@v1/backend/convex/_generated/api";
import type { Property } from "@/types/property";
import { LoadingState, SavedEmptyState } from "@/components/empty-state";
import { PropertyCard } from "@/components/haus/property-card";
import { PropertyDetailModal } from "@/components/haus/property-detail-modal";
import { Button } from "@v1/ui/button";

export function SavedProperties() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch all properties from Convex
  const convexProperties = useQuery(api.properties.list, {});
  const allProperties: Property[] = convexProperties
    ? (convexProperties as any[]).map((p: any) => ({
        id: p._id,
        title: p.title || "",
        price: p.price || 0,
        location: p.location || "",
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        squareFootage: p.squareFootage || 0,
        propertyType: p.propertyType || "",
        listingType: p.listingType || "for-sale",
        imageUrl: p.imageUrl || "",
        amenities: p.amenities || [],
        description: p.description || "",
        yearBuilt: p.yearBuilt,
        lotSize: p.lotSize,
        features: p.features,
        condition: p.condition,
        hoaFees: p.hoaFees,
        propertyTax: p.propertyTax,
        schoolDistrict: p.schoolDistrict,
        walkScore: p.walkScore,
        transitScore: p.transitScore,
        occupancyStatus: p.occupancyStatus,
        virtualTourUrl: p.virtualTourUrl,
        openHouseDate: p.openHouseDate,
        listingDate: p.listingDate,
        lastPriceChange: p.lastPriceChange,
        coordinates: p.coordinates,
        agent: p.agent,
      }))
    : [];
  const isLoading = convexProperties === undefined || !isInitialized;

  // Filter to saved properties
  const savedProperties = allProperties.filter((prop) => savedIds.has(prop.id));

  useEffect(() => {
    // Load saved property IDs from localStorage
    const saved = localStorage.getItem("haus_saved_properties");
    if (saved) {
      setSavedIds(new Set(JSON.parse(saved)));
    }
    setIsInitialized(true);
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleRemoveFromSaved = (propertyId: string) => {
    const newSaved = new Set(savedIds);
    newSaved.delete(propertyId);
    setSavedIds(newSaved);
    localStorage.setItem(
      "haus_saved_properties",
      JSON.stringify([...newSaved])
    );
  };

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
        });
    }
  };

  const clearAllSaved = () => {
    setSavedIds(new Set());
    localStorage.removeItem("haus_saved_properties");
  };

  return (
    <section className="mx-auto mt-8 mb-8 max-w-7xl px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="flex items-center gap-3 font-bold text-3xl text-foreground">
              <Heart className="h-8 w-8 text-primary" />
              Saved Properties
            </h1>
            <p className="mt-1 text-muted-foreground">
              {savedProperties.length}{" "}
              {savedProperties.length === 1 ? "property" : "properties"} saved
            </p>
          </div>
        </div>

        {savedProperties.length > 0 && (
          <Button
            className="flex items-center gap-2 bg-transparent text-destructive hover:text-destructive"
            onClick={clearAllSaved}
            variant="outline"
          >
            <Trash2 className="size-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingState count={6} />
      ) : savedProperties.length === 0 ? (
        <SavedEmptyState onAction={() => window.location.href = "/search"} />
      ) : (
        <>
          {/* Saved Properties Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((property) => (
              <div className="group relative" key={property.id}>
                <PropertyCard
                  onClick={() => handlePropertyClick(property)}
                  onFavorite={handleRemoveFromSaved}
                  onShare={handleShare}
                  property={property}
                />

                {/* Remove from saved overlay */}
                <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    className="h-8 w-8 bg-destructive/90 p-0 hover:bg-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromSaved(property.id);
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {savedProperties.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Showing all saved properties
              </p>
            </div>
          )}
        </>
      )}

      {/* Property Detail Modal */}
      <PropertyDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
      />
    </section>
  );
}
