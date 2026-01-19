"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@haus/ui/tooltip";
import {
  BarChart2,
  FileText,
  Home,
  LayoutGrid,
  Map as MapIcon,
  Megaphone,
  Percent,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutGrid, label: "Overview", href: "#overview", active: true },
  { icon: Home, label: "Property Details", href: "#details" },
  { icon: BarChart2, label: "Comparable Sales", href: "#comps" },
  { icon: Percent, label: "Rental Appraisal", href: "#rental" },
  { icon: MapIcon, label: "Market Insights", href: "#insights" },
  { icon: Users, label: "Buyer Activity", href: "#buyers" },
  { icon: Megaphone, label: "Marketing Plan", href: "#marketing" },
  { icon: FileText, label: "Generate Report", href: "#report" },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden lg:flex flex-col sticky top-24 h-[calc(100vh-8rem)] shrink-0 w-[60px] transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-background z-40 group border-r border-border/50 overflow-hidden rounded-r-xl shadow-2xl shadow-black/50 hover:w-[200px]">
        <nav className="flex flex-col gap-1.5 h-full p-3">
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <a
                  href={item.href}
                  onClick={() => setActiveItem(item.label)}
                  className={cn(
                    "flex items-center px-2.5 py-2.5 rounded-lg border transition-all whitespace-nowrap group/link",
                    activeItem === item.label
                      ? "text-foreground bg-secondary border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent hover:border-border/50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform group-hover/link:scale-110",
                      activeItem === item.label ? "text-foreground" : "",
                    )}
                  />
                  <span className="ml-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {item.label}
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}

          <div className="mt-auto pt-4 border-t border-border/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="#settings"
                  className="flex items-center px-2.5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap group/link"
                >
                  <Settings className="w-5 h-5 shrink-0 transition-transform group-hover/link:scale-110" />
                  <span className="ml-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    Settings
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                Settings
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-3 px-1 py-3 overflow-hidden whitespace-nowrap mt-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-foreground border border-border">
                JD
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <div className="text-xs text-foreground font-medium">
                  John Doe
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Senior Appraiser
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
