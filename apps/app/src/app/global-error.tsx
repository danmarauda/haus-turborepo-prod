"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@v1/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

/**
 * GlobalError - Root level error boundary for the Next.js app
 * 
 * This component catches errors that bubble up to the root of the app.
 * It's used when the entire application crashes and we need a fallback UI.
 * 
 * Features:
 * - Reports errors to Sentry
 * - Provides a user-friendly error screen
 * - Offers options to retry or go home
 * - Shows error details in development mode
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry with global context
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "global");
      scope.setTag("error-digest", error.digest || "unknown");
      scope.setContext("global-error", {
        digest: error.digest,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "",
      });
      Sentry.captureException(error);
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReportIssue = () => {
    // Open support or GitHub issues page
    window.open("https://github.com/your-org/haus/issues/new", "_blank");
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Something Went Wrong
              </h1>
              <p className="text-lg text-muted-foreground">
                We&apos;re sorry, but the application encountered a critical error. 
                Our team has been notified and is working to fix it.
              </p>
            </div>

            {/* Error Details (dev mode only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-left p-4 rounded-lg bg-muted border border-destructive/50 overflow-auto max-h-64">
                <p className="text-sm font-mono text-destructive mb-2 font-semibold">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Error ID for production */}
            {process.env.NODE_ENV === "production" && error.digest && (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground">
                  Error Reference: <code className="font-mono text-foreground">{error.digest}</code>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please include this code if you contact support.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={reset}
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleReload}
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Page
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={handleGoHome}
                className="gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Button>
            </div>

            {/* Report Issue */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleReportIssue}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bug className="w-4 h-4" />
                Report this issue
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground">
              If the problem persists, please try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
