import { type NextRequest, NextResponse } from "next/server"
import type { VoiceSearchResult, SearchParameters, AmenityType } from "@/types/property"
import { validateInput, voiceMessageSchema, sanitizeAndValidateContent } from "@/lib/validation"
import { handleApiError, createValidationError, reportSecurityIncident } from "@/lib/error-handler"
import { checkRateLimit, voiceRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  // Get IP from headers (Next.js 15 doesn't have request.ip)
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor ? (forwardedFor.split(',')[0]?.trim() ?? "unknown") : request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    const rateLimitResult = await checkRateLimit(`voice:${ip}:${userAgent.slice(0, 50)}`, voiceRateLimit)

    if (!rateLimitResult.success) {
      if (rateLimitResult.blocked || rateLimitResult.burst) {
        reportSecurityIncident({
          type: "rate_limit_violation",
          ip,
          userAgent,
          endpoint: "/api/voice-search",
          severity: rateLimitResult.blocked ? "high" : "medium",
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
          requestId,
        },
        {
          status: 429,
          headers: rateLimitResult.headers as unknown as Record<string, string>,
        },
      )
    }

    const body = await request.json()
    const validation = validateInput(voiceMessageSchema, body, {
      endpoint: "/api/voice-search",
      ip,
    })

    if (!validation.success) {
      reportSecurityIncident({
        type: "suspicious_activity",
        ip,
        userAgent,
        endpoint: "/api/voice-search",
        payload: body,
        severity: "low",
      })

      return handleApiError(createValidationError("request_body", validation.error))
    }

    const { text } = validation.data

    const sanitizedText = sanitizeAndValidateContent(text, 2000)

    if (sanitizedText !== text) {
      console.warn(`[SECURITY] Content sanitized for request ${requestId} from ${ip}`)
    }

    const extractionResult = await extractParametersWithAI(sanitizedText)
    const processingTime = Date.now() - startTime

    const result: VoiceSearchResult = {
      parameters: extractionResult.parameters,
      sourceText: sanitizedText,
      confidence: extractionResult.confidence,
      parameterSources: extractionResult.parameterSources,
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        requestId,
        processingTime,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "X-Processing-Time": processingTime.toString(),
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          ...rateLimitResult.headers,
        } as unknown as Record<string, string>,
      },
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("harmful")) {
      reportSecurityIncident({
        type: "injection_attempt",
        ip,
        userAgent,
        endpoint: "/api/voice-search",
        severity: "high",
      })
    }

    return handleApiError(error, {
      endpoint: "/api/voice-search",
      ip,
      userAgent: userAgent.slice(0, 100),
      requestId,
      processingTime: Date.now() - startTime,
    })
  }
}

interface AIExtractionResult {
  parameters: SearchParameters
  confidence: number
  parameterSources: Record<string, string>
}

async function extractParametersWithAI(text: string): Promise<AIExtractionResult> {
  const systemPrompt = `You are an expert real estate search parameter extraction AI. Your job is to analyze natural language queries and extract structured search parameters for Australian real estate.

IMPORTANT: You must respond with valid JSON only. No explanations, no markdown, just the JSON object.

Extract these parameters when clearly mentioned:
- location: string (Australian city, suburb, or area)
- propertyType: "house" | "apartment" | "condo" | "townhouse" | "loft" | "studio" | "penthouse" | "duplex"
- listingType: "for-sale" | "for-rent" | "sold" | "off-market"
- priceRange: { min?: number, max?: number }
- bedrooms: number (minimum bedrooms)
- bathrooms: number (minimum bathrooms)
- squareFootage: { min?: number, max?: number }
- yearBuilt: { min?: number, max?: number }
- amenities: array of strings from this list: ["pool", "spa", "gym", "tennis-court", "garage", "carport", "garden", "balcony", "fireplace", "air-conditioning", "dishwasher", "laundry", "walk-in-closet", "study", "security-system", "elevator", "pet-friendly", "furnished", "solar-panels", "smart-home"]
- features: array of strings from this list: ["corner-lot", "waterfront", "mountain-view", "city-view", "gated-community", "new-construction", "recently-renovated", "wheelchair-accessible", "single-story", "basement"]
- condition: "excellent" | "good" | "fair" | "needs-work" | "fixer-upper"
- virtualTourAvailable: boolean
- newListing: boolean (if mentioned "new" or "just listed")
- priceReduced: boolean (if mentioned "price drop" or "reduced")

Price interpretation rules:
- "under $X" or "below $X" → priceRange: { max: X }
- "over $X" or "above $X" → priceRange: { min: X }
- "around $X" or "about $X" → priceRange: { min: X*0.9, max: X*1.1 }
- "$X to $Y" or "$X - $Y" → priceRange: { min: X, max: Y }
- Handle "k" suffix (e.g., "800k" = 800000)
- Handle "m" suffix (e.g., "1.5m" = 1500000)

Australian context:
- Recognize Australian cities: Sydney, Melbourne, Brisbane, Perth, Adelaide, Darwin, Hobart, Canberra
- Recognize popular suburbs: Bondi, Surry Hills, Paddington, Fitzroy, South Yarra, Toorak, etc.
- Use Australian terminology: "unit" = apartment, "townhouse" = townhouse

Response format:
{
  "parameters": { extracted parameters object },
  "confidence": number between 0 and 1,
  "parameterSources": { "parameterName": "source text fragment" }
}`

  const userPrompt = `Extract real estate search parameters from: "${text}"`

  try {
    const aiResult = await callGeminiAPI(systemPrompt, userPrompt)
    if (aiResult) {
      return aiResult
    }
  } catch (error) {
    console.error("[v0] Gemini AI extraction failed:", error)
  }

  return await enhancedParameterExtractionWithSources(text)
}

