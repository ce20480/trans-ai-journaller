import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAuth } from "@/app/utils/supabase";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const auth = await verifyAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    // Validate inputs
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment was not completed" },
        { status: 400 }
      );
    }

    // Get user ID from the session
    const userId = session.client_reference_id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Get subscription ID
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID not found" },
        { status: 400 }
      );
    }

    // Create admin client to update user profile
    const supabaseAdmin = createAdminClient();

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_id: subscriptionId,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return NextResponse.json(
          { error: "Failed to update subscription status" },
          { status: 500 }
        );
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          subscription_id: subscriptionId,
          subscription_status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
