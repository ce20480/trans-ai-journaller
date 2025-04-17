import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/auth";
import { transcribeFile } from "@/utils/transcription";

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await verifyAuth(request);
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    // Start transcription process
    const transcriptionResult = await transcribeFile(filePath);

    return NextResponse.json({
      success: true,
      transcription: transcriptionResult,
    });
  } catch (error) {
    console.error("Error during transcription:", error);
    return NextResponse.json(
      {
        error: "Transcription failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
