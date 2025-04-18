export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/auth";
import { createAdminClient } from "@/utils/supabase/admin";
// This endpoint should only be accessible to authenticated admins
export async function GET(request: NextRequest) {
  // Check for authentication using Supabase
  const supabaseAdmin = await createAdminClient();
  const verifyResult = await requireAdmin(supabaseAdmin);

  // Check if not authorized
  if (verifyResult) {
    return NextResponse.json(
      { error: "Unauthorized access: Admin privileges required" },
      { status: 403 }
    );
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    // Base query
    let query = supabaseAdmin.from("waitlist").select("*", { count: "exact" });

    // Add search if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Add pagination
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching waitlist:", error);
      return NextResponse.json(
        { error: "Failed to fetch waitlist data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (err) {
    console.error("Admin waitlist API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow deleting entries
export async function DELETE(request: NextRequest) {
  // Check for authentication using Supabase
  const supabaseAdmin = await createAdminClient();
  const verifyResult = await requireAdmin(supabaseAdmin);

  // Check if not authorized
  if (verifyResult) {
    return NextResponse.json(
      { error: "Unauthorized access: Admin privileges required" },
      { status: 403 }
    );
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("waitlist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting waitlist entry:", error);
      return NextResponse.json(
        { error: "Failed to delete entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
    });
  } catch (err) {
    console.error("Admin waitlist delete API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
