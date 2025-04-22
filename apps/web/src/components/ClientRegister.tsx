"use client";
import React from "react";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";
import { createClient } from "@/utils/supabase/client";

export default function ClientRegister() {
  const handleGoogleSignUp = async () => {
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
        "/dashboard"
      )}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) {
        console.error("Google sign-up error:", error);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google sign-up error:", err);
    }
  };

  return (
    <>
      <RegisterForm />
      <div className="mt-6">
        <div className="flex items-center">
          <div className="flex-grow h-px bg-[#373737]" />
          <span className="px-2 text-[#b3b3b3] text-sm">Or continue with</span>
          <div className="flex-grow h-px bg-[#373737]" />
        </div>
        <button
          onClick={handleGoogleSignUp}
          className="mt-4 w-full flex items-center justify-center px-4 py-3 gap-3 border border-[#373737] rounded-lg bg-[#262626] hover:bg-[#333333] transition-colors text-white"
        >
          {/* SVG icon omitted for brevity */}
          Sign up with Google
        </button>
      </div>
      <p className="mt-6 text-center text-[#b3b3b3] text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-[#facc15] hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
