"use client";

import { useState, useEffect, useCallback } from "react";
import ProblemsList from "@/components/ProblemsList";
import { createClient } from "@/utils/supabase/client";
import AddProblemModal from "@/components/AddProblemModal";
import { Problem } from "@/components/ProblemsList";

export default function CommunityPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [userDailySubmissionCount, setUserDailySubmissionCount] = useState(0);
  const LIMIT = 12;
  const MAX_SUBMISSIONS = 3;

  const handleTagClick = (tag: string | null) => {
    setActiveTag(tag);
    setPage(0); // Reset pagination when changing tags
  };

  // Initialize submission count from localStorage for non-authenticated users
  useEffect(() => {
    // Only run in the browser, not during server-side rendering
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("problemSubmissionCount");
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        setUserDailySubmissionCount(count);
      }
    }
  }, []);

  // Update localStorage when submission count changes for non-authenticated users
  useEffect(() => {
    // Only run in the browser, not during server-side rendering
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "problemSubmissionCount",
        userDailySubmissionCount.toString()
      );
    }
  }, [userDailySubmissionCount]);

  // Check if user is admin and get their submission count
  useEffect(() => {
    const checkUserStatus = async () => {
      const supabase = createClient();

      // Get authenticated user data
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("User metadata:", user?.user_metadata);

      if (user?.user_metadata?.role === "admin") {
        setIsAdmin(true);
        console.log("Admin status: true");
      } else {
        console.log("Admin status: false - Role is not admin");
      }

      // If user is authenticated, get their daily submission count
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: submissionData } = await supabase
          .from("user_problem_submissions")
          .select("count")
          .eq("user_id", user.id)
          .eq("submission_date", today.toISOString().split("T")[0])
          .single();

        if (submissionData) {
          setUserDailySubmissionCount(submissionData.count);
        }
      }
    };

    checkUserStatus();
  }, []);

  const fetchProblems = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const offset = pageNum * LIMIT;
        const endpoint = activeTag
          ? `/api/problems?tag=${encodeURIComponent(activeTag)}&limit=${LIMIT}&offset=${offset}`
          : `/api/problems?limit=${LIMIT}&offset=${offset}`;

        console.log(`Fetching problems for page ${pageNum}, offset: ${offset}`);
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch problems");
        }

        const result = await response.json();
        const problemsData = result.data || [];

        console.log(`Received ${problemsData.length} problems`);

        // Update pagination info from response
        if (result.pagination) {
          setTotalProblems(result.pagination.total);
          setHasMore(result.pagination.hasMore);
          setTotalPages(result.pagination.totalPages);
          setCurrentPage(result.pagination.currentPage);
          console.log(`Pagination: ${JSON.stringify(result.pagination)}`);
        } else {
          // Fallback to previous logic if pagination not provided
          setHasMore(problemsData.length === LIMIT);
        }

        setProblems(problemsData);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeTag, LIMIT]
  );

  useEffect(() => {
    fetchProblems(page);
  }, [page, fetchProblems]);

  const handleProblemSubmit = (newProblem: Problem) => {
    setProblems((prevProblems) => [newProblem, ...prevProblems]);
    setUserDailySubmissionCount((prev) => prev + 1);
    // Refresh problems to get the updated list
    fetchProblems(0);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#121212] text-white">
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Community Problems
            </h2>
            {totalProblems > 0 && (
              <span className="text-[#facc15]">{totalProblems} Problems</span>
            )}
          </div>

          <ProblemsList
            activeTag={activeTag}
            onTagClick={handleTagClick}
            isAdmin={isAdmin}
            problems={problems}
            loading={loading}
            onRefresh={() => fetchProblems(page)}
          />

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className={`px-4 py-2 rounded-lg flex items-center ${
                page === 0
                  ? "bg-[#262626]/50 text-white/50 cursor-not-allowed"
                  : "bg-[#262626] text-white hover:bg-[#373737] hover:text-[#facc15]"
              }`}
              aria-label="Previous page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Prev
            </button>

            {totalProblems > 0 && (
              <span className="text-white/60">
                Page {currentPage} of {totalPages}
              </span>
            )}

            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className={`px-4 py-2 rounded-lg flex items-center ${
                !hasMore
                  ? "bg-[#262626]/50 text-white/50 cursor-not-allowed"
                  : "bg-[#262626] text-white hover:bg-[#373737] hover:text-[#facc15]"
              }`}
              aria-label="Next page"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#facc15] to-[#f97316] flex items-center justify-center shadow-lg hover:shadow-xl hover:from-[#fde047] hover:translate-y-[-2px] transition-all duration-300"
        aria-label="Add new problem"
        disabled={userDailySubmissionCount >= MAX_SUBMISSIONS}
        title={
          userDailySubmissionCount >= MAX_SUBMISSIONS
            ? "You've reached the maximum number of submissions for today"
            : "Add new problem"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Problem Submission Modal */}
      <AddProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProblemSubmit}
        remainingSubmissions={MAX_SUBMISSIONS - userDailySubmissionCount}
      />
    </div>
  );
}
