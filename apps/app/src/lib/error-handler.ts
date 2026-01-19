import { NextResponse } from "next/server"

export interface AppError extends Error {
  statusCode: number
  code?: string
  context?: Record<string, any>
  severity?: "low" | "medium" | "high" | "critical"
  category?: "validation" | "authentication" | "authorization" | "rate_limit" | "security" | "system"
  requestId?: string
  timestamp?: number
}

export function createError(
  message: string,
  statusCode = 500,
  code?: string,
  context?: Record<string, any>,
  severity: AppError["severity"] = "medium",
  category: AppError["category"] = "system",
): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.code = code
  error.context = context
  error.severity = severity
  error.category = category
  error.timestamp = Date.now()
  error.requestId = crypto.randomUUID()
  return error
}

export function handleApiError(error: unknown, context?: Record<string, any>): NextResponse {
  const timestamp = new Date().toISOString()
  const requestId = crypto.randomUUID()

  // Sanitize context to prevent information leakage
  const sanitizedContext = context ? redactSensitiveData(context) : undefined

  // Enhanced error classification and logging
  if (error instanceof Error) {
    const appError = error as AppError
    const severity = appError.severity || "medium"
    const category = appError.category || "system"

    // Security-focused logging with different levels
    const logData = {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode || 500,
      severity,
      category,
      requestId,
      timestamp,
      context: sanitizedContext,
      stack: process.env.NODE_ENV === "development" ? appError.stack : undefined,
    }

    // Log based on severity
    if (severity === "critical" || category === "security") {
      console.error("[SECURITY ALERT]", logData)
    } else if (severity === "high") {
      console.error("[HIGH PRIORITY ERROR]", logData)
    } else {
      console.warn("[API ERROR]", logData)
    }

    // Return sanitized error response
    const responseData = {
      success: false,
      error: getPublicErrorMessage(appError),
      code: appError.code,
      requestId,
      timestamp,
    }

    return NextResponse.json(responseData, {
      status: appError.statusCode || 500,
      headers: {
        "X-Request-ID": requestId,
        "X-Error-Code": appError.code || "UNKNOWN_ERROR",
      },
    })
  }

  // Handle unknown errors
  console.error("[UNKNOWN ERROR]", {
    error: String(error),
    requestId,
    timestamp,
    context: sanitizedContext,
  })

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred",
      requestId,
      timestamp,
    },
    {
      status: 500,
      headers: {
        "X-Request-ID": requestId,
        "X-Error-Code": "INTERNAL_ERROR",
      },
    },
  )
}

function redactSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /auth/i,
    /credential/i,
    /session/i,
    /cookie/i,
    /bearer/i,
    /api[_-]?key/i,
    /access[_-]?token/i,
    /refresh[_-]?token/i,
    /private[_-]?key/i,
    /client[_-]?secret/i,
  ]

  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  const creditCardPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g

  function redactValue(value: any): any {
    if (typeof value === "string") {
      // Redact email addresses
      value = value.replace(emailPattern, "[EMAIL_REDACTED]")
      // Redact phone numbers
      value = value.replace(phonePattern, "[PHONE_REDACTED]")
      // Redact credit card numbers
      value = value.replace(creditCardPattern, "[CARD_REDACTED]")
      return value
    }

    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.map(redactValue)
      }

      const redacted: Record<string, any> = {}
      for (const [key, val] of Object.entries(value)) {
        if (sensitivePatterns.some((pattern) => pattern.test(key))) {
          redacted[key] = "[REDACTED]"
        } else {
          redacted[key] = redactValue(val)
        }
      }
      return redacted
    }

    return value
  }

  return redactValue(data)
}

function getPublicErrorMessage(error: AppError): string {
  // Map internal errors to safe public messages
  const publicErrorMap: Record<string, string> = {
    VALIDATION_ERROR: "Invalid input provided",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    INTERNAL_ERROR: "An unexpected error occurred",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    TIMEOUT: "Request timeout",
    INVALID_API_KEY: "Invalid API credentials",
    QUOTA_EXCEEDED: "API quota exceeded",
  }

  // Return mapped message or generic message for production
  if (process.env.NODE_ENV === "production") {
    return publicErrorMap[error.code || ""] || "An error occurred while processing your request"
  }

  // In development, return the actual error message
  return error.message
}

export function reportSecurityIncident(incident: {
  type: "suspicious_activity" | "rate_limit_violation" | "injection_attempt" | "unauthorized_access"
  ip?: string
  userAgent?: string
  endpoint?: string
  payload?: any
  severity: "low" | "medium" | "high" | "critical"
}) {
  const report = {
    ...incident,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    payload: incident.payload ? redactSensitiveData(incident.payload) : undefined,
  }

  console.error("[SECURITY INCIDENT]", report)

  // In production, this would integrate with security monitoring tools
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with security monitoring service (e.g., Sentry, DataDog, etc.)
    // securityMonitoring.report(report)
  }
}

export function createErrorResponse(
  message: string,
  statusCode = 500,
  code?: string,
  context?: Record<string, any>,
): NextResponse {
  const error = createError(message, statusCode, code, context)
  return handleApiError(error, context)
}

export function createValidationError(field: string, message: string, value?: any): AppError {
  return createError(
    `Validation failed for ${field}: ${message}`,
    400,
    "VALIDATION_ERROR",
    { field, value: value ? redactSensitiveData({ value }).value : undefined },
    "low",
    "validation",
  )
}

export function createRateLimitError(limit: number, resetTime: number, identifier?: string): AppError {
  return createError(
    "Rate limit exceeded",
    429,
    "RATE_LIMIT_EXCEEDED",
    {
      limit,
      resetTime: new Date(resetTime).toISOString(),
      identifier: identifier ? `${identifier.slice(0, 10)}...` : undefined,
    },
    "medium",
    "rate_limit",
  )
}
