import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/supabase";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const auth = await verifyAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, userEmail } = await request.json();

    // Validate inputs
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      );
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T2A Premium Subscription",
              description: "Monthly subscription to T2A features",
            },
            unit_amount: 495, // $4.95 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    });

    // Return the checkout URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Stripe checkout error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Return more specific error message to the client
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("Unknown Stripe checkout error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  }
}
