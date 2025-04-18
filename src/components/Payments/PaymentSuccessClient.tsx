// components/PaymentSuccessClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [step, setStep] = useState<"loading" | "error" | "done">("loading");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session ID");
      setStep("error");
      return;
    }

    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const { error: msg } = await res.json();
          throw new Error(msg || "Verification failed");
        }
        setStep("done");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setStep("error");
      });
  }, [router, sessionId]);

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
        <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl text-center">
          <div className="animate-spin mb-6 h-12 w-12 border-t-4 border-b-4 border-[#facc15] rounded-full mx-auto"></div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Processing Your Payment
          </h1>
          <p className="text-[#b3b3b3]">Please wait a moment…</p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
        <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl text-center">
          <div className="text-red-500 mb-6">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h.01m0 0v.01m0-.01V12m0 0a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Verification Failed
          </h1>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/payment"
            className="bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-2 rounded-lg"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl text-center">
        <div className="text-green-500 mb-6">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m0 0a9 9 0 110-18 9 9 0 010 18z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-[#b3b3b3] mb-6">
          Thank you for subscribing—redirecting to dashboard…
        </p>
        <Link
          href="/dashboard"
          className="bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-2 rounded-lg"
        >
          Go Now
        </Link>
      </div>
    </div>
  );
}
