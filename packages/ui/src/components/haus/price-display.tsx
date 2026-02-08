"use client";

import * as React from "react";
import { cn } from "../../utils";

interface PriceDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
  currency?: string;
  locale?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSuffix?: boolean;
  suffix?: string;
}

export function PriceDisplay({
  price,
  currency = "AUD",
  locale = "en-AU",
  className,
  size = "md",
  showSuffix = true,
  suffix = "",
  ...props
}: PriceDisplayProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl font-semibold",
    xl: "text-3xl font-bold",
  };

  const formatPrice = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString(locale);
  };

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);

  const compactPrice = formatPrice(price);
  const displayPrice = showSuffix ? `$${compactPrice}` : formattedPrice;

  return (
    <div className={cn("inline-flex items-baseline gap-1", className)} {...props}>
      <span className={cn(sizes[size])}>{displayPrice}</span>
      {suffix && (
        <span className="text-muted-foreground text-sm">{suffix}</span>
      )}
    </div>
  );
}

interface PriceRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  minPrice: number;
  maxPrice: number;
  currency?: string;
  locale?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceRange({
  minPrice,
  maxPrice,
  currency = "AUD",
  locale = "en-AU",
  className,
  size = "md",
  ...props
}: PriceRangeProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl font-semibold",
    xl: "text-3xl font-bold",
  };

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  };

  return (
    <div className={cn("inline-flex items-baseline gap-1", className)} {...props}>
      <span className={cn(sizes[size])}>
        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
      </span>
    </div>
  );
}
