"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@v1/ui/button";
import { Brain, RefreshCw, AlertCircle, Settings } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onDisableMemory?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * MemoryErrorBoundary - Handles errors specifically in the Cortex memory features
 * 
 * Features:
 * - Specialized error messages for memory-related failures
 * - Option to disable memory and continue
 * - Non-blocking - allows app to continue without memory features
 * - Sentry logging with memory context
 */
export class MemoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry with memory context
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "memory");
      scope.setTag("error-id", this.state.errorId);
      scope.setContext("memory", {
        timestamp: new Date().toISOString(),
        feature: "cortex-memory",
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
      errorId: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleDisableMemory = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onDisableMemory) {
      this.props.onDisableMemory();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">
                  Memory Features Unavailable
                </h3>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;re having trouble accessing your saved preferences and conversation history. 
                You can continue using the app without personalized memory features.
              </p>

              {/* Error Details (dev mode only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-left p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 mb-4 overflow-auto max-h-32">
                  <p className="text-xs font-mono text-amber-800 dark:text-amber-300">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Error ID */}
              <p className="text-xs text-muted-foreground mb-4">
                Error ID: <code className="font-mono bg-muted px-1 py-0.5 rounded">{this.state.errorId}</code>
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={this.handleDisableMemory}
                  className="gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Continue Without Memory
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MemoryErrorBoundary;
