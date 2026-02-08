"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Building2,
  Circle,
  Home,
  Map,
  MapPin,
  Minus,
  Mountain,
  Navigation,
  Plus,
  Satellite,
  Search,
  Sliders,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu";
import { Input } from "@v1/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@v1/ui/popover";
import { Separator } from "@v1/ui/separator";
import { Slider } from "@v1/ui/slider";
import {
  australianCities,
  type PropertyType,
  propertyTypeLabels,
} from "@/lib/compass-mock-data";
import { cn } from "@v1/ui/utils";
import { useCompassStore } from "@/store/compass-store";

const mapStyles = [
  {
    id: "default",
    name: "Default",
    icon: Circle,
    description: "Follows theme",
  },
  { id: "streets", name: "Streets", icon: Map, description: "Detailed roads" },
  {
    id: "outdoors",
    name: "Outdoors",
    icon: Mountain,
    description: "Terrain & trails",
  },
  {
    id: "satellite",
    name: "Satellite",
    icon: Satellite,
    description: "Aerial view",
  },
] as const;

const propertyTypes: PropertyType[] = [
  "house",
  "apartment",
  "townhouse",
  "villa",
  "unit",
  "land",
];

export function CompassFloatingNavbar() {
  const [showFilters, setShowFilters] = useState(false);
  const [showAIAgent, setShowAIAgent] = useState(false);

  const {
    mapZoom,
    setMapZoom,
    setMapCenter,
    setUserLocation,
    mapStyle,
    setMapStyle,
    listingMode,
    setListingMode,
    searchQuery,
    setSearchQuery,
    selectedPropertyTypes,
    togglePropertyType,
    priceRange,
    setPriceRange,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    parkingSpaces,
    setParkingSpaces,
    resetFilters,
  } = useCompassStore();

  const handleZoomIn = () => {
    setMapZoom(Math.min(mapZoom + 1, 18));
  };

  const handleZoomOut = () => {
    setMapZoom(Math.max(mapZoom - 1, 3));
  };

  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
          setMapZoom(15);
        },
        () => {
          alert("Unable to get your location. Please try again later.");
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300_000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleCitySelect = (cityKey: string) => {
    const city = australianCities[cityKey as keyof typeof australianCities];
    if (city) {
      setMapCenter({ lat: city.lat, lng: city.lng });
      setMapZoom(city.zoom);
    }
  };

  const priceConfig =
    listingMode === "sale"
      ? { min: 0, max: 10_000_000, step: 100_000, format: formatSalePrice }
      : { min: 0, max: 3000, step: 50, format: formatRentPrice };

  function formatSalePrice(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  }

  function formatRentPrice(value: number): string {
    return `$${value}`;
  }

  const activeFiltersCount =
    selectedPropertyTypes.length +
    (listingMode === "sale"
      ? priceRange[0] !== 300_000 || priceRange[1] !== 5_000_000
        ? 1
        : 0
      : priceRange[0] !== 200 || priceRange[1] !== 2000
        ? 1
        : 0) +
    (bedrooms !== null ? 1 : 0) +
    (bathrooms !== null ? 1 : 0) +
    (parkingSpaces !== null ? 1 : 0);

  const currentStyleInfo =
    mapStyles.find((s) => s.id === mapStyle) || mapStyles[0];

  return (
    <>
      {/* Main Floating Navbar */}
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="-translate-x-1/2 fixed bottom-6 left-1/2 z-50"
        initial={{ y: 100, opacity: 0 }}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
          {/* AI Agent Button */}
          <Button
            className={cn(
              "h-10 w-10 rounded-xl transition-all",
              showAIAgent
                ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                : "hover:bg-white/5"
            )}
            onClick={() => setShowAIAgent(!showAIAgent)}
            size="icon"
            variant="ghost"
          >
            <Bot className="h-5 w-5" />
          </Button>

          <Separator className="h-6" orientation="vertical" />

          {/* Listing Mode Toggle */}
          <div className="flex rounded-lg bg-white/5 p-1">
            <Button
              className={cn(
                "h-8 rounded-md px-3 text-xs",
                listingMode === "sale"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => setListingMode("sale")}
              size="sm"
              variant="ghost"
            >
              <Home className="mr-1 h-3 w-3" />
              Buy
            </Button>
            <Button
              className={cn(
                "h-8 rounded-md px-3 text-xs",
                listingMode === "rent"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => setListingMode("rent")}
              size="sm"
              variant="ghost"
            >
              <Building2 className="mr-1 h-3 w-3" />
              Rent
            </Button>
          </div>

          <Separator className="h-6" orientation="vertical" />

          {/* Search */}
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-white/40" />
            <Input
              className="h-10 w-48 rounded-xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              type="text"
              value={searchQuery}
            />
          </div>

          <Separator className="h-6" orientation="vertical" />

          {/* Filters Button */}
          <Popover onOpenChange={setShowFilters} open={showFilters}>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "relative h-10 w-10 rounded-xl transition-all",
                  showFilters ? "bg-white/10 text-white" : "hover:bg-white/5"
                )}
                size="icon"
                variant="ghost"
              >
                <Sliders className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <Badge className="-right-1 -top-1 absolute h-5 w-5 rounded-full bg-emerald-500 p-0 text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-xl border-white/10 bg-black/95 p-4 backdrop-blur-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      className="h-7 text-white/60 text-xs hover:text-white"
                      onClick={resetFilters}
                      size="sm"
                      variant="ghost"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => (
                      <Button
                        className={cn(
                          "h-8 rounded-lg text-xs",
                          selectedPropertyTypes.includes(type)
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        )}
                        key={type}
                        onClick={() => togglePropertyType(type)}
                        size="sm"
                        variant="ghost"
                      >
                        {propertyTypeLabels[type]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">
                    Price Range {listingMode === "rent" && "(per week)"}
                  </label>
                  <div className="space-y-3">
                    <Slider
                      className="w-full"
                      max={priceConfig.max}
                      min={priceConfig.min}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      step={priceConfig.step}
                      value={priceRange}
                    />
                    <div className="flex items-center justify-between text-white/60 text-xs">
                      <span>{priceConfig.format(priceRange[0])}</span>
                      <span>{priceConfig.format(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Bedrooms</label>
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() =>
                        setBedrooms(Math.max(0, (bedrooms || 0) - 1))
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 rounded-lg bg-white/5 py-2 text-center text-sm text-white">
                      {bedrooms === null ? "Any" : bedrooms}
                    </div>
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() => setBedrooms((bedrooms || 0) + 1)}
                      size="icon"
                      variant="ghost"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {bedrooms !== null && (
                      <Button
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                        onClick={() => setBedrooms(null)}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Bathrooms</label>
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() =>
                        setBathrooms(Math.max(0, (bathrooms || 0) - 1))
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 rounded-lg bg-white/5 py-2 text-center text-sm text-white">
                      {bathrooms === null ? "Any" : bathrooms}
                    </div>
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() => setBathrooms((bathrooms || 0) + 1)}
                      size="icon"
                      variant="ghost"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {bathrooms !== null && (
                      <Button
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                        onClick={() => setBathrooms(null)}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Parking */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">
                    Parking Spaces
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() =>
                        setParkingSpaces(Math.max(0, (parkingSpaces || 0) - 1))
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 rounded-lg bg-white/5 py-2 text-center text-sm text-white">
                      {parkingSpaces === null ? "Any" : parkingSpaces}
                    </div>
                    <Button
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                      onClick={() => setParkingSpaces((parkingSpaces || 0) + 1)}
                      size="icon"
                      variant="ghost"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {parkingSpaces !== null && (
                      <Button
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10"
                        onClick={() => setParkingSpaces(null)}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator className="h-6" orientation="vertical" />

          {/* Map Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-10 w-10 rounded-xl hover:bg-white/5"
                size="icon"
                variant="ghost"
              >
                <currentStyleInfo.icon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-white/60">
                Map Style
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {mapStyles.map((style) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg",
                    mapStyle === style.id && "bg-white/10"
                  )}
                  key={style.id}
                  onClick={() => setMapStyle(style.id)}
                >
                  <style.icon className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-sm text-white">{style.name}</div>
                    <div className="text-white/40 text-xs">
                      {style.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* City Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-10 w-10 rounded-xl hover:bg-white/5"
                size="icon"
                variant="ghost"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-white/60">
                Jump to City
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {Object.keys(australianCities).map((cityKey) => (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-white hover:bg-white/10"
                  key={cityKey}
                  onClick={() => handleCitySelect(cityKey)}
                >
                  {
                    australianCities[cityKey as keyof typeof australianCities]
                      .label
                  }
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator className="h-6" orientation="vertical" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              className="h-10 w-10 rounded-xl hover:bg-white/5 disabled:opacity-30"
              disabled={mapZoom <= 3}
              onClick={handleZoomOut}
              size="icon"
              variant="ghost"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              className="h-10 w-10 rounded-xl hover:bg-white/5 disabled:opacity-30"
              disabled={mapZoom >= 18}
              onClick={handleZoomIn}
              size="icon"
              variant="ghost"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>

          {/* Locate Me */}
          <Button
            className="h-10 w-10 rounded-xl hover:bg-white/5"
            onClick={handleLocate}
            size="icon"
            variant="ghost"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* AI Agent Panel */}
      <AnimatePresence>
        {showAIAgent && (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="-translate-x-1/2 fixed bottom-24 left-1/2 z-40 w-96"
            exit={{ y: 100, opacity: 0 }}
            initial={{ y: 100, opacity: 0 }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                    <Bot className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">
                      HAUS AI Agent
                    </div>
                    <div className="text-white/40 text-xs">
                      Your property assistant
                    </div>
                  </div>
                </div>
                <Button
                  className="h-8 w-8 rounded-lg hover:bg-white/5"
                  onClick={() => setShowAIAgent(false)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-sm text-white/80">
                    👋 Hi! I can help you find properties. Try asking me things
                    like:
                  </p>
                  <div className="mt-2 space-y-1 text-white/60 text-xs">
                    <p>• &quot;Show me 3-bedroom houses in Bondi under $2M&quot;</p>
                    <p>• &quot;Find apartments near the beach&quot;</p>
                    <p>• &quot;What&apos;s the average price in Surry Hills?&quot;</p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    className="rounded-lg border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/40"
                    placeholder="Ask about properties..."
                    type="text"
                  />
                  <Button
                    className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 rounded-lg bg-indigo-500 hover:bg-indigo-600"
                    size="icon"
                  >
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
