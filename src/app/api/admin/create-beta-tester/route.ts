import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/app/utils/supabase";

// Endpoint for creating beta tester users - only accessible to admins
export async function POST(request: NextRequest) {
  // First verify the requester is an admin
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { email, password, name } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createAdminClient();

    // Create the user with beta-tester role
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        role: "beta-tester",
        name: name || "",
      },
    });

    if (error) {
      console.error("Error creating beta tester:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create beta tester" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Beta tester created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: "beta-tester",
      },
    });
  } catch (err) {
    console.error("Beta tester creation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
