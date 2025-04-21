"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { type WaitlistUser } from "@/utils/types/WaitListUser";

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

  const fetchWaitlistData = useCallback(
    async (searchQuery = "", offset = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: offset.toString(),
        });
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(`/api/admin/waitlist?${params}`);
        if (!res.ok) throw new Error((await res.json()).error);

        const { data, pagination: pag } = await res.json();
        setWaitlistEntries(data);
        setPagination(pag);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchWaitlistData(search, pagination.offset);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const exportWaitlist = () => {
    if (!waitlistEntries.length) return;
    setIsExporting(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    window.location.href = `/api/admin/waitlist/export?${params}`;
    setTimeout(() => setIsExporting(false), 1000);
  };

  useEffect(() => {
    fetchWaitlistData();
  }, [fetchWaitlistData]);

  //   const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const goToPage = (off: number) => fetchWaitlistData(search, off);

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWaitlistData(search, 0);
          }}
          className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4"
        >
          <div className="flex w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name"
              className="flex-1 px-4 py-2 rounded-l-lg bg-[#1a1a1a] border border-[#373737] text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#373737] hover:bg-[#4a4a4a] text-white rounded-r-lg"
            >
              Search
            </button>
          </div>

          <button
            onClick={exportWaitlist}
            disabled={isExporting || !waitlistEntries.length}
            className={`px-4 py-2 bg-[#facc15] text-black rounded-lg ${
              isExporting || !waitlistEntries.length
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#fde047]"
            }`}
          >
            {isExporting ? "Exporting…" : "Export to CSV"}
          </button>
        </form>
      </div>

      <div className="text-[#b3b3b3] text-sm mb-4">
        {pagination.total} total entries
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-[#262626] rounded-lg overflow-hidden mb-6">
        {isLoading ? (
          <div className="p-8 text-center text-[#b3b3b3]">Loading…</div>
        ) : waitlistEntries.length === 0 ? (
          <div className="p-8 text-center text-[#b3b3b3]">
            {search ? "No results found" : "No waitlist entries yet"}
          </div>
        ) : (
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
              {waitlistEntries.map((e) => (
                <tr key={e.id} className="hover:bg-[#1a1a1a]/40">
                  <td className="px-4 py-3 text-sm text-[#b3b3b3]">
                    {new Date(e.created_at!).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {e.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{e.email}</td>
                  <td className="px-4 py-3 text-sm text-[#b3b3b3]">
                    {e.source || "landing_page"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => deleteEntry(e.id!)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {Math.ceil(pagination.total / pagination.limit) > 1 && (
        <div className="flex justify-between items-center bg-[#262626] p-4 rounded-lg">
          <button
            onClick={() =>
              goToPage(Math.max(0, pagination.offset - pagination.limit))
            }
            disabled={pagination.offset === 0}
            className="px-3 py-1 bg-[#373737] text-white rounded"
          >
            Previous
          </button>
          <div className="text-[#b3b3b3]">
            Page {currentPage} of{" "}
            {Math.ceil(pagination.total / pagination.limit)}
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
            disabled={
              currentPage >= Math.ceil(pagination.total / pagination.limit)
            }
            className="px-3 py-1 bg-[#373737] text-white rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
