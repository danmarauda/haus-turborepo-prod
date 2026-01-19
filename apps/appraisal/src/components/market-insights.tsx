"use client";

import { ArrowUpRight, Map as MapIcon, TrendingUp } from "lucide-react";

const insights = [
  {
    label: "Median Price",
    value: "$2.45M",
    change: "+12.3%",
    period: "YoY",
    positive: true,
  },
  {
    label: "Days on Market",
    value: "28",
    change: "-15%",
    period: "vs avg",
    positive: true,
  },
  {
    label: "Clearance Rate",
    value: "78%",
    change: "+5.2%",
    period: "QoQ",
    positive: true,
  },
  {
    label: "Stock Levels",
    value: "Low",
    change: "-23%",
    period: "vs 2024",
    positive: true,
  },
];

export function MarketInsights() {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="insights"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-muted-foreground" />
          Market Insights
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          Surry Hills
        </span>
      </div>

      {/* Mini Chart Placeholder */}
      <div className="h-24 rounded-lg bg-secondary/50 border border-border/50 relative overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16 185 129 / 0.3)" />
              <stop offset="100%" stopColor="rgb(16 185 129 / 0)" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C20,55 40,45 60,40 C80,35 100,50 120,35 C140,20 160,25 180,15 L200,10 L200,80 L0,80 Z"
            fill="url(#chartGradient)"
          />
          <path
            d="M0,60 C20,55 40,45 60,40 C80,35 100,50 120,35 C140,20 160,25 180,15 L200,10"
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute top-2 right-2 text-[10px] text-emerald-500 flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          +12.3% YoY
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {insights.map((insight) => (
          <div
            key={insight.label}
            className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
              {insight.label}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-medium text-foreground">
                {insight.value}
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" />
                {insight.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
