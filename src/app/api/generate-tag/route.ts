export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateTagForIdea } from "@/utils/llm";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { summary } = body;

    // Validate required fields
    if (!summary) {
      return NextResponse.json(
        { error: "Summary is required" },
        { status: 400 }
      );
    }

    // Generate tag using the LLM utility
    const tag = await generateTagForIdea(summary);

    // Return the generated tag
    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Error generating tag:", error);
    const err = error as Error;

    return NextResponse.json(
      { error: "Failed to generate tag", details: err.message },
      { status: 500 }
    );
  }
}
