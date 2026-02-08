import { z } from "zod"

const sanitizeString = (str: string) => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:text\/html/gi, "") // Remove data URLs
    .trim()
}

const createSanitizedStringSchema = (min = 1, max = 1000) => {
  return z
    .string()
    .min(min)
    .max(max)
    .transform(sanitizeString)
    .refine((val) => val.length >= min, { message: `String must be at least ${min} characters after sanitization` })
}

export const propertySearchSchema = z.object({
  location: createSanitizedStringSchema(1, 100).refine((val) => !/[<>{}[\]\\/^`|]/.test(val), {
    message: "Location contains invalid characters",
  }),
  propertyType: z
    .enum(["house", "apartment", "condo", "townhouse", "loft", "studio", "penthouse", "duplex"])
    .optional(),
  listingType: z.enum(["for-sale", "for-rent", "sold", "off-market"]).optional(),
  priceRange: z
    .object({
      min: z.number().min(0).max(100000000).optional(),
      max: z.number().min(0).max(100000000).optional(),
    })
    .optional()
    .refine(
      (data) => {
        if (data?.min && data?.max) {
          return data.min <= data.max
        }
        return true
      },
      { message: "Minimum price must be less than maximum price" },
    ),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  squareFootage: z
    .object({
      min: z.number().min(0).max(10000).optional(),
      max: z.number().min(0).max(10000).optional(),
    })
    .optional(),
  yearBuilt: z
    .object({
      min: z
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear() + 5)
        .optional(),
      max: z
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear() + 5)
        .optional(),
    })
    .optional(),
  amenities: z
    .array(
      z.enum([
        "pool",
        "spa",
        "gym",
        "tennis-court",
        "garage",
        "carport",
        "garden",
        "balcony",
        "fireplace",
        "air-conditioning",
        "dishwasher",
        "laundry",
        "walk-in-closet",
        "study",
        "security-system",
        "elevator",
        "pet-friendly",
        "furnished",
        "solar-panels",
        "smart-home",
      ]),
    )
    .max(20)
    .optional(),
  features: z
    .array(
      z.enum([
        "corner-lot",
        "waterfront",
        "mountain-view",
        "city-view",
        "gated-community",
        "new-construction",
        "recently-renovated",
        "wheelchair-accessible",
        "single-story",
        "basement",
        "wine-cellar",
      ]),
    )
    .max(10)
    .optional(),
  condition: z.enum(["excellent", "good", "fair", "needs-work", "fixer-upper"]).optional(),
})

export const voiceMessageSchema = z.object({
  text: createSanitizedStringSchema(1, 2000).refine(
    (val) => {
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /\b(union|select|insert|delete|drop|create|alter|exec)\b/i,
        /\b(script|javascript|vbscript|onload|onerror)\b/i,
        /<[^>]*>/g, // HTML tags
        /\${.*}/g, // Template literals
      ]
      return !suspiciousPatterns.some((pattern) => pattern.test(val))
    },
    { message: "Text contains potentially harmful content" },
  ),
  sessionId: z.string().uuid("Invalid session ID").optional(),
  timestamp: z
    .number()
    .int()
    .min(Date.now() - 300000)
    .max(Date.now() + 60000)
    .optional(), // Within 5 minutes
  clientInfo: z
    .object({
      userAgent: createSanitizedStringSchema(1, 500).optional(),
      language: z.string().max(10).optional(),
      timezone: z.string().max(50).optional(),
    })
    .optional(),
})

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional(),
  rateLimit: z
    .object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.string().datetime(),
    })
    .optional(),
})

export const voiceSearchResultSchema = z.object({
  parameters: propertySearchSchema,
  sourceText: createSanitizedStringSchema(1, 2000),
  confidence: z.number().min(0).max(1),
  parameterSources: z.record(z.string(), createSanitizedStringSchema(1, 200)).optional(),
  processingTime: z.number().min(0).max(30000).optional(), // Max 30 seconds
})

export const requestMetadataSchema = z.object({
  ip: z.string().ip().optional(),
  userAgent: createSanitizedStringSchema(1, 1000).optional(),
  referer: z.string().url().max(2000).optional(),
  origin: z.string().url().max(500).optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"]),
  path: createSanitizedStringSchema(1, 500),
  timestamp: z.number().int(),
  requestId: z.string().uuid(),
})

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: {
    endpoint?: string
    ip?: string
    skipSanitization?: boolean
  },
): { success: true; data: T } | { success: false; error: string; details?: any } {
  try {
    const validated = schema.parse(data)

    // Log successful validation for monitoring
    if (context?.endpoint) {
      console.log(`[VALIDATION] Success: ${context.endpoint} from ${context.ip || "unknown"}`)
    }

    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")

      // Log validation failures for security monitoring
      console.warn(
        `[VALIDATION] Failed: ${context?.endpoint || "unknown"} from ${context?.ip || "unknown"}: ${errorMessage}`,
      )

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
        details: process.env.NODE_ENV === "development" ? error.errors : undefined,
      }
    }

    console.error(`[VALIDATION] Unexpected error: ${context?.endpoint || "unknown"}:`, error)
    return {
      success: false,
      error: "Validation error occurred",
    }
  }
}

export function sanitizeAndValidateContent(content: string, maxLength = 1000): string {
  if (!content || typeof content !== "string") {
    throw new Error("Invalid content provided")
  }

  // Remove potentially dangerous content
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Script tags
    .replace(/javascript:/gi, "") // JavaScript protocol
    .replace(/data:text\/html/gi, "") // Data URLs
    .replace(/on\w+\s*=/gi, "") // Event handlers
    .replace(/\${.*?}/g, "") // Template literals
    .replace(/\b(eval|function|constructor)\s*\(/gi, "") // Dangerous functions
    .trim()

  // Validate length
  if (sanitized.length > maxLength) {
    throw new Error(`Content exceeds maximum length of ${maxLength} characters`)
  }

  // Check for remaining suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter|exec)\b/i,
    /<[^>]*>/g,
    /\\\w+/g, // Escape sequences
  ]

  if (suspiciousPatterns.some((pattern) => pattern.test(sanitized))) {
    throw new Error("Content contains potentially harmful patterns")
  }

  return sanitized
}

export const rateLimitSchema = z.object({
  identifier: z.string().min(1).max(200),
  endpoint: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(1000),
  window: z.number().int().min(1).max(86400), // Max 24 hours in seconds
  cost: z.number().int().min(1).max(100).default(1), // Request cost multiplier
})

export function validateVoiceSearchInput(data: unknown) {
  return validateInput(voiceMessageSchema, data, {
    endpoint: "voice-search",
    skipSanitization: false,
  })
}
