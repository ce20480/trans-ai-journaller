// app/verify-email/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const interval = useRef<NodeJS.Timeout | null>(null);

  // Countdown for "Resend"
  const startCount = () => {
    setResendDisabled(true);
    setTimer(60);
    interval.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval.current!);
          setResendDisabled(false);
          return 60;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);

  const handleResend = async () => {
    setError(null);
    startCount();
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleContinue = () => {
    // Redirect to dashboard instead of just refreshing
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#010101] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full space-y-4 text-white text-center">
        <h1 className="text-2xl font-bold">Almost there!</h1>
        <p>
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-mono text-[#facc15]">{email}</span>.
        </p>
        {error && <p className="text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleContinue}
            className="flex-1 py-2 rounded bg-[#facc15] hover:bg-[#fde047] text-black"
          >
            Continue
          </button>
          <button
            onClick={handleResend}
            disabled={resendDisabled}
            className={`flex-1 py-2 rounded ${
              resendDisabled
                ? "bg-[#373737] cursor-not-allowed text-[#666]"
                : "bg-[#262626] hover:bg-[#373737] text-white"
            }`}
          >
            {resendDisabled ? `Resend in ${timer}s` : "Resend email"}
          </button>
        </div>
      </div>
    </div>
  );
}
