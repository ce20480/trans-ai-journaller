export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    // First, verify that the requester is an admin
    const supabaseAdmin = await createAdminClient();
    const verifyResult = await requireAdmin(supabaseAdmin);

    // Check if not authorized
    if (verifyResult) {
      return NextResponse.json(
        { error: "Unauthorized access: Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { userId, newRole } = body;

    // Validate inputs
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "userId and newRole are required" },
        { status: 400 }
      );
    }

    // Check if role is valid
    const validRoles = ["user", "admin"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Allowed roles: user, admin" },
        { status: 400 }
      );
    }

    // Update the user's metadata with the new role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: newRole } }
    );

    if (error) {
      console.error("Error updating user role:", error);
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata.role,
      },
    });
  } catch (error) {
    console.error("Error in update-user-role endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
