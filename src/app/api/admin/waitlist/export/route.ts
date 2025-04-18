export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/supabase/auth";
import { type WaitlistUser } from "@/utils/types/WaitListUser";

// Helper function to convert array of objects to CSV
function convertToCSV(data: WaitlistUser[]) {
  if (data.length === 0) {
    return "";
  }

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const csvRows = [headers.join(",")];

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value =
        row[header as keyof WaitlistUser] === null ||
        row[header as keyof WaitlistUser] === undefined
          ? ""
          : row[header as keyof WaitlistUser];
      // Escape quotes and wrap in quotes if value contains commas or quotes
      const escaped = String(value).replace(/"/g, '""');
      return /[,"]/.test(escaped) ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

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
    const search = searchParams.get("search") || "";

    // Base query
    let query = supabaseAdmin.from("waitlist").select("*");

    // Add search if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Order by creation date
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching waitlist for export:", error);
      return NextResponse.json(
        { error: "Failed to export waitlist data" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No data to export" },
        { status: 404 }
      );
    }

    // Convert data to CSV
    const csv = convertToCSV(data);

    // Set response headers for file download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename=waitlist_export_${new Date().toISOString().split("T")[0]}.csv`
    );

    return new NextResponse(csv, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Admin waitlist export API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
