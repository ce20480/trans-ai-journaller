"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionPopup({
  isOpen,
  onClose,
}: SubscriptionPopupProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleWaitlist = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("Not authenticated");
      }

      // Add user to waitlist
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.session.user.email,
          name: session.session.user.user_metadata?.name || undefined,
          source: "free_notes_limit",
        }),
      });

      // Update user profile to indicate they're on the waitlist
      await supabase
        .from("profiles")
        .update({ subscription_status: "none" })
        .eq("id", session.session.user.id);

      // Close the popup and redirect to home
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Error adding to waitlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-[#facc15]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            You&apos;ve reached your free notes limit
          </h3>
          <p className="text-[#b3b3b3]">
            You&apos;ve used all 3 of your free notes. Subscribe to T2A Premium
            to continue capturing and organizing your brilliant ideas.
          </p>
        </div>

        <div className="bg-[#262626] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-semibold text-white">T2A Premium</h4>
            <div className="text-right">
              <div className="text-lg font-bold text-white">$4.95</div>
              <div className="text-[#b3b3b3] text-xs">/month</div>
            </div>
          </div>

          <ul className="space-y-2 mt-3">
            {[
              "Unlimited notes",
              "AI-powered transcription & analysis",
              "Google Sheets integration",
              "Cancel anytime",
            ].map((item) => (
              <li key={item} className="flex items-start">
                <svg
                  className="h-5 w-5 text-[#facc15] mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-[#b3b3b3]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/payment"
            className="w-full py-3 rounded-lg text-black font-semibold bg-[#facc15] hover:bg-[#fde047] transition-colors text-center"
          >
            Subscribe Now
          </Link>

          <button
            onClick={handleWaitlist}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-normal bg-transparent border border-[#373737] hover:border-[#facc15] transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : "Join Free Trial Waitlist"}
          </button>

          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white text-sm mt-2"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

// CSS animation for fade-in effect
// Add this to your globals.css if it doesn't exist
/*
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
*/
