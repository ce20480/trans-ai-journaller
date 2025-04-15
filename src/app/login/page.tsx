"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log("Sending auth request with:", { username, password });

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Auth response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect to dashboard after successful login
      console.log("Authentication successful, redirecting to dashboard...");
      router.push("/dashboard");

      // Fallback redirect if router.push doesn't work
      setTimeout(() => {
        console.log("Fallback redirect activated");
        window.location.href = "/dashboard";
      }, 500);
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-700 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            {/* Replace with actual logo if available */}
            <svg
              className="w-10 h-10 text-primary dark:text-primary mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59L18 8h5v13H1V3h6zM1 14h6m-6 4h6m7-4h6"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login to Your Account
          </h1>
          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Access the TransAI dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent transition duration-150 ease-in-out text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent transition duration-150 ease-in-out text-gray-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              isLoading
                ? "bg-teal-400 dark:bg-teal-700 cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          <Link
            href="/"
            className="text-sm text-primary dark:text-accent hover:underline"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
