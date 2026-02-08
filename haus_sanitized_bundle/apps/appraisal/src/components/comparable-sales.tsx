"use client";

import { cn } from "@/lib/utils";
import { Button } from "@v1/ui/button";
import { ArrowRight, BarChart2, TrendingDown, TrendingUp } from "lucide-react";

const comparables = [
  {
    address: "142 Crown St",
    price: "$2,450,000",
    date: "Nov 2025",
    sqm: "195 m²",
    pricePerSqm: "$12,564",
    variance: "+2.1%",
    positive: true,
  },
  {
    address: "98 Foveaux St",
    price: "$2,380,000",
    date: "Oct 2025",
    sqm: "210 m²",
    pricePerSqm: "$11,333",
    variance: "-1.8%",
    positive: false,
  },
  {
    address: "55 Devonshire St",
    price: "$2,620,000",
    date: "Sep 2025",
    sqm: "225 m²",
    pricePerSqm: "$11,644",
    variance: "+4.5%",
    positive: true,
  },
];

export function ComparableSales() {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="comps"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-muted-foreground" />
          Comparable Sales
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Price Range Indicator */}
      <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Median $/m²
          </span>
          <span className="text-sm font-mono text-foreground">$11,847</span>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full w-[65%] bg-gradient-to-r from-emerald-500/50 to-emerald-500 rounded-full" />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
          <span>$10,500</span>
          <span>$13,200</span>
        </div>
      </div>

      {/* Comparables List */}
      <div className="space-y-2">
        {comparables.map((comp) => (
          <div
            key={comp.address}
            className="p-3 rounded-lg border border-border/50 hover:border-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {comp.address}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {comp.date}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {comp.sqm}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
                  comp.positive
                    ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-destructive bg-destructive/10 border border-destructive/20",
                )}
              >
                {comp.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {comp.variance}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-foreground">
                {comp.price}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {comp.pricePerSqm}/m²
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
