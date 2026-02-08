"use client";

import * as React from "react";
import { cn } from "../../utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "dark";
  blur?: "sm" | "md" | "lg" | "xl";
}

export function GlassPanel({
  children,
  className,
  variant = "default",
  blur = "md",
  ...props
}: GlassPanelProps) {
  const variants = {
    default: "bg-white/10 border-white/20",
    elevated: "bg-white/15 border-white/30 shadow-xl",
    dark: "bg-black/20 border-white/10",
  };

  const blurs = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div
      className={cn(
        "rounded-3xl border",
        variants[variant],
        blurs[blur],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
