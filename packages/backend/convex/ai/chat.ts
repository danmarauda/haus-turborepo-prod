/**
 * AI Chat Actions
 *
 * Updated for: AI SDK 6.x (latest)
 * Target: Convex actions with AI SDK 6.x
 *
 * This file provides Convex actions that:
 * - Use AI SDK 6.x format (latest)
 * - Integrate with Cortex memory system
 * - Support streaming and structured output
 * - Support tool calling
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { ANONYMOUS_USER } from "../../lib/constants";

// AI SDK 6.x imports
import { generateText, streamText, generateObject, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// =============================================================================
// Schemas (matching source behavior)
// =============================================================================

/**
 * Property analysis schema for structured AI output
 */
const PropertyAnalysisSchema = z.object({
  propertyType: z
    .enum(["house", "apartment", "townhouse", "unit", "land"])
    .describe("Type of property"),
  estimatedBedrooms: z.number().describe("Estimated number of bedrooms"),
  estimatedBathrooms: z.number().describe("Estimated number of bathrooms"),
  features: z.array(z.string()).describe("Notable features visible in the property"),
  condition: z
    .enum(["new", "excellent", "good", "fair", "needs-renovation"])
    .describe("Overall condition"),
  architecturalStyle: z.string().optional().describe("Architectural style if identifiable"),
  outdoorFeatures: z
    .array(z.string())
    .describe("Outdoor features like pool, garden, etc."),
  priceRangeAUD: z
    .object({
      min: z.number().describe("Minimum estimated price in AUD"),
      max: z.number().describe("Maximum estimated price in AUD"),
    })
    .describe("Estimated price range for Melbourne market"),
  marketingDescription: z.string().describe("Professional marketing description"),
  keySellingPoints: z.array(z.string()).describe("Top 3-5 selling points"),
});

export type PropertyAnalysis = z.infer<typeof PropertyAnalysisSchema>;

// =============================================================================
// Convex Validators
// =============================================================================

const messageContentValidator = v.union(
  v.string(),
  v.array(
    v.union(
      v.object({
        type: v.literal("text"),
        text: v.string(),
      }),
      v.object({
        type: v.literal("image"),
        image: v.string(),
      })
    )
  )
);

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: messageContentValidator,
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get or create user's memory space for Cortex integration
 */
async function ensureMemorySpace(ctx: any, userId: string): Promise<string> {
  const result = await ctx.runMutation(api.cortex.ensureMemorySpace, {
    userId,
  });
  return result.memorySpaceId;
}

/**
 * Store conversation in Cortex memory
 */
async function storeInMemory(
  ctx: any,
  args: {
    userId: string;
    userQuery: string;
    agentResponse: string;
    propertyContext?: Record<string, unknown>;
  }
) {
  const { userId, userQuery, agentResponse, propertyContext } = args;

  try {
    await ctx.runMutation(api.cortex.rememberVoiceSearch, {
      userId,
      userQuery,
      agentResponse,
      propertyId: propertyContext?.propertyId as string | undefined,
      propertyContext,
    });
  } catch (error) {
    console.error("Failed to store in memory:", error);
  }
}

// =============================================================================
// AI Chat Actions (AI SDK 6.x)
// =============================================================================

/**
 * Chat action - streaming text generation
 * AI SDK 6.x: Uses streamText for true streaming support
 */
export const chat = action({
  args: {
    messages: v.array(messageValidator),
    systemPrompt: v.optional(v.string()),
    userId: v.optional(v.string()),
    conversationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messages, systemPrompt, userId = ANONYMOUS_USER } = args;

    const system =
      systemPrompt ??
      `You are HAUS, an AI assistant for Australian real estate.
You help users understand properties, analyze images, and provide insights about the Melbourne property market.
Be helpful, professional, and knowledgeable about Australian real estate terminology and market conditions.`;

    // AI SDK 6.x: Convert messages to proper format
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // AI SDK 6.x: generateText for non-streaming response
    const result = await generateText({
      model: openai("gpt-4o"),
      system,
      messages: formattedMessages,
    });

    // Store conversation in Cortex memory (non-blocking)
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery:
          typeof lastUserMessage.content === "string"
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content),
        agentResponse: result.text,
      });
    }

    return { text: result.text };
  },
});

/**
 * Chat streaming action - returns a stream for real-time responses
 * AI SDK 6.x: Uses streamText for streaming
 * Note: In Convex, we return text chunks as they're generated
 */
export const chatStream = action({
  args: {
    messages: v.array(messageValidator),
    systemPrompt: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messages, systemPrompt, userId = ANONYMOUS_USER } = args;

    const system =
      systemPrompt ??
      `You are HAUS, an AI assistant for Australian real estate.
You help users understand properties, analyze images, and provide insights about the Melbourne property market.
Be helpful, professional, and knowledgeable about Australian real estate terminology and market conditions.`;

    // AI SDK 6.x: streamText for streaming
    const result = streamText({
      model: openai("gpt-4o"),
      system,
      messages,
    });

    // Collect full text for memory storage
    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    // Store in memory (non-blocking)
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery:
          typeof lastUserMessage.content === "string"
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content),
        agentResponse: fullText,
      });
    }

    return { text: fullText };
  },
});

/**
 * Analyze property image - structured output
 * AI SDK 6.x: Uses generateObject with Zod schema
 */
