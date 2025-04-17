"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl shadow-2xl text-center">
        <div className="mb-6">
          <svg
            className="h-16 w-16 text-[#facc15] mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Verify Your Email
        </h1>
        <p className="text-[#b3b3b3] mb-6">
          We&apos;ve sent a verification link to{" "}
          <span className="text-white font-medium">{email}</span>. Please check
          your inbox and click the link to activate your account.
        </p>
        <p className="text-[#b3b3b3] mb-8">
          After verification, you can log in to complete your registration and
          access your account.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#facc15] hover:bg-[#fde047] text-black px-6 py-3 rounded-lg text-sm font-medium transition-colors w-full text-center"
        >
          Back to Login
        </Link>
        <div className="mt-6 text-sm text-[#b3b3b3]">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          <Link href="/register" className="text-[#facc15] hover:underline">
            try again
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
