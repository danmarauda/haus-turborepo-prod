"use client";

import { useQuery } from "convex/react";
import {
  Building2,
  ChevronRight,
  Clock,
  Filter,
  Heart,
  Home,
  LayoutGrid,
  LayoutList,
  Mountain,
  Sparkles,
  Star,
  Trees,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/haus/property-card";
import { PropertyDetailModal } from "@/components/haus/property-detail-modal";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent } from "@v1/ui/card";
import { api } from "@v1/backend/convex/_generated/api";
import type { Property } from "@/types/property";
import Image from "next/image";

// Curated neighborhood collections
const neighborhoodCollections = [
  {
    id: "sydney-harbour",
    name: "Sydney Harbour",
    description: "Waterfront luxury with iconic views",
    imageUrl: "/sydney-harbour-waterfront-properties-luxury-homes.jpg",
    propertyCount: 48,
    avgPrice: 4_500_000,
    trending: true,
    tags: ["Waterfront", "Luxury", "Investment"],
  },
  {
    id: "melbourne-inner",
    name: "Melbourne Inner City",
    description: "Urban sophistication meets heritage charm",
    imageUrl: "/melbourne-inner-city-heritage-terrace-houses.jpg",
    propertyCount: 124,
    avgPrice: 1_800_000,
    trending: false,
    tags: ["Heritage", "Urban", "Culture"],
  },
  {
    id: "gold-coast",
    name: "Gold Coast Beachfront",
    description: "Sun-soaked coastal living at its finest",
    imageUrl: "/gold-coast-beachfront-apartments-ocean-view.jpg",
    propertyCount: 89,
    avgPrice: 2_200_000,
    trending: true,
    tags: ["Beachfront", "Resort", "Lifestyle"],
  },
  {
    id: "perth-hills",
    name: "Perth Hills & Valleys",
    description: "Serene escapes with stunning bushland",
    imageUrl: "/perth-hills-luxury-homes-bushland-views.jpg",
    propertyCount: 56,
    avgPrice: 1_200_000,
    trending: false,
    tags: ["Nature", "Privacy", "Family"],
  },
  {
    id: "brisbane-river",
    name: "Brisbane Riverfront",
    description: "Subtropical elegance along the river",
    imageUrl: "/brisbane-riverfront-homes-subtropical-architecture.jpg",
    propertyCount: 67,
    avgPrice: 2_800_000,
    trending: true,
    tags: ["Riverfront", "Modern", "Growth"],
  },
  {
    id: "hobart-historic",
    name: "Hobart Historic Quarter",
    description: "Tasmania's heritage gems reimagined",
    imageUrl: "/hobart-historic-sandstone-homes-heritage.jpg",
    propertyCount: 34,
    avgPrice: 950_000,
    trending: false,
    tags: ["Heritage", "Character", "Emerging"],
  },
];

// Property categories for exploration
const propertyCategories = [
  {
    id: "luxury-estates",
    name: "Luxury Estates",
    icon: Sparkles,
    description: "Premier properties above $3M",
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/30",
    count: 234,
  },
  {
    id: "waterfront",
    name: "Waterfront Living",
    icon: Waves,
    description: "Ocean, harbour & river properties",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30",
    count: 156,
  },
  {
    id: "urban-apartments",
    name: "Urban Apartments",
    icon: Building2,
    description: "City living at its finest",
    color: "from-violet-500/20 to-violet-600/5",
    borderColor: "border-violet-500/30",
    count: 412,
  },
  {
    id: "family-homes",
    name: "Family Homes",
    icon: Home,
    description: "Spacious homes for growing families",
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/30",
    count: 589,
  },
  {
    id: "rural-retreats",
    name: "Rural Retreats",
    icon: Trees,
    description: "Acreage and country living",
    color: "from-green-500/20 to-green-600/5",
    borderColor: "border-green-500/30",
    count: 178,
  },
  {
    id: "mountain-escapes",
    name: "Mountain Escapes",
    icon: Mountain,
    description: "Alpine and highland properties",
    color: "from-slate-500/20 to-slate-600/5",
    borderColor: "border-slate-500/30",
    count: 92,
  },
];

// Lifestyle filters
const lifestyleFilters = [
  { id: "first-home", label: "First Home Buyer", icon: Home },
  { id: "investor", label: "Investment Ready", icon: TrendingUp },
  { id: "downsizer", label: "Downsizer", icon: Sparkles },
  { id: "family", label: "Family Friendly", icon: Heart },
  { id: "luxury", label: "Premium & Luxury", icon: Star },
  { id: "eco", label: "Eco-Conscious", icon: Trees },
];