export const analyzeProperty = action({
  args: {
    imageBase64: v.string(),
    additionalContext: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { imageBase64, additionalContext, userId = ANONYMOUS_USER } = args;

    // AI SDK 6.x: generateObject with Zod schema
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: PropertyAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this property image for the Melbourne, Australia real estate market.
${additionalContext ? `Additional context: ${additionalContext}` : ""}

Provide a comprehensive analysis including property type, features, condition, estimated price range (in AUD), and a professional marketing description.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    // Store analysis in Cortex memory (non-blocking)
    if (userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery: "Analyze property image",
        agentResponse: `Property analysis: ${result.object.propertyType} with ${result.object.estimatedBedrooms} beds, ${result.object.estimatedBathrooms} baths. Price range: $${result.object.priceRangeAUD.min.toLocaleString()} - $${result.object.priceRangeAUD.max.toLocaleString()}`,
        propertyContext: {
          propertyType: result.object.propertyType,
          priceRange: result.object.priceRangeAUD,
          condition: result.object.condition,
        },
      });
    }

    return result.object;
  },
});

/**
 * Quick summary of property image
 * AI SDK 6.x: Uses generateText
 */
export const summarizeProperty = action({
  args: {
    imageBase64: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { imageBase64, userId = ANONYMOUS_USER } = args;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Summarize this property image in 3 concise bullet points for a home buyer in Australia. Mention condition, style, and notable features.",
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    // Parse into bullet points
    const bullets = result.text
      .split(/\n|•|-/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    const summary = bullets.join(" • ");

    // Store summary in memory (non-blocking)
    if (userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery: "Summarize property image",
        agentResponse: summary,
      });
    }

    return {
      summary,
      details: bullets,
    };
  },
});

/**
 * Property market insights
 * AI SDK 6.x: Uses generateText
 */
export const marketInsights = action({
  args: {
    suburb: v.string(),
    propertyType: v.optional(v.union(
      v.literal("house"),
      v.literal("apartment"),
      v.literal("townhouse")
    )),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { suburb, propertyType, userId = ANONYMOUS_USER } = args;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are an expert on the Melbourne, Australia property market. Provide accurate, helpful insights.",
      messages: [
        {
          role: "user",
          content: `Provide market insights for ${propertyType ?? "properties"} in ${suburb}, Melbourne. Include:
1. Typical price range
2. Recent market trends
3. Key demographics and lifestyle
4. Nearby amenities
5. Investment potential`,
        },
      ],
    });

    // Store insights in memory (non-blocking)
    if (userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery: `Market insights for ${suburb}`,
        agentResponse: result.text,
        propertyContext: {
          suburb,
          propertyType: propertyType ?? "all",
        },
      });
    }

    return { insights: result.text };
  },
});

/**
 * Generate text (legacy compatibility)
 * AI SDK 6.x: Uses generateText
 */
export const generateTextLegacy = action({
  args: {
    messages: v.array(messageValidator),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messages, userId = ANONYMOUS_USER } = args;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    // Store in memory (non-blocking)
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery:
          typeof lastUserMessage.content === "string"
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content),
        agentResponse: result.text,
      });
    }

    return { text: result.text };
  },
});

// =============================================================================
// Advanced Chat with Tools (AI SDK 6.x)
// =============================================================================

/**
 * Chat with tool support for property searches
 * AI SDK 6.x: Uses tool() helper for defining tools
 */
export const chatWithTools = action({
  args: {
    messages: v.array(messageValidator),
    systemPrompt: v.optional(v.string()),
    userId: v.optional(v.string()),
    enablePropertySearch: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { messages, systemPrompt, enablePropertySearch, userId = ANONYMOUS_USER } = args;

    const system =
      systemPrompt ??
      `You are HAUS, an AI assistant for Australian real estate.
You help users find properties, analyze images, and provide insights about the Melbourne property market.
Be helpful, professional, and knowledgeable about Australian real estate terminology and market conditions.`;

    // AI SDK 6.x: Define tools using tool() helper
    const tools = enablePropertySearch
      ? {
          searchProperties: tool({
            description: "Search for properties based on criteria",
            parameters: z.object({
              suburb: z.string().optional(),
              minPrice: z.number().optional(),
              maxPrice: z.number().optional(),
              bedrooms: z.number().optional(),
              propertyType: z
                .enum(["house", "apartment", "townhouse", "unit"])
                .optional(),
            }),
            execute: async ({ suburb, minPrice, maxPrice, bedrooms, propertyType }) => {
              // This would query the propertyListings table
              // For now, return mock results
              return {
                properties: [],
                total: 0,
                message: `Searched for ${propertyType ?? "properties"} in ${suburb ?? "Melbourne"}`,
              };
            },
          }),
        }
      : undefined;

    // AI SDK 6.x: Generate with tools
    const result = await generateText({
      model: openai("gpt-4o"),
      system,
      messages,
      ...(tools && { tools }),
    });

    // Store in memory
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && userId !== ANONYMOUS_USER) {
      await storeInMemory(ctx, {
        userId,
        userQuery:
          typeof lastUserMessage.content === "string"
            ? lastUserMessage.content
            : JSON.stringify(lastUserMessage.content),
        agentResponse: result.text,
      });
    }

    return {
      text: result.text,
      toolCalls: result.toolCalls,
    };
  },
});
