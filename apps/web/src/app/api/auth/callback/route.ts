import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const code = searchParams.get("code");
  // Default to dashboard, but allow for a custom redirect
  const next = searchParams.get("next") ?? "/dashboard";

  console.log(
    `Auth callback received with code: ${code ? "present" : "missing"}`
  );
  console.log(`Redirect destination: ${next}`);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the origin from the request URL
      const origin = url.origin;
      console.log(
        `Authentication successful, redirecting to: ${origin}${next}`
      );

      // Simple redirect - will work in both development and production
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Error exchanging code for session:", error);
  }

  // Redirect to login page with error
  console.error("Authentication failed, redirecting to login page");
  return NextResponse.redirect(
    new URL("/login?error=Authentication%20failed", request.url)
  );
}
