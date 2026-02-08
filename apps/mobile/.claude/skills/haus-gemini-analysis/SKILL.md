---
name: haus-gemini-analysis
description: HAUS Platform Gemini AI patterns for property image analysis, document processing, and multimodal AI features. Use when implementing Gemini-powered analysis.
---

# HAUS Gemini Analysis Patterns

## Overview

HAUS uses Google Gemini for:
- Property image analysis
- Document/floorplan processing
- AI-powered property descriptions
- Comparative market analysis

## Setup

### Via AI SDK (Recommended)

```typescript
import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';

// Set GOOGLE_GENERATIVE_AI_API_KEY in environment
```

### Direct Gemini API

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

## Property Image Analysis

```typescript
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const PropertyAnalysisSchema = z.object({
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'unit', 'land']),
  estimatedBedrooms: z.number(),
  estimatedBathrooms: z.number(),
  parkingSpaces: z.number().optional(),
  features: z.array(z.string()),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'needs-renovation']),
  architecturalStyle: z.string().optional(),
  outdoorFeatures: z.array(z.string()),
  estimatedAge: z.string().optional(),
  priceRangeAUD: z.object({
    min: z.number(),
    max: z.number(),
  }),
  marketingDescription: z.string(),
  keySellingPoints: z.array(z.string()),
});

export async function analyzePropertyImage(imageUrl: string) {
  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: PropertyAnalysisSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this property image for the Melbourne, Australia real estate market.
            
Consider:
- Property type and layout
- Number of bedrooms/bathrooms (estimate from visible spaces)
- Key features and condition
- Architectural style
- Outdoor areas
- Estimated price range in AUD based on Melbourne market (2024)

Provide a professional marketing description suitable for realestate.com.au.`,
          },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });

  return result.object;
}
```

## Multiple Image Analysis

```typescript
export async function analyzePropertyGallery(imageUrls: string[]) {
  const content = [
    {
      type: 'text' as const,
      text: `Analyze these property images as a complete listing for Melbourne, AU.
      
Images show different areas of the same property. Combine observations into a comprehensive analysis.`,
    },
    ...imageUrls.map(url => ({
      type: 'image' as const,
      image: url,
    })),
  ];

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: PropertyAnalysisSchema,
    messages: [{ role: 'user', content }],
  });

  return result.object;
}
```

## Floor Plan Analysis

```typescript
const FloorPlanSchema = z.object({
  totalSqm: z.number().optional(),
  rooms: z.array(z.object({
    name: z.string(),
    dimensions: z.string().optional(),
    sqm: z.number().optional(),
  })),
  bedrooms: z.number(),
  bathrooms: z.number(),
  levels: z.number(),
  hasGarage: z.boolean(),
  garageSpaces: z.number().optional(),
  outdoorSqm: z.number().optional(),
  layout: z.enum(['open-plan', 'traditional', 'split-level', 'loft']),
  notes: z.array(z.string()),
});

export async function analyzeFloorPlan(floorPlanImage: string) {
  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: FloorPlanSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all room dimensions and layout information from this floor plan.',
          },
          { type: 'image', image: floorPlanImage },
        ],
      },
    ],
  });

  return result.object;
}
```

## Document Analysis (Contracts, Statements)

```typescript
const DocumentAnalysisSchema = z.object({
  documentType: z.enum([
    'contract-of-sale',
    'section-32',
    'building-inspection',
    'pest-inspection',
    'owners-corporation',
    'strata-report',
    'other'
  ]),
  keyDates: z.array(z.object({
    event: z.string(),
    date: z.string(),
  })),
  keyFigures: z.array(z.object({
    item: z.string(),
    value: z.string(),
  })),
  concerns: z.array(z.string()),
  summary: z.string(),
});

export async function analyzePropertyDocument(documentUrl: string) {
  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: DocumentAnalysisSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this Australian property document.
            
Identify:
- Document type
- Key dates (settlement, cooling off, etc.)
- Key figures (price, fees, levies, etc.)
- Any concerns or red flags
- Brief summary for a buyer`,
          },
          { type: 'image', image: documentUrl },
        ],
      },
    ],
  });

  return result.object;
}
```

## Streaming Analysis for UI

```typescript
import { streamObject } from 'ai';

export async function streamPropertyAnalysis(imageUrl: string) {
  const result = await streamObject({
    model: google('gemini-1.5-pro'),
    schema: PropertyAnalysisSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this property for Melbourne market.' },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });

  // Stream partial results to UI
  for await (const partialObject of result.partialObjectStream) {
    // Update UI with partial data
    updateUI(partialObject);
  }

  return result.object;
}
```

## Convex Integration

```typescript
// convex/uploads.ts
import { action, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';

export const analyzeUpload = action({
  args: { uploadId: v.id('uploads') },
  handler: async (ctx, args) => {
    // Get upload
    const upload = await ctx.runQuery(api.uploads.getById, { id: args.uploadId });
    if (!upload) throw new Error('Upload not found');

    // Update status
    await ctx.runMutation(api.uploads.updateStatus, {
      id: args.uploadId,
      status: 'analyzing',
    });

    try {
      // Get file URL from Convex storage
      const fileUrl = await ctx.storage.getUrl(upload.storageId);
      if (!fileUrl) throw new Error('File not found');

      // Analyze with Gemini
      const analysis = await analyzePropertyImage(fileUrl);

      // Store result
      await ctx.runMutation(api.uploads.saveAnalysis, {
        id: args.uploadId,
        analysis,
        status: 'complete',
      });

      return analysis;
    } catch (error) {
      await ctx.runMutation(api.uploads.updateStatus, {
        id: args.uploadId,
        status: 'error',
        error: error.message,
      });
      throw error;
    }
  },
});
```

## Error Handling

```typescript
try {
  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    schema: PropertyAnalysisSchema,
    messages: [...],
  });
  return result.object;
} catch (error) {
  if (error.message?.includes('SAFETY')) {
    // Content blocked by safety filters
    return { error: 'Image could not be analyzed due to content restrictions' };
  }
  if (error.message?.includes('QUOTA')) {
    // Rate limited
    await delay(1000);
    return retry();
  }
  throw error;
}
```

## Best Practices

1. **Use structured output** (generateObject) for consistent data
2. **Provide Melbourne-specific context** in prompts
3. **Handle multiple images** for comprehensive analysis
4. **Stream results** for better UX on long analyses
5. **Store results in Convex** for caching
6. **Handle safety filters** gracefully
7. **Use Zod schemas** that match your database types
