"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@v1/ui/button";
import { Search, RefreshCw, Home, FilterX } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onClearFilters?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * SearchErrorBoundary - Handles errors specifically in the property search area
 * 
 * Features:
 * - Specialized error messages for search-related failures
 * - Option to clear filters and retry
 * - Sentry logging with search context
 */
export class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry with search context
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "search");
      scope.setTag("error-id", this.state.errorId);
      scope.setContext("search", {
        url: typeof window !== "undefined" ? window.location.href : "",
        timestamp: new Date().toISOString(),
      });
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
      Sentry.captureException(error);
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearFilters = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onClearFilters) {
      this.props.onClearFilters();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-orange-500" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Search Unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading property search results. 
                This could be due to network issues or temporary server problems.
              </p>
            </div>

            {/* Error Details (dev mode only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="text-left p-4 rounded-lg bg-muted border border-border overflow-auto max-h-48">
                <p className="text-sm font-mono text-destructive mb-2">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Error ID */}
            <p className="text-xs text-muted-foreground">
              Error ID: <code className="font-mono bg-muted px-1 py-0.5 rounded">{this.state.errorId}</code>
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleClearFilters} 
                className="gap-2"
              >
                <FilterX className="w-4 h-4" />
                Clear Filters
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"} 
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SearchErrorBoundary;
