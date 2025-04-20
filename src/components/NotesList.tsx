"use client";

import { useState, useEffect, useCallback } from "react";
import NoteCard from "./NoteCard";
import SubscriptionPopup from "./SubscriptionPopup";
import { createClient } from "@/utils/supabase/client";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary: string | null;
  tag: string | null;
  created_at: string;
}

export interface UserProfile {
  subscription_status: string;
  free_notes_count: number;
}

export default function NotesList() {
  const supabase = createClient();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("user");

  // 1️⃣ Load session + role
  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();
      if (sessErr || !session) {
        setError("Please log in to view your notes.");
        setLoading(false);
        return;
      }
      setUserRole(session.user.user_metadata?.role ?? "user");

      // Also fetch the user profile to get subscription status and free notes count
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("subscription_status, free_notes_count")
        .eq("id", session.user.id)
        .single();

      if (profileErr) {
        console.error("Error fetching user profile:", profileErr);
      } else if (profile) {
        setUserProfile({
          subscription_status: profile.subscription_status,
          free_notes_count: profile.free_notes_count || 0,
        });
      }
    })();
  }, [supabase]);

  // 2️⃣ Fetch notes once role is known
  useEffect(() => {
    if (userRole === "") return; // wait for role to populate
    if (userRole !== "admin" && userRole !== "user") {
      setError("Unauthorized");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const userId = session.user.id;
        const { data, error: notesErr } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (notesErr) throw notesErr;
        setNotes(data || []);
        // derive tag list
        const tags = Array.from(
          new Set(
            data
              .map((n) => n.tag)
              .filter((t): t is string => !!t && t.length > 0)
          )
        ).sort();
        setUniqueTags(tags);
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase, userRole]);

  // 3️⃣ in‑memory filtering
  const filtered = notes.filter((n) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesText =
      !term ||
      n.title.toLowerCase().includes(term) ||
      (n.summary?.toLowerCase().includes(term) ?? false);
    const matchesTag = !selectedTag || n.tag === selectedTag;
    return matchesText && matchesTag;
  });

  // Function to check if user should see subscription popup
  const checkFreeNotesLimit = useCallback(() => {
    if (!userProfile) return;

    // Don't show popup for admins or paid users
    if (userRole === "admin" || userProfile.subscription_status === "active") {
      return;
    }

    // Show popup if user has reached 3 free notes
    if (userProfile.free_notes_count >= 3) {
      setShowSubscriptionPopup(true);
    }
  }, [userProfile, userRole]);

  // 4️⃣ delete handler
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this note?")) return;

      try {
        const {
          data: { session },
          error: sessErr,
        } = await supabase.auth.getSession();
        if (sessErr || !session) throw new Error("Not authenticated");

        const res = await fetch("/api/notes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, user_id: session.user.id }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to delete");
        }
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      }
    },
    [supabase]
  );

  // Check free notes limit when component mounts
  useEffect(() => {
    if (userProfile) {
      checkFreeNotesLimit();
    }
  }, [userProfile, checkFreeNotesLimit]);

  if (loading) {
    return (
      <div className="text-center py-10 text-[#b3b3b3]">Loading notes…</div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Limit Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />

      {/* Search & Tag filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-[#1a1a1a] p-4 rounded border border-[#373737]">
        <input
          type="text"
          placeholder="Search notes…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#262626] border border-[#373737] px-4 py-2 rounded flex-1 text-white"
        />

        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full ${
              selectedTag === null
                ? "bg-[#facc15] text-black"
                : "bg-[#262626] text-white hover:bg-[#373737]"
            }`}
          >
            All
          </button>
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full ${
                selectedTag === tag
                  ? "bg-[#facc15] text-black"
                  : "bg-[#262626] text-white hover:bg-[#373737]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Free Notes Limit Notice */}
      {userProfile &&
        userProfile.subscription_status !== "active" &&
        userRole !== "admin" && (
          <div className="p-4 bg-[#262626] rounded border border-[#373737]">
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
                  Subscribe for unlimited notes and features.
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

      {/* Note Cards */}
      {filtered.length === 0 ? (
        <div className="p-6 bg-[#262626] rounded border border-[#373737] text-center text-[#b3b3b3]">
          {notes.length === 0
            ? "You haven't created any notes yet."
            : "No notes match your filters."}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              // only pass summary/tag when non-null
              summary={note.summary ?? undefined}
              tag={note.tag ?? undefined}
              created_at={note.created_at}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
