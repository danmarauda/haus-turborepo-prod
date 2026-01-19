"use client";

import { cn } from "@/lib/utils";
import { Button } from "@haus/ui/button";
import { Switch } from "@haus/ui/switch";
import {
  Calendar,
  Camera,
  Check,
  Globe,
  Mail,
  Megaphone,
  Target,
} from "lucide-react";

const marketingItems = [
  {
    icon: Camera,
    label: "Professional Photography",
    description: "High-res photos & drone footage",
    price: "$990",
    included: true,
  },
  {
    icon: Globe,
    label: "Premium Portal Listings",
    description: "Domain, REA, Homely featured",
    price: "$1,450",
    included: true,
  },
  {
    icon: Mail,
    label: "Email Campaign",
    description: "Targeted buyer database",
    price: "$350",
    included: true,
  },
  {
    icon: Target,
    label: "Social Media Ads",
    description: "Facebook, Instagram targeting",
    price: "$800",
    included: false,
  },
];

export function MarketingPlan() {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="marketing"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            Marketing Plan
          </h3>
          <p className="text-xs text-muted-foreground">
            Customise your campaign strategy
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Total Budget
            </span>
            <span className="text-xl font-medium text-foreground">$3,590</span>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Confirm Plan
          </Button>
        </div>
      </div>

      {/* Campaign Timeline */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Campaign Timeline
          </span>
          <span className="text-xs text-foreground font-mono">4 weeks</span>
        </div>
        <div className="flex gap-1">
          {["week-1", "week-2", "week-3", "week-4"].map((weekId, i) => (
            <div
              key={weekId}
              className="flex-1 h-2 rounded-full bg-emerald-500/20 overflow-hidden"
            >
              <div
                className={cn(
                  "h-full bg-emerald-500 rounded-full transition-all",
                  i === 0 ? "w-full" : i === 1 ? "w-1/2" : "w-0",
                )}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Week 1</span>
          <span>Week 4</span>
        </div>
      </div>

      {/* Marketing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {marketingItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "p-4 rounded-lg border transition-all",
              item.included
                ? "bg-secondary/50 border-border"
                : "bg-secondary/20 border-border/50",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    item.included
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </div>
              <Switch checked={item.included} />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
              <span className="text-lg font-medium text-foreground">
                {item.price}
              </span>
              {item.included && (
                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Included
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
