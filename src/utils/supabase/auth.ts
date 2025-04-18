// lib/auth.ts
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "./server";
import { createAdminClient } from "./admin";

// export interface AuthResult {
//   isAuthenticated: boolean;
//   user?: any;
//   error?: string;
// }

export async function requireActiveSubscription(
  supabase: ServerClient
): Promise<{ userId: string } | NextResponse> {
  // 1) Auth check
  const { isAuthenticated, user, error } = await verifyAuth(supabase);
  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // 2) Subscription check
  const { data: profile, error: dbErr } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (dbErr) {
    console.error("profiles lookup failed", dbErr);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
  if (profile.subscription_status !== "active") {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  return { userId: user.id };
}

type ServerClient = Awaited<ReturnType<typeof createServerClient>>;
type AdminClient = Awaited<ReturnType<typeof createAdminClient>>;

export async function verifyAuth(supabase: ServerClient | AdminClient) {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      isAuthenticated: false,
      error: error?.message || "No session",
    };
  }
  return {
    isAuthenticated: true,
    user: data.user,
  };
}

export async function requireAdmin(supabase: ServerClient): Promise<null | {
  status: number;
  body: unknown;
}> {
  const authResult = await verifyAuth(supabase);
  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || "Unauthorized" },
      { status: 401 }
    );
  }

  // for role checks, we still trust the metadata on the user object
  if (authResult.user.user_metadata?.role !== "admin") {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin access required." },
      { status: 403 }
    );
  }

  // proceed to your handler
  return null;
}
