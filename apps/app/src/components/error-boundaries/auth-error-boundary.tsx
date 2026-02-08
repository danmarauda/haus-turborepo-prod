"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@v1/ui/button";
import { ShieldAlert, RefreshCw, LogIn, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onRedirectToLogin?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  isAuthError: boolean;
}

/**
 * AuthErrorBoundary - Handles errors specifically related to authentication
 * 
 * Features:
 * - Detects auth-related errors automatically
 * - Provides clear messaging about session issues
 * - Offers redirect to login
 * - Sentry logging with auth context
 */
class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isAuthError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const message = error.message.toLowerCase();
    const isAuthError = 
      message.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("401") ||
      message.includes("403") ||
      message.includes("session") ||
      message.includes("token") ||
      message.includes("credential") ||
      message.includes("sign in") ||
      message.includes("login");

    return {
      hasError: true,
      error,
      errorId: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry with auth context
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "auth");
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("is-auth-error", String(this.state.isAuthError));
      scope.setContext("auth", {
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "",
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
      errorId: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isAuthError: false,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleRedirectToLogin = () => {
    if (this.props.onRedirectToLogin) {
      this.props.onRedirectToLogin();
    } else {
      window.location.href = "/login";
    }
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAuthError = this.state.isAuthError;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isAuthError ? "Session Expired" : "Access Error"}
              </h2>
              <p className="text-muted-foreground">
                {isAuthError 
                  ? "Your session has expired or you're not signed in. Please sign in again to continue."
                  : "We encountered an issue accessing this feature. This might be a temporary problem."
                }
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
              {isAuthError ? (
                <>
                  <Button onClick={this.handleRedirectToLogin} className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleRedirectToLogin}
                    className="gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper with router for navigation
function AuthErrorBoundaryWithRouter(props: Omit<Props, "onRedirectToLogin">) {
  const router = useRouter();
  
  return (
    <AuthErrorBoundary 
      {...props} 
      onRedirectToLogin={() => router.push("/login")}
    />
  );
}

export { AuthErrorBoundary, AuthErrorBoundaryWithRouter };
export default AuthErrorBoundaryWithRouter;
