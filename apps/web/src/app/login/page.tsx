"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/actions/login/actions";
import { useActionState } from "react";
import GoogleOneTap from "@/components/GoogleOneTap";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const [formState, formAction, isPending] = useActionState(
    async (_prevState: { error: string }, formData: FormData) => {
      const result = await login(formData);
      return { error: result.error ?? "" };
    },
    { error: "" }
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#010101] p-4">
      <GoogleOneTap redirect="/dashboard" />

      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-3xl font-bold text-[#facc15]">T2A</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Login</h1>
          <p className="text-[#b3b3b3] mt-2">Access your T2A account.</p>
        </div>

        {formState?.error && (
          <div className="mb-4 p-3 text-sm bg-red-900/30 text-red-300 rounded-md border border-red-700">
            {formState.error}
            {formState.error.includes("failed") && (
              <p className="mt-2 text-sm">
                Having trouble? Try{" "}
                <Link
                  href="/auth/clear-cookies"
                  className="text-[#facc15] underline"
                >
                  clearing your cookies
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#b3b3b3] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#b3b3b3] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 px-4 rounded-lg text-black font-semibold ${
              isPending
                ? "bg-[#facc15]/70 cursor-not-allowed"
                : "bg-[#facc15] hover:bg-[#fde047]"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:ring-offset-2 focus:ring-offset-[#262626] shadow-md`}
          >
            {isPending ? (
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
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#373737]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-[#b3b3b3]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={async () => {
                // Use the browser Supabase client for OAuth to respect redirectTo
                try {
                  const supabase = createClient();
                  const urlParams = new URLSearchParams(window.location.search);
                  const next = urlParams.get("redirect") || "/dashboard";
                  const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo,
                      queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                      },
                    },
                  });
                  if (error) {
                    console.error("Google OAuth error:", error);
                  } else if (data.url) {
                    window.location.href = data.url;
                  }
                } catch (err) {
                  console.error("Google sign-in error:", err);
                }
              }}
              className="w-full flex items-center justify-center py-3 px-4 gap-3 border border-[#373737] rounded-lg bg-[#262626] hover:bg-[#333333] transition-colors duration-200 text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-[#b3b3b3]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#facc15] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-[#facc15] hover:underline">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
