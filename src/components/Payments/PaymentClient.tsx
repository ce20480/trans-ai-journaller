"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface Props {
  user: User;
}

export default function PaymentClient({ user }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = async () => {
    // mark them as 'none' and redirect
    await supabase
      .from("profiles")
      .update({ subscription_status: "none" })
      .eq("id", user.id);

    // add to waitlist
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.name || undefined,
        source: "payment_page_waitlist",
      }),
    });

    router.push("/");
  };

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
            Subscribe to get immediate access to all features.
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
            {[
              "Unlimited audio/video recordings",
              "AI-powered transcription & analysis",
              "Google Sheets integration",
              "Cancel anytime",
            ].map((item) => (
              <li key={item} className="flex items-start">
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
                  />
                </svg>
                <span className="text-[#b3b3b3]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-black font-semibold ${
            isLoading
              ? "bg-[#facc15]/70 cursor-not-allowed"
              : "bg-[#facc15] hover:bg-[#fde047]"
          } transition-colors`}
        >
          {isLoading ? "Processing…" : "Subscribe for $4.95/month"}
        </button>

        <div className="text-center mt-6">
          <button
            onClick={handleSkipForNow}
            className="text-sm bg-transparent border border-[#373737] text-[#b3b3b3] hover:text-white hover:border-[#facc15] py-2 px-4 rounded-lg"
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
