import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    // Note: Server-side requests cannot access URL fragments

    const supabase = await createClient();
    let error = null;

    // Handle standard code flow
    if (code) {
      // Exchange code for session
      const result = await supabase.auth.exchangeCodeForSession(code);
      error = result.error;
    }
    // For fragment URLs, client-side JS will need to handle this
    // Server cannot access URL fragments (they're not sent to the server)

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    // Get user to determine redirect location
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user is admin and redirect accordingly
    if (user.user_metadata?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Get subscription status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    // Redirect based on subscription status
    if (profile?.subscription_status === "active") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      // Free users allowed 50 notes
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
