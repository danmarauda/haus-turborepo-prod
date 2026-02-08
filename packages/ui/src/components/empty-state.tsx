"use client";

import * as React from "react";
import { cn } from "../utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Pre-built empty states for common scenarios

interface EmptySearchProps extends React.HTMLAttributes<HTMLDivElement> {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export function EmptySearch({
  query,
  onClear,
  className,
  ...props
}: EmptySearchProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title={query ? `No results for "${query}"` : "No results found"}
      description="Try adjusting your search or filters to find what you're looking for."
      action={
        onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Clear search
          </button>
        )
      }
      className={className}
      {...props}
    />
  );
}

interface EmptyPropertiesProps extends React.HTMLAttributes<HTMLDivElement> {
  onCreate?: () => void;
  className?: string;
}

export function EmptyProperties({
  onCreate,
  className,
  ...props
}: EmptyPropertiesProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      }
      title="No properties yet"
      description="Get started by adding your first property to the platform."
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add property
          </button>
        )
      }
      className={className}
      {...props}
    />
  );
}

interface EmptyFavoritesProps extends React.HTMLAttributes<HTMLDivElement> {
  onBrowse?: () => void;
  className?: string;
}

export function EmptyFavorites({
  onBrowse,
  className,
  ...props
}: EmptyFavoritesProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      }
      title="No favorites yet"
      description="Start browsing and save properties you love to your favorites."
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse properties
          </button>
        )
      }
      className={className}
      {...props}
    />
  );
}

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title="Something went wrong"
      description={
        errorMessage || "An unexpected error occurred. Please try again."
      }
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        )
      }
      className={className}
      {...props}
    />
  );
}
