"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthConfirmPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Pull session from URL fragment, store cookies
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: params.get("token_hash") || "",
        type: "email",
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      const session = data.session;

      if (!session) {
        setErrorMsg("Couldn’t establish session. Please try again.");
        return;
      }

      // Fetch their subscription status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", session.user.id)
        .single();

      const isPaid = profile?.subscription_status === "active";
      const isAdmin = session.user.user_metadata?.role === "admin";

      // Final redirect
      if (isAdmin || isPaid) {
        router.replace("/dashboard");
      } else {
        router.replace("/payment");
      }
    })();
  }, [router, supabase, params]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-red-500 text-red-300">
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p>{errorMsg}</p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 px-4 py-2 bg-[#facc15] hover:bg-[#fde047] text-black rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#facc15]" />
        <p className="text-[#b3b3b3]">Verifying your email…</p>
      </div>
    </div>
  );
}
