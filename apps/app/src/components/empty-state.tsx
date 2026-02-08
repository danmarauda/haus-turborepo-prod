"use client";

import { Heart, Home, type LucideIcon, Search } from "lucide-react";
import { Button } from "@v1/ui/button";
import { cn } from "@v1/ui/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "compact" | "card";
};

export function EmptyState({
  icon: Icon = Home,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div className={cn("py-8 text-center", className)}>
        <Icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-1 font-medium text-base text-foreground">{title}</h3>
        <p className="mx-auto mb-4 max-w-xs text-muted-foreground text-sm">
          {description}
        </p>
        {action && (
          <Button
            className="bg-primary text-primary-foreground"
            onClick={action.onClick}
            size="sm"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "mx-auto max-w-md rounded-2xl border border-border bg-card/50 p-8 text-center",
          className
        )}
      >
        <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-foreground text-lg">{title}</h3>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {action && (
          <Button
            className="bg-primary text-primary-foreground"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/50 p-12">
        <Icon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-foreground text-xl">{title}</h3>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {action && (
          <Button
            className="bg-primary text-primary-foreground"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function PropertiesEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      action={
        onAction ? { label: "Clear Filters", onClick: onAction } : undefined
      }
      description="No properties match your current search criteria. Try adjusting your filters or search terms."
      icon={Home}
      title="No Properties Found"
    />
  );
}

export function SavedEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      action={
        onAction ? { label: "Browse Properties", onClick: onAction } : undefined
      }
      description="Start exploring properties and save your favorites to see them here."
      icon={Heart}
      title="No Saved Properties"
      variant="card"
    />
  );
}

export function SearchEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      action={onAction ? { label: "New Search", onClick: onAction } : undefined}
      description="We couldn't find any properties matching your search. Try different keywords or filters."
      icon={Search}
      title="No Results"
    />
  );
}

export function LoadingState({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          className="animate-pulse rounded-lg border border-border bg-card p-4"
          key={`skeleton-placeholder-${i}-${Date.now()}`}
        >
          <div className="mb-4 aspect-video rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-6 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
