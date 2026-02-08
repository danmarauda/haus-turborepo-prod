"use client";

import { Slider } from "@v1/ui/slider";
import { DollarSign, Percent, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function RentalAppraisal() {
  const [weeklyRent, setWeeklyRent] = useState([1450]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const annualRent = (weeklyRent[0] ?? 1450) * 52;
  const grossYield = ((annualRent / 2500000) * 100).toFixed(2);

  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="rental"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Percent className="w-4 h-4 text-muted-foreground" />
          Rental Appraisal
        </h3>
        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          High Demand
        </span>
      </div>

      {/* Weekly Rent Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Weekly Rent
          </span>
          <span className="text-2xl font-medium text-foreground font-mono">
            ${weeklyRent[0]}
          </span>
        </div>
        {isMounted && (
          <Slider
            value={weeklyRent}
            onValueChange={setWeeklyRent}
            min={1200}
            max={1800}
            step={25}
            className="w-full"
          />
        )}
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>$1,200</span>
          <span>$1,800</span>
        </div>
      </div>

      {/* Yield Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Annual Rent
            </span>
          </div>
          <span className="text-xl font-medium text-foreground">
            ${annualRent.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Gross Yield
            </span>
          </div>
          <span className="text-xl font-medium text-foreground">
            {grossYield}%
          </span>
        </div>
      </div>

      {/* Comparable Rentals */}
      <div className="space-y-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Comparable Rentals
        </span>
        <div className="space-y-2">
          {[
            { address: "156 Crown St", rent: "$1,400/wk", beds: 4 },
            { address: "89 Devonshire St", rent: "$1,520/wk", beds: 4 },
            { address: "201 Riley St", rent: "$1,350/wk", beds: 3 },
          ].map((rental) => (
            <div
              key={rental.address}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:border-border bg-secondary/30 transition-colors"
            >
              <div>
                <span className="text-sm text-foreground">
                  {rental.address}
                </span>
                <span className="text-[10px] text-muted-foreground ml-2">
                  {rental.beds} bed
                </span>
              </div>
              <span className="text-sm font-mono text-foreground">
                {rental.rent}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
