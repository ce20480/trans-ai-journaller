import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/app/utils/supabase";

// Log environment status on first load
console.log("Auth API Environment Check:", {
  NEXT_PUBLIC_SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY_SET:
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Supabase
    const { data, error } = await signIn(email, password);

    if (error) {
      console.error("Authentication error:", error.message);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Success - Supabase session is automatically handled by the client SDK
    // We don't need to manually set cookies as Supabase takes care of it
    console.log("User authenticated:", data.user?.email);

    return NextResponse.json({
      success: true,
      user: {
        email: data.user?.email,
        id: data.user?.id,
      },
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
