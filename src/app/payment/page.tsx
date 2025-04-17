"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

export default function Payment() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        // If not authenticated, redirect to login
        router.push("/login");
        return;
      }

      setUser(data.session.user);

      // Check if user already has an active subscription
      // If they do, redirect them to dashboard
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", data.session.user.id)
        .single();

      if (
        !profileError &&
        profile &&
        profile.subscription_status === "active"
      ) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const handleCheckout = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setError("Failed to get session");
      setIsLoading(false);
      return;
    }

    try {
      // Create checkout session through our API
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details
          ? `Error: ${data.error}. Details: ${data.details}`
          : data.error || "Failed to create checkout session";

        console.error("Checkout error response:", data);
        throw new Error(errorMessage);
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = async () => {
    if (!user) {
      console.error("No user found");
      setError("User session not found. Please try logging in again.");
      return;
    }

    // Update user in the DB to have a clear non-paid status
    try {
      // Update the profile to explicitly mark as non-paid
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "none",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile status:", error);
      }

      // Also add the user to the waitlist for free trial
      if (user && user.email) {
        const name = user.user_metadata?.name || "";
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email.trim().toLowerCase(),
            name: name || undefined,
            source: "payment_page_waitlist",
          }),
        });

        if (!response.ok) {
          console.error("Failed to add to waitlist:", await response.json());
        } else {
          console.log("Successfully added to waitlist");
        }
      }

      // Redirect to dashboard - middleware will handle proper access control
      router.push("/dashboard");
    } catch (err) {
      console.error("Error skipping payment:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#facc15]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-3xl font-bold text-[#facc15]">T2A</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Subscription</h1>
          <p className="text-[#b3b3b3] mt-2">Get full access to T2A features</p>
        </div>

        <div className="mb-6 p-4 bg-[#262626]/50 rounded-lg border border-[#facc15]/20">
          <p className="text-white text-sm">
            <span className="font-semibold text-[#facc15]">
              Looking for passionate beta testers!
            </span>{" "}
            We want users who are truly excited about our product and will
            provide valuable feedback. Subscribe to get immediate access to all
            features.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-900/30 text-red-300 rounded-md border border-red-700">
            {error}
          </div>
        )}

        <div className="bg-[#262626] rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">T2A Premium</h2>
              <p className="text-[#b3b3b3] text-sm mt-1">
                Monthly subscription
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">$4.95</div>
              <div className="text-[#b3b3b3] text-xs">/month</div>
            </div>
          </div>

          <ul className="space-y-3 mt-6">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-[#facc15] mt-0.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-[#b3b3b3]">
                Unlimited audio/video recordings
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-[#facc15] mt-0.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-[#b3b3b3]">
                AI-powered transcription & analysis
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-[#facc15] mt-0.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-[#b3b3b3]">Google Sheets integration</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-[#facc15] mt-0.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-[#b3b3b3]">Cancel anytime</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg text-black font-semibold ${
            isLoading
              ? "bg-[#facc15]/70 cursor-not-allowed"
              : "bg-[#facc15] hover:bg-[#fde047]"
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:ring-offset-2 focus:ring-offset-[#262626] shadow-md`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Subscribe for $4.95/month"
          )}
        </button>

        <div className="text-center mt-6">
          <button
            onClick={handleSkipForNow}
            className="text-sm bg-transparent border border-[#373737] text-[#b3b3b3] hover:text-white hover:border-[#facc15]/30 py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Join Free Trial Waitlist
          </button>
          <p className="text-xs text-[#b3b3b3] mt-2">
            We&apos;ll notify you when free trials become available!
          </p>
        </div>
      </div>
    </div>
  );
}
