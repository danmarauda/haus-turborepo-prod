import { type NextRequest, NextResponse } from "next/server";

/**
 * Generate ElevenLabs Signed URL for Conversational AI
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    console.error("[ElevenLabs] ELEVENLABS_API_KEY not configured");
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  if (!agentId) {
    console.error("[ElevenLabs] NEXT_PUBLIC_ELEVENLABS_AGENT_ID not configured");
    return NextResponse.json(
      { error: "Agent ID not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ElevenLabs] Signed URL generation failed:", errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.signed_url) {
      throw new Error("No signed URL in response");
    }

    return NextResponse.json({
      signedUrl: data.signed_url,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error("[ElevenLabs] Signed URL generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate signed URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
