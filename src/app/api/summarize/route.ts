import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/auth";
import { processWithLLM } from "@/utils/llm";

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await verifyAuth(request);
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: "No transcription provided" },
        { status: 400 }
      );
    }

    // Process transcription with LLM
    const summary = await processWithLLM(transcription);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error processing with LLM:", error);
    return NextResponse.json(
      { error: "LLM processing failed", details: error.message },
      { status: 500 }
    );
  }
}
