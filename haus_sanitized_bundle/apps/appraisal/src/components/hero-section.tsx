"use client";

import { Bath, Bed, Car, Expand, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative rounded-2xl overflow-hidden border border-border h-[320px] sm:h-[380px] lg:h-[420px] group scroll-mt-24"
      id="overview"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/modern-luxury-terrace-house-exterior-sydney-archit.jpg"
          className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          alt="128 Crown Street Property"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Expand Button */}
      <button
        type="button"
        className="absolute top-4 right-4 z-10 p-2 rounded-lg glass-panel text-foreground/70 hover:text-foreground transition-colors"
        title="Expand image"
        aria-label="Expand image"
      >
        <Expand className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 w-full p-4 sm:p-6 lg:p-8 z-10 flex flex-col md:flex-row items-end justify-between gap-4 lg:gap-6">
        <div>
          {/* Property Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded glass-panel text-foreground text-[10px] font-bold uppercase tracking-wider">
              Terrace
            </span>
            <span className="px-2 py-0.5 rounded glass-panel text-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Bed className="w-3 h-3" />4
            </span>
            <span className="px-2 py-0.5 rounded glass-panel text-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Bath className="w-3 h-3" />3
            </span>
            <span className="px-2 py-0.5 rounded glass-panel text-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Car className="w-3 h-3" />1
            </span>
          </div>

          {/* Address */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-1 text-balance">
            128 Crown Street
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-light">
            Surry Hills, NSW 2010
          </p>
        </div>

        {/* Valuation Card */}
        <div className="glass-panel p-4 sm:p-5 rounded-xl w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Estimated Value
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              High Conf.
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-foreground tracking-tight mb-3">
            $2.4m – $2.6m
          </div>

          {/* Confidence Range */}
          <div className="w-full bg-border/50 h-1 rounded-full overflow-hidden">
            <div className="bg-foreground h-full w-2/3 ml-auto rounded-full opacity-80" />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </section>
  );
}
