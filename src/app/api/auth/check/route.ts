import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return success if authenticated
    return NextResponse.json({
      success: true,
      username: authResult.username,
    });
  } catch (error: unknown) {
    console.error(
      "Auth check error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
