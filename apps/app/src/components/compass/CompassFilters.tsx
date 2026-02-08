"use client";

import { Filter, Home, Building2, Minus, Plus, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@v1/ui/popover";
import { Separator } from "@v1/ui/separator";
import { Slider } from "@v1/ui/slider";
import { Switch } from "@v1/ui/switch";
import {
  propertyTypeLabels,
  type PropertyType,
} from "@/lib/compass-mock-data";
import { cn } from "@v1/ui/utils";
import { useCompassStore } from "@/store/compass-store";

const propertyTypes: PropertyType[] = [
  "house",
  "apartment",
  "townhouse",
  "villa",
  "unit",
  "land",
];

export interface CompassFiltersProps {
  className?: string;
}

export function CompassFilters({ className }: CompassFiltersProps) {
  const {
    listingMode,
    setListingMode,
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

  const [isOpen, setIsOpen] = React.useState(false);

  // Price configuration based on listing mode
  const priceConfig =
    listingMode === "sale"
      ? {
          min: 0,
          max: 10_000_000,
          step: 100_000,
          defaultMin: 300_000,
          defaultMax: 5_000_000,
          format: (value: number) => {
            if (value >= 1_000_000) {
              return `$${(value / 1_000_000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `$${(value / 1000).toFixed(0)}K`;
            }
            return `$${value}`;
          },
        }
      : {
          min: 0,
          max: 3000,
          step: 50,
          defaultMin: 200,
          defaultMax: 2000,
          format: (value: number) => `$${value}/wk`,
        };

  // Count active filters
  const activeFiltersCount =
    selectedPropertyTypes.length +
    (priceRange[0] !== priceConfig.defaultMin ||
    priceRange[1] !== priceConfig.defaultMax
      ? 1
      : 0) +
    (bedrooms !== null ? 1 : 0) +
    (bathrooms !== null ? 1 : 0) +
    (parkingSpaces !== null ? 1 : 0);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur-md",
        className
      )}
    >
      {/* Listing Mode Toggle */}
      <div className="flex rounded-lg bg-muted p-1">
        <Button
          className={cn(
            "h-8 gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
            listingMode === "sale"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setListingMode("sale")}
          size="sm"
          variant="ghost"
        >
          <Home className="h-3.5 w-3.5" />
          Buy
        </Button>
        <Button
          className={cn(
            "h-8 gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
            listingMode === "rent"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setListingMode("rent")}
          size="sm"
          variant="ghost"
        >
          <Building2 className="h-3.5 w-3.5" />
          Rent
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Property Type Pills */}
      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {propertyTypes.slice(0, 4).map((type) => (
          <button
            key={type}
            onClick={() => togglePropertyType(type)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              selectedPropertyTypes.includes(type)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted"
            )}
          >
            {propertyTypeLabels[type]}
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      {/* Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-2",
              activeFiltersCount > 0 && "border-primary text-primary"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 px-1.5 text-[10px]"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="end">
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-foreground"
                  onClick={resetFilters}
                >
                  Reset all
                </Button>
              )}
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Property Type</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      selectedPropertyTypes.includes(type)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    {propertyTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Price Range</label>
                <span className="text-xs text-muted-foreground">
                  {priceConfig.format(priceRange[0])} -{" "}
                  {priceConfig.format(priceRange[1])}
                  {listingMode === "rent" && (
                    <span className="ml-1">/week</span>
                  )}
                </span>
              </div>
              <Slider
                min={priceConfig.min}
                max={priceConfig.max}
                step={priceConfig.step}
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                className="w-full"
              />
            </div>

            <Separator />

            {/* Bedrooms */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Bedrooms</label>
              <NumberSelector
                value={bedrooms}
                onChange={setBedrooms}
                min={0}
                max={6}
              />
            </div>

            {/* Bathrooms */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Bathrooms</label>
              <NumberSelector
                value={bathrooms}
                onChange={setBathrooms}
                min={1}
                max={5}
              />
            </div>

            {/* Parking */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Parking Spaces</label>
              <NumberSelector
                value={parkingSpaces}
                onChange={setParkingSpaces}
                min={0}
                max={4}
              />
            </div>

            {/* Apply Button */}
            <Button className="w-full" onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Pills */}
      {selectedPropertyTypes.length > 0 && (
        <div className="hidden flex-wrap gap-1.5 lg:flex">
          {selectedPropertyTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer gap-1 pr-1"
              onClick={() => togglePropertyType(type)}
            >
              {propertyTypeLabels[type]}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface NumberSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
}

function NumberSelector({ value, onChange, min, max }: NumberSelectorProps) {
  const displayValue = value === null ? "Any" : value === 0 ? "Studio" : value;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          if (value === null) {
            onChange(max);
          } else if (value > min) {
            onChange(value - 1);
          } else {
            onChange(null);
          }
        }}
        disabled={value !== null && value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex h-8 flex-1 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium">
        {displayValue}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          if (value === null) {
            onChange(min);
          } else if (value < max) {
            onChange(value + 1);
          }
        }}
        disabled={value !== null && value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {value !== null && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