async function callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<AIExtractionResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.log("[v0] GEMINI_API_KEY not found, using fallback extraction")
    return null
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error("No response from Gemini API")
    }

    // Parse the JSON response
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim()
    const result = JSON.parse(cleanedText)

    return {
      parameters: result.parameters || {},
      confidence: result.confidence || 0.8,
      parameterSources: result.parameterSources || {},
    }
  } catch (error) {
    console.error("[v0] Gemini API call failed:", error)
    return null
  }
}

async function enhancedParameterExtractionWithSources(text: string): Promise<AIExtractionResult> {
  const parameters: SearchParameters = {}
  const parameterSources: Record<string, string> = {}
  const lowerText = text.toLowerCase()

  const locationPatterns = [
    /(?:in|at|near|around)\s+([a-z\s]+?)(?:\s|$|,|\.|for|with|under|over|\d)/i,
    /(sydney|melbourne|brisbane|perth|adelaide|darwin|hobart|canberra|bondi|surry hills|paddington|newtown|fitzroy|south yarra|toorak|double bay|manly|cronulla|parramatta|chatswood|neutral bay)/i,
  ]

  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      const location = (match[1] || match[0]).replace(/^(in|at|near|around)\s+/i, "").trim()
      parameters.location = location.charAt(0).toUpperCase() + location.slice(1)
      parameterSources.location = match[0]
      break
    }
  }

  const propertyTypes = {
    house: /\b(house|home|detached|villa|cottage)\b/i,
    apartment: /\b(apartment|unit|flat)\b/i,
    studio: /\b(studio)\b/i,
    condo: /\b(condo|condominium)\b/i,
    townhouse: /\b(townhouse|terrace|row house)\b/i,
    loft: /\b(loft|warehouse conversion)\b/i,
    penthouse: /\b(penthouse)\b/i,
    duplex: /\b(duplex)\b/i,
  }

  for (const [type, pattern] of Object.entries(propertyTypes)) {
    const match = text.match(pattern)
    if (match) {
      parameters.propertyType = type as any
      parameterSources.propertyType = match[0]
      break
    }
  }

  const bedroomMatch = text.match(/(\d+)\s*(?:bed|bedroom|br)/i)
  if (bedroomMatch) {
    parameters.bedrooms = Number.parseInt(bedroomMatch[1]!)
    parameterSources.bedrooms = bedroomMatch[0]
  }

  const bathroomMatch = text.match(/(\d+)\s*(?:bath|bathroom|ba)/i)
  if (bathroomMatch) {
    parameters.bathrooms = Number.parseInt(bathroomMatch[1]!)
    parameterSources.bathrooms = bathroomMatch[0]
  }

  const pricePatterns = [
    { pattern: /under\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "max" },
    { pattern: /below\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "max" },
    { pattern: /over\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "min" },
    { pattern: /above\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "min" },
    { pattern: /around\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "around" },
    { pattern: /\$?([\d,]+(?:\.\d+)?)\s*([km])?\s*(?:to|-)\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "range" },
  ]

  for (const { pattern, type } of pricePatterns) {
    const match = text.match(pattern)
    if (match) {
      let price1 = Number.parseFloat(match[1]!.replace(/,/g, ""))
      const suffix1 = match[2]?.toLowerCase()

      if (suffix1 === "k") price1 *= 1000
      if (suffix1 === "m") price1 *= 1000000

      if (type === "max") {
        parameters.priceRange = { max: price1 }
      } else if (type === "min") {
        parameters.priceRange = { min: price1 }
      } else if (type === "around") {
        parameters.priceRange = { min: Math.round(price1 * 0.9), max: Math.round(price1 * 1.1) }
      } else if (type === "range" && match[3]) {
        let price2 = Number.parseFloat(match[3]!.replace(/,/g, ""))
        const suffix2 = match[4]?.toLowerCase()

        if (suffix2 === "k") price2 *= 1000
        if (suffix2 === "m") price2 *= 1000000

        parameters.priceRange = { min: Math.min(price1, price2), max: Math.max(price1, price2) }
      }

      parameterSources.priceRange = match[0]
      break
    }
  }

  if (/\b(rent|rental|lease|tenancy)\b/i.test(text)) {
    parameters.listingType = "for-rent"
    parameterSources.listingType = text.match(/\b(rent|rental|lease|tenancy)\b/i)?.[0] || ""
  } else if (/\b(buy|purchase|sale|sell|for sale)\b/i.test(text)) {
    parameters.listingType = "for-sale"
    parameterSources.listingType = text.match(/\b(buy|purchase|sale|sell|for sale)\b/i)?.[0] || ""
  }

  const amenityPatterns = {
    pool: /\b(pool|swimming)\b/i,
    spa: /\b(spa|hot tub|jacuzzi)\b/i,
    gym: /\b(gym|fitness|exercise)\b/i,
    garage: /\b(garage|parking|carport)\b/i,
    garden: /\b(garden|yard|outdoor space)\b/i,
    balcony: /\b(balcony|terrace|deck)\b/i,
    fireplace: /\b(fireplace|fire place)\b/i,
    "air-conditioning": /\b(air con|aircon|air conditioning|cooling|a\/c)\b/i,
    dishwasher: /\b(dishwasher|dish washer)\b/i,
    laundry: /\b(laundry|washing machine)\b/i,
    "walk-in-closet": /\b(walk.?in closet|walk.?in wardrobe)\b/i,
    study: /\b(study|office|den)\b/i,
    "security-system": /\b(security|alarm|cctv)\b/i,
    elevator: /\b(elevator|lift)\b/i,
    "pet-friendly": /\b(pet.?friendly|pets allowed|pets ok)\b/i,
    furnished: /\b(furnished|furniture included)\b/i,
    "solar-panels": /\b(solar|solar panels)\b/i,
    "smart-home": /\b(smart home|home automation|smart)\b/i,
  }

  const amenities: AmenityType[] = []
  const amenitySources: string[] = []

  for (const [amenity, pattern] of Object.entries(amenityPatterns)) {
    const match = text.match(pattern)
    if (match) {
      amenities.push(amenity as AmenityType)
      amenitySources.push(match[0])
    }
  }

  if (amenities.length > 0) {
    parameters.amenities = amenities
    parameterSources.amenities = amenitySources.join(", ")
  }

  const confidence = calculateEnhancedConfidence(parameters, text, parameterSources)

  return {
    parameters,
    confidence,
    parameterSources,
  }
}

function calculateEnhancedConfidence(
  parameters: SearchParameters,
  text: string,
  sources: Record<string, string>,
): number {
  let confidence = 0.4 // Lower base confidence for pattern matching

  const parameterWeights = {
    location: 0.25,
    propertyType: 0.2,
    priceRange: 0.15,
    bedrooms: 0.1,
    bathrooms: 0.08,
    listingType: 0.07,
    amenities: 0.05,
    features: 0.05,
    condition: 0.03,
    yearBuilt: 0.02,
  }

  for (const [param, weight] of Object.entries(parameterWeights)) {
    if (parameters[param as keyof SearchParameters] && sources[param]) {
      confidence += weight
    }
  }

  // Boost confidence for longer, more detailed queries
  const wordCount = text.split(" ").length
  if (wordCount > 10) confidence += 0.1
  if (wordCount > 15) confidence += 0.05
  if (text.length > 100) confidence += 0.05

  // Boost confidence for specific Australian real estate terms
  const australianTerms = /\b(sydney|melbourne|brisbane|perth|cbd|suburb|strata|body corporate)\b/i
  if (australianTerms.test(text)) confidence += 0.05

  return Math.min(confidence, 0.92) // Cap at 92% for pattern matching
}
