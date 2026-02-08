import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const picaVoiceSchema = z.object({
  query: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = picaVoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { query, context } = validation.data;

    // TODO: Integrate with Pica AI
    // For now, return enhanced search response
    const result = {
      response: `Processing your voice query: "${query}"`,
      searchParams: {
        query,
        enhanced: true,
      },
      toolsUsed: ["voice_search", "parameter_extraction"],
      context,
    };

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Pica Voice] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Voice processing failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
