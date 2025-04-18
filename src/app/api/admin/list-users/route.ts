export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/supabase/auth";

export async function GET() {
  try {
    // First, verify that the requester is an admin
    const supabaseAdmin = createAdminClient();
    const verifyResult = await requireAdmin(supabaseAdmin);

    // Check if verification result is not successful
    if (!verifyResult || verifyResult.status !== 200) {
      return NextResponse.json(
        { error: "Unauthorized access: Admin privileges required" },
        { status: 403 }
      );
    }

    // Create an admin client to access restricted Supabase functions

    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching users:", authError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Map the returned data to simplify the structure and only include needed fields
    const users = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || "user", // Default to "user" if no role is set
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in list-users endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
