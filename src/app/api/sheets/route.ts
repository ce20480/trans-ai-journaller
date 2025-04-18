import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/supabase/auth";
import { writeToGoogleSheets } from "@/utils/googleSheets";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  // Check authentication
  const supabase = await createServerClient();
  const authResult = await verifyAuth(supabase);
  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { summary } = await request.json();

    if (!summary) {
      return NextResponse.json(
        { error: "No summary provided" },
        { status: 400 }
      );
    }

    // Write to Google Sheets
    const sheetsResult = await writeToGoogleSheets(summary);

    return NextResponse.json({
      success: true,
      sheetsResult,
    });
  } catch (error) {
    console.error("Error writing to Google Sheets:", error);
    return NextResponse.json(
      {
        error: "Failed to write to Google Sheets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
