"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/actions/login/actions";
import { useActionState } from "react";

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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
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
