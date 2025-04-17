import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/utils/supabase";

export async function GET(request: NextRequest) {
  try {
    // Sign out using Supabase
    const { error } = await signOut();

    if (error) {
      console.error("Error during logout:", error.message);
      return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
    }

    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (err) {
    console.error("Error during logout:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
