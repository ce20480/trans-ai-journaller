"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Invalid session ID");
        setIsLoading(false);
        return;
      }

      try {
        // Verify the payment was successful and update user subscription
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to verify payment");
        }

        // After 3 seconds, redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl text-center">
        {isLoading ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#facc15]"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Processing Your Payment
            </h1>
            <p className="text-[#b3b3b3]">
              Please wait while we confirm your payment...
            </p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center mb-6">
              <svg
                className="h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-red-400 mb-6">{error}</p>
            <Link
              href="/payment"
              className="inline-block bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </Link>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-[#b3b3b3] mb-6">
              Thank you for subscribing to T2A Premium. You now have full access
              to all features!
            </p>
            <p className="text-[#b3b3b3] mb-8">
              You&apos;ll be redirected to the dashboard in a moment...
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Go to Dashboard Now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
