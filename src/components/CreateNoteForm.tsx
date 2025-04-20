"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import SubscriptionPopup from "./SubscriptionPopup";

export default function CreateNoteForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    subscription_status: string;
    free_notes_count: number;
  } | null>(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  // Load user profile and check subscription status
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/login");
          return;
        }

        setUserRole(session.user.user_metadata?.role || "");

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_status, free_notes_count")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (profile) {
          setUserProfile({
            subscription_status: profile.subscription_status,
            free_notes_count: profile.free_notes_count || 0,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadUserProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error("Title and content are required");
      }

      // Check if user has reached free notes limit
      if (
        userProfile &&
        userRole !== "admin" &&
        userProfile.subscription_status !== "active" &&
        userProfile.free_notes_count >= 3
      ) {
        setShowSubscriptionPopup(true);
        return;
      }

      // Create note via API
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Payment required - show subscription popup
          setShowSubscriptionPopup(true);
          return;
        }
        throw new Error(result.error || "Failed to create note");
      }

      // Reset form and redirect to notes page
      setTitle("");
      setContent("");
      router.push("/dashboard/notes");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />

      {/* Free Notes Counter */}
      {userProfile &&
        userRole !== "admin" &&
        userProfile.subscription_status !== "active" && (
          <div className="mb-6 p-4 bg-[#262626] rounded-lg border border-[#373737]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">
                  <span className="font-medium">Free Notes:</span>{" "}
                  <span
                    className={
                      userProfile.free_notes_count >= 3
                        ? "text-red-400"
                        : "text-[#facc15]"
                    }
                  >
                    {userProfile.free_notes_count}/3
                  </span>{" "}
                  used
                </p>
                <p className="text-sm text-[#b3b3b3]">
                  {userProfile.free_notes_count >= 3
                    ? "You've reached your free notes limit. Subscribe for unlimited notes."
                    : `You can create ${3 - userProfile.free_notes_count} more free notes.`}
                </p>
              </div>
              {userProfile.free_notes_count >= 3 && (
                <button
                  onClick={() => setShowSubscriptionPopup(true)}
                  className="bg-[#facc15] hover:bg-[#fde047] text-black px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[#b3b3b3] mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition-colors text-white"
            placeholder="Enter note title..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-[#b3b3b3] mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition-colors text-white min-h-[200px]"
            placeholder="Write your thoughts here..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isLoading ||
              ((userProfile?.free_notes_count ?? 0) >= 3 &&
                userProfile?.subscription_status !== "active" &&
                userRole !== "admin")
            }
            className={`px-6 py-3 rounded-lg text-black font-semibold ${
              isLoading
                ? "bg-[#facc15]/70 cursor-not-allowed"
                : (userProfile?.free_notes_count ?? 0) >= 3 &&
                    userProfile?.subscription_status !== "active" &&
                    userRole !== "admin"
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#facc15] hover:bg-[#fde047]"
            } transition-colors focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 shadow-md`}
          >
            {isLoading ? "Creating..." : "Save Note"}
          </button>
        </div>
      </form>
    </>
  );
}
