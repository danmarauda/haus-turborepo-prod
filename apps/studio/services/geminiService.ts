
import { GoogleGenAI, Type } from "@google/genai";
import { InvestmentAnalysis } from "../types";

// Schema for structured Investment Advice
const investmentSchema = {
    type: Type.OBJECT,
    properties: {
        valuation: {
            type: Type.STRING,
            description: "Estimated market value range and reasoning.",
        },
        growth_forecast_5y: {
            type: Type.STRING,
            description: "Predicted capital growth over the next 5 years (High/Medium/Low) with percentage estimate.",
        },
        pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key investment advantages (location, scarcity, amenities).",
        },
        cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Potential risks or downsides.",
        },
        verdict: {
            type: Type.STRING,
            description: "Final professional recommendation for a high-net-worth investor.",
        }
    },
    required: ["valuation", "growth_forecast_5y", "pros", "cons", "verdict"],
};

// 1. COMPLEX THINKING TASK: Investment Analysis
// Uses gemini-3-pro-preview with max thinkingBudget (32768)
export const analyzeInvestment = async (
  query: string,
  context: string = "Australian Luxury Real Estate Market"
): Promise<InvestmentAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a top-tier Real Estate Investment Advisor. Analyze this query/property context:
      
      Context: ${context}
      Query: "${query}"
      
      Provide a strict JSON analysis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: investmentSchema,
        thinkingConfig: { thinkingBudget: 32768 }, // MAX BUDGET for deep reasoning
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as InvestmentAnalysis;

  } catch (error) {
    console.error("Investment Analysis Failed:", error);
    throw new Error("Unable to generate investment report.");
  }
};

// 2. FAST RESPONSE TASK: Quick Summary / Q&A
// Uses gemini-2.5-flash-lite for low latency
export const quickGeminiResponse = async (prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest', // Use alias for latest lite
            contents: prompt,
            config: {
                systemInstruction: "You are HAUS, an elite real estate assistant. Respond with extreme brevity. Limit answers to 1-2 sharp sentences. Focus only on the core facts without fluff."
            }
        });
        return response.text || "No response generated.";
    } catch (e) {
        console.error("Fast Response Failed:", e);
        return "System busy.";
    }
};

// 3. MAPS GROUNDING TASK: Location Explorer
// Uses gemini-2.5-flash with googleMaps tool
export const exploreLocation = async (latitude: number, longitude: number, query: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: { latitude, longitude }
                    }
                }
            }
        });
        return response.text || "Could not find location data.";
    } catch (e) {
        console.error("Maps Explorer Failed:", e);
        return "Location services unavailable.";
    }
};

// 4. SEARCH GROUNDING TASK: Suburb Intel
// Uses gemini-3-flash-preview with googleSearch tool
export const searchSuburbIntel = async (suburb: string, state: string): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze the suburb of ${suburb}, ${state} for a luxury property buyer. 
          Provide: 
          1. The "Lifestyle Vibe"
          2. Three real-world top-rated cafes/restaurants nearby.
          3. Two top-performing schools.
          4. A Market Pulse score (0-100) and insight.
          Return a very concise summary.`,
          config: {
            tools: [{ googleSearch: {} }],
          }
        });
        return response.text || "Insight unavailable.";
     } catch (e) {
         console.error("Search Grounding Failed", e);
         throw e;
     }
}
