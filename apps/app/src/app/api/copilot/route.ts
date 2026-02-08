import {
  AnthropicAdapter,
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Create Anthropic adapter
const serviceAdapter = new AnthropicAdapter({
  model: "claude-sonnet-4-20250514",
});

// HAUS backend actions for property search
const hausActions = [
  {
    name: "searchProperties",
    description:
      "Search for properties based on user criteria. Use this when the user wants to find properties by location, price, bedrooms, property type, or other filters.",
    parameters: [
      {
        name: "location",
        type: "string",
        description:
          "Suburb, city, or region (e.g., 'Sydney', 'Auckland', 'Wellington CBD')",
        required: false,
      },
      {
        name: "country",
        type: "string",
        description: "Country code: 'AU' for Australia, 'NZ' for New Zealand",
        required: false,
      },
      {
        name: "propertyType",
        type: "string",
        description:
          "Type of property: 'house', 'apartment', 'townhouse', 'land', 'commercial'",
        required: false,
      },
      {
        name: "minPrice",
        type: "number",
        description: "Minimum price in local currency (AUD or NZD)",
        required: false,
      },
      {
        name: "maxPrice",
        type: "number",
        description: "Maximum price in local currency (AUD or NZD)",
        required: false,
      },
      {
        name: "bedrooms",
        type: "number",
        description: "Minimum number of bedrooms",
        required: false,
      },
      {
        name: "bathrooms",
        type: "number",
        description: "Minimum number of bathrooms",
        required: false,
      },
    ],
    handler: async (params: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params.location) {
        searchParams.set("location", String(params.location));
      }
      if (params.propertyType) {
        searchParams.set("propertyType", String(params.propertyType));
      }
      if (params.minPrice) {
        searchParams.set("minPrice", String(params.minPrice));
      }
      if (params.maxPrice) {
        searchParams.set("maxPrice", String(params.maxPrice));
      }
      if (params.bedrooms) {
        searchParams.set("bedrooms", String(params.bedrooms));
      }
      if (params.bathrooms) {
        searchParams.set("bathrooms", String(params.bathrooms));
      }

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const response = await fetch(
          `${baseUrl}/api/property/search?${searchParams.toString()}`
        );
        const data = await response.json();
        return {
          success: true,
          count: data.properties?.length || 0,
          properties: data.properties?.slice(0, 5) || [],
          message: data.properties?.length
            ? `Found ${data.properties.length} properties matching your criteria.`
            : "No properties found matching your criteria. Try adjusting your filters.",
        };
      } catch {
        return {
          success: false,
          count: 0,
          properties: [],
          message: "Unable to search properties at this time.",
        };
      }
    },
  },
  {
    name: "getMarketInsights",
    description:
      "Get market insights and trends for a specific suburb or region in Australia or New Zealand.",
    parameters: [
      {
        name: "suburb",
        type: "string",
        description: "The suburb name to get insights for",
        required: true,
      },
      {
        name: "state",
        type: "string",
        description:
          "Australian state (NSW, VIC, QLD, WA, SA, TAS, NT, ACT) or NZ region",
        required: false,
      },
    ],
    handler: async (params: Record<string, unknown>) => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const suburb = String(params.suburb);
        const state = params.state ? String(params.state) : "";
        const response = await fetch(
          `${baseUrl}/api/suburb/insights?suburb=${encodeURIComponent(suburb)}${state ? `&state=${state}` : ""}`
        );
        const data = await response.json();
        return {
          success: true,
          suburb,
          insights: data.insights || {
            medianPrice: "N/A",
            priceGrowth: "N/A",
            daysOnMarket: "N/A",
            rentalYield: "N/A",
          },
          message: `Market insights for ${suburb}${state ? `, ${state}` : ""}.`,
        };
      } catch {
        return {
          success: false,
          suburb: String(params.suburb),
          insights: null,
          message: "Unable to retrieve market insights.",
        };
      }
    },
  },
  {
    name: "connectToVoiceAgent",
    description:
      "Connect the user to a real-time voice agent powered by LiveKit for hands-free property search assistance.",
    parameters: [],
    handler: async () => ({
      success: true,
      action: "CONNECT_LIVEKIT",
      message: "Voice agent ready. Click phone icon to connect.",
    }),
  },
];

// CopilotKit Runtime with HAUS-specific backend actions
const copilotRuntime = new CopilotRuntime({
  actions: hausActions,
});

// GET endpoint for agent discovery
export async function GET() {
  return Response.json({
    endpoint: "/api/copilot",
    agents: [
      {
        name: "default",
        description: "HAUS Property Assistant",
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "CopilotKit is not configured. Please set ANTHROPIC_API_KEY environment variable.",
      },
      { status: 503 }
    );
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
}
