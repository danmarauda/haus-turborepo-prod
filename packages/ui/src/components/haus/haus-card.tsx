"use client";

import * as React from "react";
import { cn } from "../../utils";

interface HausCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export function HausCard({
  children,
  className,
  variant = "default",
  padding = "md",
  ...props
}: HausCardProps) {
  const variants = {
    default: "bg-card text-card-foreground",
    glass: "bg-white/5 backdrop-blur-md border border-white/10",
    bordered: "border-2 border-border bg-transparent",
    elevated: "bg-card shadow-lg shadow-black/10",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-3xl transition-all duration-300",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface HausCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HausCardHeader({ children, className, ...props }: HausCardHeaderProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

interface HausCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export function HausCardTitle({ children, className, ...props }: HausCardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

interface HausCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function HausCardDescription({ children, className, ...props }: HausCardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props}>
      {children}
    </p>
  );
}

interface HausCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HausCardContent({ children, className, ...props }: HausCardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

interface HausCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HausCardFooter({ children, className, ...props }: HausCardFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
