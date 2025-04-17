import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET() {
  try {
    // Check current session with Supabase
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session check error:", error.message);
      return NextResponse.json(
        { error: "Authentication check failed" },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Return user info
    return NextResponse.json({
      authenticated: true,
      user: {
        email: data.session.user.email,
        id: data.session.user.id,
      },
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
