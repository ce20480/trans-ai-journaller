import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/supabase/auth";

// Secure endpoint for creating admin users - only accessible to existing admins
export async function POST(request: NextRequest) {
  // First verify the requester is already an admin
  const supabaseAdmin = await createAdminClient();
  const authError = await requireAdmin(supabaseAdmin);
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

    // Create the user with admin role
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        role: "admin",
        name: name || "",
      },
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create admin user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Admin creation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
