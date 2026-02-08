/**
 * HAUS Logger - Production-ready logging utility
 *
 * Provides structured logging with environment-aware output:
 * - Development: Detailed console output
 * - Production: Error-only console output (consider external service)
 *
 * Usage:
 *   import { logger } from "@/lib/logger"
 *   logger.info("[Component] Message", { data })
 *   logger.error("[Component] Error message", error)
 */

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment =
      typeof process !== "undefined" &&
      (process.env.NODE_ENV === "development" ||
       process.env.NODE_ENV === "test");
  }

  /**
   * Log info message (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment && context) {
      console.log(message, context);
    } else if (this.isDevelopment) {
      console.log(message);
    }
    // In production, send to logging service (Datadog, Sentry, etc.)
  }

  /**
   * Log warning message (development only)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment && context) {
      console.warn(message, context);
    } else if (this.isDevelopment) {
      console.warn(message);
    }
  }

  /**
   * Log error message (always, but with stack in dev)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    if (this.isDevelopment) {
      console.error(message, errorObj, context ?? "");
    } else {
      console.error(message);
      // Send to error tracking (Sentry, etc.)
      // Sentry.captureException(errorObj, { context });
    }
  }
}

export const logger = new Logger();
