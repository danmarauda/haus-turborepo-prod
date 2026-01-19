"use client";

import { Building, Calendar, Home, Layers, MapPin, Ruler } from "lucide-react";

const specs = [
  { icon: Ruler, label: "Land Area", value: "202 m²" },
  { icon: Building, label: "Living Area", value: "285 m²" },
  { icon: Calendar, label: "Year Built", value: "1895" },
  { icon: Layers, label: "Zoning", value: "R3 Medium" },
  { icon: MapPin, label: "Council", value: "City of Sydney" },
  { icon: Home, label: "Property Type", value: "Terrace" },
];

export function PropertySpecs() {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="details"
    >
      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Home className="w-4 h-4 text-muted-foreground" />
        Property Details
      </h3>

      {/* Map Visualization */}
      <div className="relative h-40 rounded-lg border border-border overflow-hidden grid-pattern">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Mock streets */}
            <div className="absolute top-[30%] left-0 w-full h-px bg-border/50" />
            <div className="absolute top-[60%] left-0 w-full h-px bg-border/50" />
            <div className="absolute top-0 left-[40%] h-full w-px bg-border/50" />
            <div className="absolute top-[60%] left-[40%] map-pin z-10">
              <div className="w-3 h-3 bg-foreground rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur border border-border p-2.5 rounded-lg">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Crown St & Foveaux St</span>
            <span className="text-foreground font-mono">
              -33.882°, 151.211°
            </span>
          </div>
        </div>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-3">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <spec.icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {spec.label}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
