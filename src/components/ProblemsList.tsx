"use client";

import { useState, useEffect, useCallback } from "react";
import ProblemCard from "@/components/ProblemCard";

export interface Problem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  created_at: string;
}

interface ProblemsListProps {
  activeTag: string | null;
  onTagClick: (tag: string) => void;
}

export default function ProblemsList({
  activeTag,
  onTagClick,
}: ProblemsListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // Function to fetch problems
  const fetchProblems = useCallback(async () => {
    try {
      const endpoint = activeTag
        ? `/api/problems?tag=${encodeURIComponent(activeTag)}`
        : "/api/problems";

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch problems");
      }

      const data = await response.json();
      setProblems(data);

      // Extract unique tags from all problems
      const uniqueTags = Array.from(
        new Set(data.flatMap((problem: Problem) => problem.tags || []))
      );

      setTags(uniqueTags as string[]);
      setError(null);
    } catch (err) {
      setError("Failed to load problems. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTag]);

  // Fetch problems on mount and when activeTag changes
  useEffect(() => {
    fetchProblems();

    // Set up polling to refresh problems every 30 seconds
    const intervalId = setInterval(fetchProblems, 30000);

    return () => clearInterval(intervalId);
  }, [fetchProblems]);

  // Handle upvoting a problem
  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/problems/${id}/upvote`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to upvote problem");
      }

      const { votes } = await response.json();

      // Update the problem in the local state
      setProblems((prevProblems) =>
        prevProblems.map((problem) =>
          problem.id === id ? { ...problem, votes } : problem
        )
      );
    } catch (err) {
      console.error("Error upvoting problem:", err);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="w-8 h-8 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-white/60">Loading problems...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center p-8 text-red-400">
        <p>{error}</p>
        <button
          onClick={fetchProblems}
          className="mt-4 px-4 py-2 bg-[#262626] text-white rounded-lg hover:bg-[#373737] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show empty state
  if (problems.length === 0) {
    return (
      <div className="text-center p-8 bg-[#1a1a1a] rounded-xl border border-[#373737]">
        <p className="text-white/60">
          {activeTag
            ? `No problems found with the tag "${activeTag}"`
            : "No problems have been submitted yet"}
        </p>
        {activeTag && (
          <button
            onClick={() => onTagClick("")}
            className="mt-4 px-4 py-2 bg-[#262626] text-white rounded-lg hover:bg-[#373737] transition-colors"
          >
            View All Problems
          </button>
        )}
      </div>
    );
  }

  // Sort problems by votes (highest first)
  const sortedProblems = [...problems].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex overflow-x-auto pb-2 space-x-2 mb-4">
          <button
            onClick={() => onTagClick("")}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTag === null
                ? "bg-[#facc15] text-black"
                : "bg-[#262626] text-white hover:bg-[#373737]"
            }`}
          >
            All Problems
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                activeTag === tag
                  ? "bg-[#facc15] text-black"
                  : "bg-[#262626] text-white hover:bg-[#373737]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Problems list */}
      <div className="space-y-4">
        {sortedProblems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            onUpvote={handleUpvote}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  );
}
