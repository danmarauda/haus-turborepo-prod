"use client";

import { cn } from "@/lib/utils";
import { Button } from "@haus/ui/button";
import {
  ArrowRight,
  Bell,
  Home,
  Menu,
  Printer,
  Search,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full px-4 sm:px-6 h-16 flex justify-between items-center z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      {/* Logo & Breadcrumb */}
      <div className="flex items-center gap-4 lg:gap-6">
        <a href="#overview" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            HAUS
            <span className="text-muted-foreground font-normal">
              .APPRAISAL
            </span>
          </span>
        </a>

        <div className="hidden md:flex items-center">
          <div className="h-4 w-px bg-border mx-4" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Properties
            </span>
            <span className="text-border">/</span>
            <span className="text-foreground">128 Crown St, Surry Hills</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
              Draft
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground font-mono">
          Last saved just now
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Printer className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <span>Generate Proposal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Menu */}
      <div
        className={cn(
          "absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 md:hidden transition-all",
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground pb-3 border-b border-border">
            <span>Properties / </span>
            <span className="text-foreground">128 Crown St</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Draft
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 bg-transparent"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          <Button className="w-full bg-primary text-primary-foreground gap-2">
            Generate Proposal
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
