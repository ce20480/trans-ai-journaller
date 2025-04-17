"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { WaitlistUser } from "@/app/utils/supabase";

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export default function WaitlistAdmin() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 50,
    offset: 0,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Function to fetch waitlist data
  const fetchWaitlistData = useCallback(
    async (searchQuery = "", offset = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: offset.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(
          `/api/admin/waitlist?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch waitlist data");
        }

        const data = await response.json();
        setWaitlistEntries(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError((err as Error).message || "An error occurred");
        console.error("Error fetching waitlist data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  // Function to delete an entry
  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/waitlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete entry");
      }

      // Refresh the data
      fetchWaitlistData(search, pagination.offset);
    } catch (err) {
      setError((err as Error).message || "An error occurred");
      console.error("Error deleting entry:", err);
    }
  };

  // Function to export waitlist data
  const exportWaitlist = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }

      // Trigger file download
      window.location.href = `/api/admin/waitlist/export?${params.toString()}`;

      // Small delay before setting isExporting back to false
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (err) {
      setError((err as Error).message || "An error occurred during export");
      console.error("Error exporting waitlist:", err);
      setIsExporting(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWaitlistData(search, 0); // Reset to first page when searching
  };

  // Navigation
  const goToPage = (offset: number) => {
    fetchWaitlistData(search, offset);
  };

  // Load data on initial render
  useEffect(() => {
    fetchWaitlistData();
  }, [fetchWaitlistData]);

  // Calculate pagination values
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Waitlist Management</h1>
        <Link
          href="/dashboard"
          className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-[#262626] p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
            <div className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or name"
                className="flex-1 px-4 py-2 rounded-l-lg bg-[#1a1a1a] border border-[#373737] text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#373737] hover:bg-[#4a4a4a] text-white rounded-r-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Export button */}
          <button
            onClick={exportWaitlist}
            disabled={isExporting || waitlistEntries.length === 0}
            className={`px-4 py-2 bg-[#facc15] hover:bg-[#fde047] text-black rounded-lg transition-colors ${
              isExporting || waitlistEntries.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isExporting ? "Exporting..." : "Export to CSV"}
          </button>
        </div>

        {/* Stats */}
        <div className="text-[#b3b3b3] text-sm">
          {pagination.total} total entries
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Waitlist table */}
      <div className="bg-[#262626] rounded-lg overflow-hidden mb-6">
        {isLoading ? (
          <div className="p-8 text-center text-[#b3b3b3]">Loading...</div>
        ) : waitlistEntries.length === 0 ? (
          <div className="p-8 text-center text-[#b3b3b3]">
            {search ? "No results found" : "No waitlist entries yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#b3b3b3]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#373737]">
                {waitlistEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#1a1a1a]/40">
                    <td className="px-4 py-3 text-sm text-[#b3b3b3]">
                      {new Date(entry.created_at || "").toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {entry.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {entry.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#b3b3b3]">
                      {entry.source || "landing_page"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => deleteEntry(entry.id as string)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-[#262626] p-4 rounded-lg">
          <button
            onClick={() =>
              goToPage(Math.max(0, pagination.offset - pagination.limit))
            }
            disabled={pagination.offset === 0}
            className={`px-3 py-1 bg-[#373737] hover:bg-[#4a4a4a] text-white rounded transition-colors ${
              pagination.offset === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <div className="text-[#b3b3b3]">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() =>
              goToPage(
                Math.min(
                  pagination.total - pagination.limit,
                  pagination.offset + pagination.limit
                )
              )
            }
            disabled={currentPage >= totalPages}
            className={`px-3 py-1 bg-[#373737] hover:bg-[#4a4a4a] text-white rounded transition-colors ${
              currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