export function ExploreContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set()
  );

  // Fetch properties from Convex
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
  // isLoading can be used for loading states: convexProperties === undefined

  // Derive trending and recently viewed from available properties
  const trendingProperties = allProperties.slice(0, 8);
  const recentlyViewed = allProperties.slice(0, 4);

  useEffect(() => {
    // Load saved properties from localStorage
    const saved = localStorage.getItem("haus_saved_properties");
    if (saved) {
      setSavedProperties(new Set(JSON.parse(saved)));
    }
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleFavorite = (propertyId: string) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(propertyId)) {
      newSaved.delete(propertyId);
    } else {
      newSaved.add(propertyId);
    }
    setSavedProperties(newSaved);
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

  const formatPrice = (price: number) => {
    if (price >= 1_000_000) {
      return `$${(price / 1_000_000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/5 to-transparent" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-medium text-primary text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Curated Collections</span>
              </div>
              <h1 className="font-medium text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
                Explore Properties
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Discover curated collections, trending neighborhoods, and
                handpicked listings tailored to your lifestyle. From waterfront
                luxury to urban apartments, find your perfect match.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className={`rounded-full border-white/10 ${viewMode === "grid" ? "bg-white/10" : "bg-transparent"}`}
                onClick={() => setViewMode("grid")}
                size="sm"
                variant="outline"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                className={`rounded-full border-white/10 ${viewMode === "list" ? "bg-white/10" : "bg-transparent"}`}
                onClick={() => setViewMode("list")}
                size="sm"
                variant="outline"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                className="gap-2 rounded-full border-white/10 bg-transparent"
                size="sm"
                variant="outline"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>

          {/* Lifestyle Quick Filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            {lifestyleFilters.map((filter) => {
              const Icon = filter.icon;
              const isSelected = selectedLifestyle === filter.id;
              return (
                <Button
                  className={`gap-2 rounded-full border-white/10 transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  key={filter.id}
                  onClick={() =>
                    setSelectedLifestyle(isSelected ? null : filter.id)
                  }
                  size="sm"
                  variant="outline"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{filter.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Property Categories */}
      <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_8px_16px_-8px_rgba(0,0,0,0.4)] backdrop-blur dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/5 to-transparent" />
        <div className="relative p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-foreground text-lg tracking-tight">
                Browse by Category
              </h2>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Find properties that match your vision
              </p>
            </div>
            <Button
              className="h-8 gap-1 text-muted-foreground text-xs hover:text-foreground"
              size="sm"
              variant="ghost"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {propertyCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Card
                  className={`group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/20 hover:shadow-md dark:border-white/10 ${
                    isSelected ? "border-primary ring-1 ring-primary" : ""
                  }`}
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : category.id)
                  }
                >
                  <CardContent className="p-3">
                    <div
                      className={`h-8 w-8 rounded-lg bg-linear-to-br ${category.color} ${category.borderColor} mb-2 flex items-center justify-center border transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <h3 className="mb-0.5 truncate font-medium text-foreground text-sm">
                      {category.name}
                    </h3>
                    <p className="truncate text-muted-foreground text-xs">
                      {category.count} listings
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Neighborhood Collections */}
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/5 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-2xl text-foreground tracking-tight">
                Neighborhood Collections
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Curated areas with exceptional lifestyle appeal
              </p>
            </div>
            <Button
              className="gap-1 text-muted-foreground text-sm hover:text-foreground"
              variant="ghost"
            >
              Explore all areas
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {neighborhoodCollections.map((neighborhood) => (
              <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20 dark:border-white/10"
                key={neighborhood.id}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={neighborhood.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={neighborhood.imageUrl || "/placeholder.svg"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Trending Badge */}
                  {neighborhood.trending && (
                    <div className="absolute top-4 left-4">
                      <Badge className="gap-1 border-0 bg-primary/90 text-primary-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="absolute right-0 bottom-0 left-0 p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-medium text-lg text-white">
                        {neighborhood.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        {neighborhood.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {neighborhood.tags.map((tag) => (
                      <span
                        className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-white/80 text-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      {neighborhood.propertyCount} properties
                    </span>
                    <span className="font-medium text-white">
                      Avg. {formatPrice(neighborhood.avgPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Properties */}
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/5 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-linear-to-br from-orange-500/20 to-red-500/10">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="font-medium text-2xl text-foreground tracking-tight">
                  Trending Now
                </h2>
                <p className="text-muted-foreground text-sm">
                  Most viewed properties this week
                </p>
              </div>
            </div>
            <Button
              className="gap-1 text-muted-foreground text-sm hover:text-foreground"
              variant="ghost"
            >
              View all trending
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
          >
            {trendingProperties
              .slice(0, viewMode === "grid" ? 8 : 4)
              .map((property) => (
                <PropertyCard
                  key={property.id}
                  onClick={() => handlePropertyClick(property)}
                  onFavorite={handleFavorite}
                  onShare={handleShare}
                  property={property}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur dark:border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/5 to-transparent" />
          <div className="relative p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-linear-to-br from-blue-500/20 to-indigo-500/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-medium text-2xl text-foreground tracking-tight">
                    Recently Viewed
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Pick up where you left off
                  </p>
                </div>
              </div>
              <Button
                className="gap-1 text-muted-foreground text-sm hover:text-foreground"
                variant="ghost"
              >
                View history
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((property) => (
                <PropertyCard
                  key={property.id}
                  onClick={() => handlePropertyClick(property)}
                  onFavorite={handleFavorite}
                  onShare={handleShare}
                  property={property}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-1 font-semibold text-3xl text-foreground">
                12,450+
              </div>
              <p className="text-muted-foreground text-sm">Active Listings</p>
            </div>
            <div className="text-center">
              <div className="mb-1 font-semibold text-3xl text-foreground">
                48
              </div>
              <p className="text-muted-foreground text-sm">New Today</p>
            </div>
            <div className="text-center">
              <div className="mb-1 font-semibold text-3xl text-foreground">
                $1.2M
              </div>
              <p className="text-muted-foreground text-sm">Median Price</p>
            </div>
            <div className="text-center">
              <div className="mb-1 font-semibold text-3xl text-foreground">
                24 hrs
              </div>
              <p className="text-muted-foreground text-sm">Avg. Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
      />
    </main>
  );
}
