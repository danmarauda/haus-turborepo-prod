"use client";

import * as React from "react";
import { cn } from "../utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  hasImage?: boolean;
  lines?: number;
}

export function CardSkeleton({
  className,
  hasImage = true,
  lines = 3,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-6 space-y-4", className)}
      {...props}
    >
      {hasImage && (
        <Skeleton className="h-48 w-full rounded-lg" />
      )}
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - (i * 15)}%` }} />
      ))}
    </div>
  );
}

interface ListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  items?: number;
}

export function ListSkeleton({
  className,
  items = 5,
  ...props
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PropertyCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function PropertyCardSkeleton({ className, ...props }: PropertyCardSkeletonProps) {
  return (
    <div
      className={cn("rounded-3xl overflow-hidden border bg-card", className)}
      {...props}
    >
      <Skeleton className="h-56 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface SearchSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SearchSkeleton({ className, ...props }: SearchSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
