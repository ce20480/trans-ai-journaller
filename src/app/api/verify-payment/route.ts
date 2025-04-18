export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { verifyAuth } from "@/utils/supabase/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: NextRequest) {
  // 1) Auth with anon key is fine here—we just need the userId from their cookie
  const supabaseClient = createAdminClient(); // service-role
  const {
    isAuthenticated,
    user,
    error: authError,
  } = await verifyAuth(supabaseClient);
  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  const { sessionId } = await request.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // 2) Fetch session & verify paid
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" || !session.client_reference_id) {
    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 }
    );
  }

  // 3) Update the profile in one statement
  const { error: updateErr } = await supabaseClient
    .from("profiles")
    .update({
      subscription_id: session.subscription,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.client_reference_id);

  if (updateErr) {
    console.error("profile update failed", updateErr);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
