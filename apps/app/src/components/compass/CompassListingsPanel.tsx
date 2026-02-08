"use client";

import { motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Bath,
  Bed,
  Car,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { Separator } from "@v1/ui/separator";
import { propertyTypeLabels } from "@/lib/compass-mock-data";
import { cn } from "@v1/ui/utils";
import { type CompassListing, useCompassStore } from "@/store/compass-store";

export interface CompassListingsPanelProps {
  className?: string;
}

export function CompassListingsPanel({
  className,
}: CompassListingsPanelProps) {
  const {
    selectedListingId,
    sortBy,
    setSortBy,
    selectListing,
    setHoveredListing,
    toggleFavorite,
    getFilteredListings,
    setMapCenter,
    setMapZoom,
    listingMode,
  } = useCompassStore();

  const listings = getFilteredListings();

  const handleListingClick = (listing: CompassListing) => {
    if (selectedListingId === listing.id) {
      selectListing(null);
    } else {
      selectListing(listing.id);
      setMapCenter({
        lat: listing.coordinates.lat,
        lng: listing.coordinates.lng,
      });
      setMapZoom(16);
    }
  };

  const formatPrice = (price: number, mode: "sale" | "rent") => {
    if (mode === "sale") {
      if (price >= 1_000_000) {
        return `$${(price / 1_000_000).toFixed(2)}M`;
      }
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}/wk`;
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case "price-low":
        return <ArrowDownAZ className="mr-2 h-4 w-4" />;
      case "price-high":
        return <ArrowUpZA className="mr-2 h-4 w-4" />;
      case "rating":
        return <Star className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background",
        className
      )}
    >
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">
              {listings.length} Properties
            </span>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              {getSortIcon()}
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">
                <div className="flex items-center">
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  Price: Low to High
                </div>
              </SelectItem>
              <SelectItem value="price-high">
                <div className="flex items-center">
                  <ArrowUpZA className="mr-2 h-4 w-4" />
                  Price: High to Low
                </div>
              </SelectItem>
              <SelectItem value="newest">
                <div className="flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Highest Rated
                </div>
              </SelectItem>
              <SelectItem value="nearest">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Nearest
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {listings.length === 0 ? (
            <EmptyState />
          ) : (
            listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListingCard
                  listing={listing}
                  isSelected={selectedListingId === listing.id}
                  listingMode={listingMode}
                  onClick={() => handleListingClick(listing)}
                  onHover={(id) => setHoveredListing(id)}
                  onFavorite={(e, id) => {
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                  formatPrice={formatPrice}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ListingCardProps {
  listing: CompassListing;
  isSelected: boolean;
  listingMode: "sale" | "rent";
  onClick: () => void;
  onHover: (id: string | null) => void;
  onFavorite: (e: React.MouseEvent, id: string) => void;
  formatPrice: (price: number, mode: "sale" | "rent") => string;
}

function ListingCard({
  listing,
  isSelected,
  listingMode,
  onClick,
  onHover,
  onFavorite,
  formatPrice,
}: ListingCardProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl border transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      )}
      onClick={onClick}
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={listing.images[0]}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <MapPin className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Favorite Button */}
        <Button
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
          onClick={(e) => onFavorite(e, listing.id)}
          size="icon"
          variant="ghost"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              listing.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-white"
            )}
          />
        </Button>

        {/* Property Type Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 bg-black/60 text-white backdrop-blur-sm"
        >
          {propertyTypeLabels[listing.propertyType]}
        </Badge>

        {/* New Badge */}
        {listing.isNew && (
          <Badge className="absolute top-2 left-2 bg-emerald-500 text-white">
            New
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <div className="mb-1 text-lg font-bold">
          {formatPrice(listing.price, listingMode)}
        </div>

        {/* Title */}
        <h3 className="mb-1 line-clamp-1 text-sm font-medium">
          {listing.title}
        </h3>

        {/* Location */}
        <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.suburb}, {listing.state}
        </p>

        {/* Features */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {listing.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>{listing.bedrooms}</span>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              <span>{listing.bathrooms}</span>
            </div>
          )}
          {listing.parkingSpaces > 0 && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{listing.parkingSpaces}</span>
            </div>
          )}
          {listing.rating && (
            <div className="ml-auto flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-semibold">No properties found</h3>
      <p className="text-sm text-muted-foreground">
        Try adjusting your filters or search in a different area
      </p>
    </div>
  );
}
