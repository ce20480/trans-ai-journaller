"use client";

import { useState, useEffect } from "react";
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
  isAdmin?: boolean;
  problems: Problem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ProblemsList({
  activeTag,
  onTagClick,
  isAdmin = false,
  problems,
  loading,
  onRefresh,
}: ProblemsListProps) {
  const [tags, setTags] = useState<string[]>([]);

  // Extract unique tags from problems
  useEffect(() => {
    if (problems.length) {
      const uniqueTags = Array.from(
        new Set(problems.flatMap((problem: Problem) => problem.tags || []))
      );
      setTags(uniqueTags as string[]);
    }
  }, [problems]);

  // Handle deleting a problem (admin only)
  const handleDelete = async (id: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete problem");
      }

      // Refresh problems after deletion
      onRefresh();
    } catch (err) {
      console.error("Error deleting problem:", err);
    }
  };

  // Show loading state with skeleton cards
  if (loading) {
    return (
      <div className="border border-[#373737] rounded-2xl shadow-lg p-6 bg-[#1a1a1a]/40 backdrop-blur-sm">
        <div className="text-center mb-6 text-white/70 italic">
          Come share your thoughts — I always wanted a spot to just dump my
          problems, so I built one.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#262626] rounded-2xl border border-[#373737] overflow-hidden animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="h-6 bg-[#373737] rounded w-3/4"></div>
                <div className="h-4 bg-[#373737] rounded w-full"></div>
                <div className="h-4 bg-[#373737] rounded w-5/6"></div>
                <div className="h-4 bg-[#373737] rounded w-4/6"></div>
                <div className="h-3 bg-[#373737] rounded w-2/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state
  if (problems.length === 0) {
    return (
      <div className="border border-[#373737] rounded-2xl shadow-lg p-6 bg-[#1a1a1a]/40 backdrop-blur-sm">
        <div className="text-center mb-6 text-white/70 italic">
          Come share your thoughts — I always wanted a spot to just dump my
          problems, so I built one.
        </div>
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
      </div>
    );
  }

  // Sort problems by votes (highest first)
  const sortedProblems = [...problems].sort((a, b) => b.votes - a.votes);

  return (
    <div className="border border-[#373737] rounded-2xl shadow-lg p-6 bg-[#1a1a1a]/40 backdrop-blur-sm">
      <div className="text-center mb-6 text-white/70 italic">
        Come share your thoughts — I always wanted a spot to just dump my
        problems, so I built one.
      </div>

      {isAdmin && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-lg mb-4">
          <p className="font-medium">Admin Mode: You can delete problems.</p>
        </div>
      )}

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

      {/* Problems list - Masonry style grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {sortedProblems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            onTagClick={onTagClick}
            onDelete={handleDelete}
            isAdmin={isAdmin}
            refreshProblems={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
