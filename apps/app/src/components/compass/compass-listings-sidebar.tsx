"use client";

import { motion } from "framer-motion";
import {
  Bath,
  Bed,
  Car,
  ChevronLeft,
  Heart,
  MapPin,
  Menu,
  Search,
} from "lucide-react";
import * as React from "react";
import { useMediaQuery } from "usehooks-ts";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { ScrollArea } from "@v1/ui/scroll-area";
import { propertyTypeLabels } from "@/lib/compass-mock-data";
import { cn } from "@v1/ui/utils";
import { type CompassListing, useCompassStore } from "@/store/compass-store";

export function CompassListingsSidebar() {
  const {
    selectedListingId,
    searchQuery,
    selectListing,
    setHoveredListing,
    toggleFavorite,
    setSearchQuery,
    getFilteredListings,
    setMapCenter,
    setMapZoom,
  } = useCompassStore();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isPanelVisible, setIsPanelVisible] = React.useState(true);

  const listings = getFilteredListings();

  const handleListingClick = (listing: CompassListing) => {
    if (selectedListingId === listing.id) {
      selectListing(null);
    } else {
      selectListing(listing.id);
      setMapCenter({ lat: listing.coordinates.lat, lng: listing.coordinates.lng });
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

  if (!(isPanelVisible || isDesktop)) {
    return (
      <Button
        className="fixed top-4 left-4 z-40 h-10 w-10 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl hover:bg-black/90"
        onClick={() => setIsPanelVisible(true)}
        size="icon"
        variant="ghost"
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>
    );
  }

  return (
    <motion.div
      animate={{ x: isPanelVisible ? 0 : -400 }}
      className={cn(
        "fixed top-0 left-0 z-30 h-screen w-96 overflow-hidden",
        "border-white/10 border-r bg-black/80 backdrop-blur-xl",
        !isDesktop && "shadow-2xl"
      )}
      initial={false}
    >
      {/* Header */}
      <div className="border-white/10 border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-lg text-white">
              {listings.length} Properties
            </h2>
          </div>
          {!isDesktop && (
            <Button
              className="h-8 w-8 rounded-lg hover:bg-white/5"
              onClick={() => setIsPanelVisible(false)}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-white/40" />
          <Input
            className="h-10 rounded-lg border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suburbs, addresses..."
            type="text"
            value={searchQuery}
          />
        </div>
      </div>

      {/* Listings */}
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="space-y-2 p-4">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-4 h-12 w-12 text-white/20" />
              <p className="mb-2 font-semibold text-white">
                No properties found
              </p>
              <p className="text-sm text-white/60">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            listings.map((listing) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-xl border transition-all",
                  selectedListingId === listing.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
                initial={{ opacity: 0, y: 20 }}
                key={listing.id}
                onClick={() => handleListingClick(listing)}
                onMouseEnter={() => setHoveredListing(listing.id)}
                onMouseLeave={() => setHoveredListing(null)}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      src={listing.images[0]}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                      <MapPin className="h-8 w-8 text-white/20" />
                    </div>
                  )}

                  {/* Favorite */}
                  <Button
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(listing.id);
                    }}
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
                  <Badge className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm">
                    {propertyTypeLabels[listing.propertyType]}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Price */}
                  <div className="mb-2 font-bold text-lg text-white">
                    {formatPrice(listing.price, listing.listingMode)}
                  </div>

                  {/* Title */}
                  <h3 className="mb-1 line-clamp-1 text-sm text-white">
                    {listing.title}
                  </h3>

                  {/* Location */}
                  <p className="mb-3 flex items-center gap-1 text-white/60 text-xs">
                    <MapPin className="h-3 w-3" />
                    {listing.suburb}, {listing.state}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-3 text-white/80 text-xs">
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
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
