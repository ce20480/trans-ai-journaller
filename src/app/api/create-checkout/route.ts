export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { verifyAuth } from "@/utils/supabase/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const PRICE_ID = process.env.STRIPE_PRICE_ID!;
if (!PRICE_ID) {
  throw new Error("Missing STRIPE_PRICE_ID environment variable");
}

export async function POST() {
  // 0️⃣ spin up a server‑side Supabase client (reads cookies automatically)
  const supabase = await createServerClient();

  // 1️⃣ verify the session
  const {
    isAuthenticated,
    user,
    error: authError,
  } = await verifyAuth(supabase);
  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 2️⃣ create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
      metadata: { userId: user.id },
    });

    // 3️⃣ return the URL
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: message,
      },
      { status: 500 }
    );
  }
}
