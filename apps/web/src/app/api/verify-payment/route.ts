// src/app/api/verify-payment/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST() {
  // 1) Server‑side client picks up sb‑access‐token cookie automatically
  const supabase = await createServerClient();

  // 2) Who is calling?
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3) Check the database
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    console.error("Error fetching profile:", profileErr);
    return NextResponse.json(
      { error: "Could not read subscription status" },
      { status: 500 }
    );
  }

  // 4) Tell the UI what we know
  if (profile.subscription_status === "active") {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: "Payment not yet processed by webhook" },
      { status: 400 }
    );
  }
}
