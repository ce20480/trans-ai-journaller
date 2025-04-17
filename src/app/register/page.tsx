"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/actions/login/actions";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the server action to handle registration
      const result = await signup(formData);

      // If there's an error returned from the server action
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-3xl font-bold text-[#facc15]">T2A</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create an Account</h1>
          <p className="text-[#b3b3b3] mt-2">
            Join T2A and never lose an idea again
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-900/30 text-red-300 rounded-md border border-red-700">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#b3b3b3] mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
              required
            />
          </div>

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
            <p className="text-xs text-[#b3b3b3] mt-1">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#b3b3b3] mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-black font-semibold ${
              isLoading
                ? "bg-[#facc15]/70 cursor-not-allowed"
                : "bg-[#facc15] hover:bg-[#fde047]"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:ring-offset-2 focus:ring-offset-[#262626] shadow-md mt-6`}
          >
            {isLoading ? (
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
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-[#b3b3b3]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#facc15] hover:underline">
              Login
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
