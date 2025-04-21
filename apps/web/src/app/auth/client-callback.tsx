"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ClientCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleHashFragment() {
      try {
        // Check if there's a hash fragment with an access token
        if (
          window.location.hash &&
          window.location.hash.includes("access_token")
        ) {
          console.log("Found access token in URL fragment");

          // Extract the hash fragment without the #
          const hashFragment = window.location.hash.substring(1);

          // Parse the fragment
          const params = new URLSearchParams(hashFragment);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (!accessToken) {
            throw new Error("No access token found in URL");
          }

          // Create a client
          const supabase = createClient();

          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            throw error;
          }

          // Get user role to determine where to redirect
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user?.user_metadata?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } else {
          // No hash fragment with token, assume the server-side handler worked
          setLoading(false);
        }
      } catch (err) {
        console.error("Error processing auth callback:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setLoading(false);
      }
    }

    handleHashFragment();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#010101]">
        <div className="animate-spin w-8 h-8 border-4 border-[#facc15] border-t-transparent rounded-full mb-4"></div>
        <p className="text-white">Processing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#010101] p-4">
        <div className="bg-red-900/30 text-red-300 p-4 rounded-md border border-red-700 max-w-md text-center">
          <p className="font-bold mb-2">Authentication Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 bg-[#facc15] text-black px-4 py-2 rounded"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
