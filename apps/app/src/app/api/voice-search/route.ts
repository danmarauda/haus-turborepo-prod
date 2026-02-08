import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { SearchParameters, VoiceSearchResult } from "@/types/property";

// Request validation schema
const voiceSearchSchema = z.object({
  text: z.string().min(1).max(2000),
  currentParams: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

type AIExtractionResult = {
  parameters: SearchParameters;
  confidence: number;
  parameterSources: Record<string, string>;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validation = voiceSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: validation.error.format(),
          requestId,
        },
        { status: 400 }
      );
    }

    const { text, currentParams } = validation.data;

    // Extract parameters using pattern matching (fallback when AI unavailable)
    const extractionResult = await extractParametersWithPatterns(
      text,
      currentParams as Partial<SearchParameters>
    );

    const processingTime = Date.now() - startTime;

    const result: VoiceSearchResult = {
      parameters: extractionResult.parameters,
      sourceText: text,
      confidence: extractionResult.confidence,
      parameterSources: extractionResult.parameterSources,
    };

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
        },
      }
    );
  } catch (error) {
    console.error("[Voice Search] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Voice search failed",
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function extractParametersWithPatterns(
  text: string,
  _currentParams?: Partial<SearchParameters>
): Promise<AIExtractionResult> {
  const parameters: SearchParameters = {};
  const parameterSources: Record<string, string> = {};
  const lowerText = text.toLowerCase();

  // Location extraction
  const locationPatterns = [
    /(?:in|at|near|around)\s+([a-z\s]+?)(?:\s|$|,|\.)/i,
    /(sydney|melbourne|brisbane|perth|adelaide|darwin|hobart|canberra|auckland|wellington|christchurch)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      const location = (match[1] || match[0])
        .replace(/^(in|at|near|around)\s+/i, "")
        .trim();
      parameters.location =
        location.charAt(0).toUpperCase() + location.slice(1);
      parameterSources.location = match[0];
      break;
    }
  }

  // Property type extraction
  const propertyTypes: Record<string, RegExp> = {
    house: /\b(house|home|detached|villa)\b/i,
    apartment: /\b(apartment|unit|flat)\b/i,
    studio: /\b(studio)\b/i,
    condo: /\b(condo)\b/i,
    townhouse: /\b(townhouse|terrace)\b/i,
    loft: /\b(loft)\b/i,
    penthouse: /\b(penthouse)\b/i,
    duplex: /\b(duplex)\b/i,
  };

  for (const [type, pattern] of Object.entries(propertyTypes)) {
    const match = text.match(pattern);
    if (match) {
      parameters.propertyType = type as SearchParameters["propertyType"];
      parameterSources.propertyType = match[0];
      break;
    }
  }

  // Bedrooms
  const bedroomMatch = text.match(/(\d+)\s*(?:bed|bedroom|br)/i);
  if (bedroomMatch) {
    parameters.bedrooms = Number.parseInt(bedroomMatch[1], 10);
    parameterSources.bedrooms = bedroomMatch[0];
  }

  // Bathrooms
  const bathroomMatch = text.match(/(\d+)\s*(?:bath|bathroom|ba)/i);
  if (bathroomMatch) {
    parameters.bathrooms = Number.parseInt(bathroomMatch[1], 10);
    parameterSources.bathrooms = bathroomMatch[0];
  }

  // Price extraction
  const pricePatterns = [
    { pattern: /under\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "max" },
    { pattern: /below\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "max" },
    { pattern: /over\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "min" },
    { pattern: /above\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i, type: "min" },
    {
      pattern:
        /\$?([\d,]+(?:\.\d+)?)\s*([km])?\s*(?:to|-)\s*\$?([\d,]+(?:\.\d+)?)\s*([km])?/i,
      type: "range",
    },
  ];

  for (const { pattern, type } of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      let price1 = Number.parseFloat(match[1].replace(/,/g, ""));
      const suffix1 = match[2]?.toLowerCase();

      if (suffix1 === "k") price1 *= 1000;
      if (suffix1 === "m") price1 *= 1_000_000;

      if (type === "max") {
        parameters.priceRange = { max: price1 };
      } else if (type === "min") {
        parameters.priceRange = { min: price1 };
      } else if (type === "range" && match[3]) {
        let price2 = Number.parseFloat(match[3].replace(/,/g, ""));
        const suffix2 = match[4]?.toLowerCase();

        if (suffix2 === "k") price2 *= 1000;
        if (suffix2 === "m") price2 *= 1_000_000;

        parameters.priceRange = {
          min: Math.min(price1, price2),
          max: Math.max(price1, price2),
        };
      }

      parameterSources.priceRange = match[0];
      break;
    }
  }

  // Listing type
  if (/\b(rent|rental|lease)\b/i.test(text)) {
    parameters.listingType = "for-rent";
    parameterSources.listingType = "rent/rental/lease";
  } else if (/\b(buy|purchase|sale)\b/i.test(text)) {
    parameters.listingType = "for-sale";
    parameterSources.listingType = "buy/purchase/sale";
  }

  // Amenities
  const amenityPatterns: Record<string, RegExp> = {
    pool: /\b(pool|swimming)\b/i,
    garage: /\b(garage|parking)\b/i,
    garden: /\b(garden|yard)\b/i,
    balcony: /\b(balcony|terrace)\b/i,
    "air-conditioning": /\b(air con|aircon|a\/c|cooling)\b/i,
    furnished: /\b(furnished)\b/i,
    "pet-friendly": /\b(pet|pets)\b/i,
  };

  const amenities: string[] = [];
  for (const [amenity, pattern] of Object.entries(amenityPatterns)) {
    if (pattern.test(text)) {
      amenities.push(amenity);
    }
  }

  if (amenities.length > 0) {
    parameters.amenities = amenities;
    parameterSources.amenities = amenities.join(", ");
  }

  // Calculate confidence
  const confidence = calculateConfidence(parameters, text, parameterSources);

  return {
    parameters,
    confidence,
    parameterSources,
  };
}

function calculateConfidence(
  parameters: SearchParameters,
  text: string,
  sources: Record<string, string>
): number {
  let confidence = 0.4;

  const weights: Record<string, number> = {
    location: 0.25,
    propertyType: 0.2,
    priceRange: 0.15,
    bedrooms: 0.1,
    bathrooms: 0.08,
    listingType: 0.07,
    amenities: 0.05,
  };

  for (const [param, weight] of Object.entries(weights)) {
    if (parameters[param as keyof SearchParameters] && sources[param]) {
      confidence += weight;
    }
  }

  // Boost for detailed queries
  const wordCount = text.split(" ").length;
  if (wordCount > 10) confidence += 0.05;
  if (wordCount > 15) confidence += 0.05;

  return Math.min(confidence, 0.92);
}
