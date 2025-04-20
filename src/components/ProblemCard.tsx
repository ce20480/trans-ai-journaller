"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Problem } from "./ProblemsList";

interface ProblemCardProps {
  problem: Problem;
  onUpvote: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export default function ProblemCard({
  problem,
  onUpvote,
  onTagClick,
}: ProblemCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date as "X days ago" or similar
  const formattedDate = formatDistanceToNow(new Date(problem.created_at), {
    addSuffix: true,
  });

  // Handle upvote click
  const handleUpvote = async () => {
    if (isUpvoting) return;

    setIsUpvoting(true);
    await onUpvote(problem.id);

    // Add a small delay to prevent rapid clicking
    setTimeout(() => {
      setIsUpvoting(false);
    }, 300);
  };

  // Truncate description if needed
  const shouldTruncate = problem.description.length > 200 && !isExpanded;
  const displayDescription = shouldTruncate
    ? problem.description.substring(0, 200) + "..."
    : problem.description;

  return (
    <div className="bg-[#262626] rounded-2xl border border-[#373737] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#4a4a4a]">
      <div className="p-6">
        <div className="flex items-start">
          {/* Upvote button */}
          <div className="mr-4 flex flex-col items-center">
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`group flex flex-col items-center ${
                isUpvoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <svg
                className="w-6 h-6 text-[#facc15] group-hover:text-[#fde047] transform group-hover:-translate-y-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="text-white font-semibold mt-1">
                {problem.votes}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              {problem.title}
            </h3>

            <p className="text-white/80 mb-4 whitespace-pre-line">
              {displayDescription}
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-[#facc15] hover:text-[#fde047] ml-2 focus:outline-none"
                >
                  Read more
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-[#facc15] hover:text-[#fde047] ml-2 focus:outline-none"
                >
                  Show less
                </button>
              )}
            </p>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {problem.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="px-2 py-1 bg-[#facc15]/10 text-[#facc15] text-xs rounded-full hover:bg-[#facc15]/20 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Date */}
            <div className="text-white/40 text-xs">Posted {formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
