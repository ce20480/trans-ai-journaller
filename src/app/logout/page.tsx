"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Logout() {
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        setIsLoggingOut(true);
        await supabase.auth.signOut();

        // Wait a moment to show the success state
        setTimeout(() => {
          setIsLoggingOut(false);
        }, 1000);
      } catch (err) {
        console.error("Logout error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [supabase.auth]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl text-center">
        {isLoggingOut ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#facc15]"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Logging Out...
            </h1>
            <p className="text-[#b3b3b3]">Please wait while we sign you out.</p>
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
              Logout Failed
            </h1>
            <p className="text-red-400 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Dashboard
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
              Successfully Logged Out
            </h1>
            <p className="text-[#b3b3b3] mb-6">
              You have been successfully logged out of your account.
            </p>

            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Log In Again
              </Link>
              <p className="text-[#b3b3b3] text-sm">
                If you&apos;ve just been granted admin privileges, log in again
                to access admin features.
              </p>
              <Link
                href="/"
                className="block text-sm text-[#facc15] hover:underline"
              >
                Return to Home Page
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
