"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Problem } from "./ProblemsList";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import { ArrowBigUp } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface ProblemCardProps {
  problem: Problem;
  onTagClick: (tag: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  refreshProblems: () => void;
}

export default function ProblemCard({
  problem,
  onTagClick,
  onDelete,
  isAdmin = false,
  refreshProblems,
}: ProblemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUserAndUpvotes = async () => {
      const supabase = await createClient();
      const {
        data: { user: currentUserData },
      } = await supabase.auth.getUser();
      setUser(currentUserData);

      if (currentUserData) {
        const { data, error } = await supabase
          .from("problem_upvotes")
          .select()
          .eq("problem_id", problem.id)
          .eq("user_id", currentUserData.id)
          .single();

        if (!error && data) {
          setHasUpvoted(true);
        }
      }
    };

    checkUserAndUpvotes();
  }, [problem.id]);

  // Format the date as "X days ago" or similar
  const formattedDate = formatDistanceToNow(new Date(problem.created_at), {
    addSuffix: true,
  });

  // Check if the post is less than 24 hours old
  const isRecent =
    new Date().getTime() - new Date(problem.created_at).getTime() <
    24 * 60 * 60 * 1000;

  const handleVote = async () => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsLoading(true);

    try {
      if (hasUpvoted) {
        // Unvote - delete upvote
        const response = await fetch(`/api/problem_upvotes`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ problem_id: problem.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove vote");
        }
      } else {
        // Upvote - create new upvote
        const response = await fetch(`/api/problem_upvotes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ problem_id: problem.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to upvote");
        }
      }

      // Update local state
      setHasUpvoted(!hasUpvoted);

      // Refresh problems list to show updated vote count
      refreshProblems();
    } catch (error) {
      console.error("Error toggling vote:", error);
      toast.error("Failed to update vote");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete click
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || isDeleting) return;

    if (window.confirm("Are you sure you want to delete this problem?")) {
      setIsDeleting(true);
      await onDelete(problem.id);
    }
  };

  return (
    <div
      className={`bg-[#262626] rounded-2xl border border-[#373737] overflow-hidden transition-all duration-300 
      hover:shadow-lg hover:border-[#4a4a4a] hover:translate-y-[-4px] hover:bg-[#333] ${isRecent ? "ring-2 ring-[#facc15]/30" : ""} relative`}
    >
      {/* Vote Count Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#1a1a1a]/60 backdrop-blur-sm px-2 py-1 rounded-full">
        <button
          onClick={handleVote}
          disabled={isLoading}
          className={`group ${
            isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          aria-label={hasUpvoted ? "Remove upvote" : "Upvote this problem"}
        >
          <ArrowBigUp
            size={24}
            fill={hasUpvoted ? "currentColor" : "none"}
            className={`${hasUpvoted ? "text-[#facc15]" : "text-gray-400"} group-hover:text-[#fde047] transition-colors`}
          />
        </button>
        <span className="text-white/90 text-sm font-medium">
          {problem.votes}
        </span>
      </div>

      {/* Admin Delete Button */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-3 left-3 z-10 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
          title="Delete problem"
          aria-label="Delete problem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Add this inside the main div, after vote button */}
      <div className="p-5 pt-12" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
        <p className="text-white/80 mb-4 whitespace-pre-line">
          {isExpanded
            ? problem.description
            : problem.description.length > 120
              ? problem.description.substring(0, 120) + "..."
              : problem.description}
          {problem.description.length > 120 && (
            <button
              className="text-purple-400 ml-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
        {/* Add tags section after description */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {problem.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full hover:bg-purple-500/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        <div className="text-white/40 text-xs">Posted {formattedDate}</div>
      </div>
    </div>
  );
}
