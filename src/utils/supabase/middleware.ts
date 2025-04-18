import { createClient as createServerClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Always return a “next” response so we can append cookies
  const response = NextResponse.next({ request });

  // Just force‑touch Supabase to refresh tokens and set any Set‑Cookie headers
  try {
    const supabase = await createServerClient();
    // `.getSession()` will read cookies in and if needed refresh
    await supabase.auth.getSession();
  } catch (err) {
    console.error("⚠️ session refresh failed", err);
  }

  return response;
}
