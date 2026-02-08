"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@v1/ui/button";
import { AlertTriangle, RefreshCw, Home, WifiOff, FileX } from "lucide-react";
import { useRouter } from "next/navigation";

// Error types for better UX
export type ErrorType = 
  | "chunk-load" 
  | "network" 
  | "auth" 
  | "not-found" 
  | "unknown";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorType: ErrorType) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  context?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  errorId: string;
}

// Helper to determine error type
function getErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  // Chunk load errors
  if (
    message.includes("chunk") ||
    message.includes("loading chunk") ||
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("cannot find module")
  ) {
    return "chunk-load";
  }
  
  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("timeout") ||
    error.name === "TypeError" && message.includes("fetch")
  ) {
    return "network";
  }
  
  // Auth errors
  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("session") ||
    message.includes("token")
  ) {
    return "auth";
  }
  
  // Not found errors
  if (
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("cannot find")
  ) {
    return "not-found";
  }
  
  return "unknown";
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "unknown",
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorType: getErrorType(error),
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorType = getErrorType(error);
    
    this.setState({ errorInfo });

    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "true");
      scope.setTag("error-type", errorType);
      scope.setTag("error-id", this.state.errorId);
      
      if (this.props.context) {
        scope.setContext("error-boundary-context", this.props.context);
      }
      
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        errorType,
        errorId: this.state.errorId,
      });
      
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorType);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "unknown",
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorType={this.state.errorType}
          errorId={this.state.errorId}
          onRetry={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback UI component
interface DefaultErrorFallbackProps {
  error: Error | null;
  errorType: ErrorType;
  errorId: string;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

function DefaultErrorFallback({
  error,
  errorType,
  errorId,
  onRetry,
  onReload,
  onGoHome,
}: DefaultErrorFallbackProps) {
  const config = ERROR_CONFIG[errorType];

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div 
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <config.icon 
            className="w-10 h-10" 
            style={{ color: config.color }}
          />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>

        {/* Error Details (dev mode only) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="text-left p-4 rounded-lg bg-muted border border-border overflow-auto max-h-48">
            <p className="text-sm font-mono text-destructive mb-2">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* Error ID (for support) */}
        <p className="text-xs text-muted-foreground">
          Error ID: <code className="font-mono bg-muted px-1 py-0.5 rounded">{errorId}</code>
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {errorType === "chunk-load" ? (
            <>
              <Button onClick={onReload} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button variant="outline" onClick={onGoHome} className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </>
          ) : errorType === "auth" ? (
            <>
              <Button onClick={onGoHome} className="gap-2">
                <Home className="w-4 h-4" />
                Go to Login
              </Button>
              <Button variant="outline" onClick={onRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={onGoHome} className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Error configuration by type
const ERROR_CONFIG: Record<ErrorType, {
  title: string;
  description: string;
  icon: typeof AlertTriangle;
  color: string;
}> = {
  "chunk-load": {
    title: "Update Available",
    description: "The app has been updated. Please reload the page to get the latest version.",
    icon: FileX,
    color: "#F59E0B",
  },
  "network": {
    title: "Connection Error",
    description: "We're having trouble connecting to the server. Please check your internet connection and try again.",
    icon: WifiOff,
    color: "#3B82F6",
  },
  "auth": {
    title: "Session Expired",
    description: "Your session has expired or you're not authorized. Please sign in again.",
    icon: AlertTriangle,
    color: "#EF4444",
  },
  "not-found": {
    title: "Not Found",
    description: "The content you're looking for couldn't be found. It may have been moved or deleted.",
    icon: FileX,
    color: "#6B7280",
  },
  "unknown": {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Our team has been notified and we're working on it.",
    icon: AlertTriangle,
    color: "#EF4444",
  },
};

// Hook for functional components to access router
function ErrorBoundaryWithRouter(props: Props) {
  const router = useRouter();
  
  return (
    <ErrorBoundaryBase 
      {...props} 
      context={{ ...props.context, router }}
    />
  );
}

export { ErrorBoundaryBase, ErrorBoundaryWithRouter as ErrorBoundary };
export default ErrorBoundaryWithRouter;
