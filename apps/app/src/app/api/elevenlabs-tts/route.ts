import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 30;

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4096),
  voice_id: z.string().default("21m00Tcm4TlvDq8ikWAM"),
  model_id: z.string().default("eleven_turbo_v2_5"),
  stability: z.number().min(0).max(1).default(0.5),
  similarity_boost: z.number().min(0).max(1).default(0.75),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const validation = ttsRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.message,
          requestId,
        },
        { status: 400 }
      );
    }

    const { text, voice_id, model_id, stability, similarity_boost } =
      validation.data;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "ElevenLabs not configured", requestId },
        { status: 503 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ElevenLabs TTS] Error:", errorText);
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const processingTime = Date.now() - startTime;

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Request-ID": requestId,
        "X-Processing-Time": processingTime.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[ElevenLabs TTS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "TTS failed",
        requestId,
      },
      { status: 500 }
    );
  }
}
