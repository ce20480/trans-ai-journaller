export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { processWithLLM, generateTagForIdea } from "@/utils/llm";

// Helper function to parse the LLM output into an array of summary points
function parseSummaryText(text: string): string[] {
  // Remove any markdown headings or formatting
  const cleanText = text.replace(/^#+ .+$/gm, "").trim();

  // Split by common list markers (-, *, or numbered items like 1., 2.)
  let points = cleanText.split(/\n\s*[-*•]|\n\s*\d+\.\s+/);

  // Filter out empty items and trim whitespace
  points = points
    .filter((point) => point.trim().length > 0)
    .map((point) => point.trim());

  // If we didn't find any bullet points, try splitting by paragraphs
  if (points.length <= 1) {
    points = cleanText
      .split(/\n\s*\n/)
      .filter((point) => point.trim().length > 0)
      .map((point) => point.trim());
  }

  // If we still don't have points, use the whole text as one point
  if (points.length === 0 && cleanText.trim()) {
    points = [cleanText.trim()];
  }

  return points;
}

export async function POST(request: NextRequest) {
  // Authentication check
  let user = null;

  // Get JWT token from headers for mobile requests
  const authHeader = request.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Mobile flow with JWT token
    const token = authHeader.substring(7);

    try {
      const adminClient = createAdminClient();

      // Verify the JWT token and get the user
      const { data: userData, error: jwtError } =
        await adminClient.auth.getUser(token);

      if (jwtError || !userData.user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      user = userData.user;
      console.log(
        `✅ Analyze API - Mobile request authenticated with JWT for user: ${user.id}`
      );
    } catch (error) {
      console.error("JWT validation failed", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  } else {
    // Web flow authentication
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    user = authUser;
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided for analysis" },
        { status: 400 }
      );
    }

    // Process text with LLM
    const summaryText = await processWithLLM(text);

    // Parse the summary text into an array of points
    const summaryPoints = parseSummaryText(summaryText);

    // Generate a tag based on the summary
    const fullSummary = summaryPoints.join(" ");
    const suggestedTag = await generateTagForIdea(fullSummary);

    console.log("Processed summary points and tag:", {
      count: summaryPoints.length,
      first:
        summaryPoints[0]?.substring(0, 100) +
        (summaryPoints[0]?.length > 100 ? "..." : ""),
      raw:
        summaryText.substring(0, 100) + (summaryText.length > 100 ? "..." : ""),
      suggestedTag,
    });

    if (summaryPoints.length === 0) {
      throw new Error("Failed to extract summary points from LLM output");
    }

    return NextResponse.json({
      success: true,
      summary: summaryPoints,
      suggestedTag: suggestedTag,
    });
  } catch (error) {
    console.error("Error processing with LLM:", error);
    return NextResponse.json(
      {
        error: "LLM processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
