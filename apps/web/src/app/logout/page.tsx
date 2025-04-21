"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { signout } from "@/actions/login/actions";
// import { useRouter } from "next/navigation";

export default function Logout() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const router = useRouter();

  // Logout function with better error handling
  const performLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await signout();

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Force a complete page reload to clear all state
        window.location.href = "/";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      performLogout();
    }, 100);

    return () => clearTimeout(timer);
  }, [performLogout]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl text-center">
        {isLoading ? (
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
            <div className="bg-red-900/20 p-4 rounded-lg mb-6 border border-red-800/40">
              <h1 className="text-2xl font-bold text-white mb-4">
                Logout Failed
              </h1>
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-[#b3b3b3] text-sm">
                There was a problem signing you out. Please try again.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Link
                href="/dashboard"
                className="bg-[#262626] text-white hover:text-[#facc15] px-4 py-2 rounded transition-colors"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={performLogout}
                className="bg-[#facc15] text-black px-4 py-2 rounded hover:bg-[#fde047] transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
