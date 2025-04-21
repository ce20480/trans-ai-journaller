export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // 1) Grab raw body & signature header
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("⚠️ Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  // 2) Construct & verify the event (with 5min tolerance)
  let event: Stripe.Event;
  const tolerance = 300;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
      tolerance
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 3) Create your admin Supabase client
  const supabaseAdmin = createAdminClient();

  // 4) Handle each event type
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string;
      if (!userId || !subscriptionId) {
        console.error("Missing client_reference_id or subscription in session");
        return new NextResponse("Bad session data", { status: 400 });
      }
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_id: subscriptionId,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) {
        console.error("Error updating profile on checkout:", error);
        return new NextResponse("Database update failed", { status: 500 });
      }
      console.log(`✅ Activated subscription for user ${userId}`);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Look up profile by subscription_id (for deleted) or by customer email (for updated)
      if (event.type === "customer.subscription.deleted") {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("subscription_id", subscription.id);
        const userId = profiles?.[0]?.id;
        if (!userId) {
          console.error(`No profile for subscription ${subscription.id}`);
          break;
        }
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(`🔔 Cancelled subscription for user ${userId}`);
      } else {
        // subscription.updated
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        const email = (customer as Stripe.Customer).email;
        if (!email) {
          console.error("No email on Stripe customer");
          break;
        }
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email);
        const userId = profiles?.[0]?.id;
        if (!userId) {
          console.error(`No profile for email ${email}`);
          break;
        }
        const newStatus =
          subscription.status === "active" ? "active" : "cancelled";
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(
          `🔔 Updated subscription status for user ${userId} → ${newStatus}`
        );
      }
      break;
    }

    default:
      console.log(`ℹ️  Unhandled Stripe event type: ${event.type}`);
  }

  // 5) Acknowledge receipt
  return new NextResponse(null, { status: 200 });
}

export function GET() {
  // We only allow POST here
  return new NextResponse("Method Not Allowed", { status: 405 });
}
