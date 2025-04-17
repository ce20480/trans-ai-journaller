import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
    // Get the raw body data
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Create admin client to update user profiles
    const supabaseAdmin = createAdminClient();

    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.error("Missing userId or subscriptionId in session", session);
          return NextResponse.json(
            { error: "Missing reference data" },
            { status: 400 }
          );
        }

        // Update user's profile with subscription info
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_id: subscriptionId,
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating profile subscription:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log(`🔔 Subscription activated for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Get the userId from the subscription metadata
        const customerId = subscription.customer as string;

        // Get the customer to find the user
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
          console.error("Customer has been deleted");
          return NextResponse.json(
            { error: "Customer not found" },
            { status: 400 }
          );
        }

        // Find user by their email
        const email = customer.email;
        if (!email) {
          console.error("Customer email not found");
          return NextResponse.json(
            { error: "Email not found" },
            { status: 400 }
          );
        }

        // Find user profile with this email
        const { data: userProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email);

        if (!userProfiles || userProfiles.length === 0) {
          console.error(`No user found with email ${email}`);
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // Update user's subscription status based on Stripe status
        const status = subscription.status;
        const userId = userProfiles[0].id;

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status === "active" ? "active" : "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating subscription status:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log(`🔔 Subscription updated for user ${userId} to ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the profile with this subscription_id
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("subscription_id", subscription.id);

        if (!profiles || profiles.length === 0) {
          console.error(
            `No profile found with subscription ID ${subscription.id}`
          );
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          );
        }

        // Update user's subscription status to cancelled
        const userId = profiles[0].id;
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating subscription status:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log(`🔔 Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        // Ignore other events
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Only accept POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
