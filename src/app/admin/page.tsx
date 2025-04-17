"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

interface WaitlistUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // User creation states
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"beta-tester" | "admin">(
    "beta-tester"
  );
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(
    null
  );

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          router.push("/login");
          return;
        }

        // Check if user has admin role
        const role = data.session.user.user_metadata?.role;

        if (role !== "admin") {
          console.error("User is not an admin");
          router.push("/dashboard");
          return;
        }

        setUserData(data.session.user);

        // Fetch waitlist users
        const { data: waitlistData, error: waitlistError } = await supabase
          .from("waitlist")
          .select("*")
          .order("created_at", { ascending: false });

        if (waitlistError) {
          throw new Error(waitlistError.message);
        }

        setWaitlistUsers(waitlistData || []);
      } catch (err) {
        console.error("Admin authentication error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router, supabase]);

  // Handle creating a new user (beta tester or admin)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);
    setCreateUserSuccess(null);
    setIsCreatingUser(true);

    if (!newUserEmail || !newUserPassword) {
      setCreateUserError("Email and password are required");
      setIsCreatingUser(false);
      return;
    }

    try {
      // Call the appropriate API based on the selected role
      const endpoint =
        newUserRole === "admin"
          ? "/api/admin/create-admin"
          : "/api/admin/create-beta-tester";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to create ${newUserRole}`);
      }

      // Reset form on success
      setCreateUserSuccess(
        `${newUserRole === "admin" ? "Admin" : "Beta tester"} created successfully`
      );
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setShowCreateUserForm(false);
    } catch (err) {
      console.error("User creation error:", err);
      setCreateUserError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#facc15]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="bg-[#1a1a1a] shadow-md sticky top-0 z-40 border-b border-[#262626]">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#facc15]">
              T2A Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-white hover:text-[#facc15] transition-colors"
            >
              User Dashboard
            </Link>
            <Link
              href="/logout"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[#b3b3b3]">
            Welcome back, {userData?.user_metadata?.name || userData?.email}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-300 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {createUserSuccess && (
          <div className="mb-6 p-4 bg-green-900/30 text-green-300 rounded-lg border border-green-700">
            {createUserSuccess}
          </div>
        )}

        {/* Admin Panels */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* User Stats Panel */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#373737]">
            <h2 className="text-xl font-semibold text-white mb-4">
              Waitlist Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#262626] p-4 rounded-lg">
                <p className="text-sm text-[#b3b3b3]">Total Users</p>
                <p className="text-2xl font-bold text-[#facc15]">
                  {waitlistUsers.length}
                </p>
              </div>
              <div className="bg-[#262626] p-4 rounded-lg">
                <p className="text-sm text-[#b3b3b3]">Added Today</p>
                <p className="text-2xl font-bold text-[#facc15]">
                  {
                    waitlistUsers.filter((u) => {
                      const today = new Date();
                      const userDate = new Date(u.created_at);
                      return userDate.toDateString() === today.toDateString();
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#373737]">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                className="bg-[#262626] p-3 rounded-lg text-white hover:bg-[#373737] transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2 text-[#facc15]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Create User (Beta Tester/Admin)
              </button>
              <Link
                href="/admin/waitlist"
                className="bg-[#262626] p-3 rounded-lg text-white hover:bg-[#373737] transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2 text-[#facc15]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Waitlist Management
              </Link>
              <a
                href={`https://dashboard.stripe.com/test/subscriptions`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#262626] p-3 rounded-lg text-white hover:bg-[#373737] transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2 text-[#facc15]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Stripe Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateUserForm && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#373737] mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New User
            </h2>

            {createUserError && (
              <div className="mb-4 p-3 text-sm bg-red-900/30 text-red-300 rounded-md border border-red-700">
                {createUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-3 border border-[#373737] rounded-lg bg-[#262626] focus:ring-2 focus:ring-[#facc15] focus:border-transparent transition duration-150 ease-in-out text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b3b3b3] mb-1">
                  Role
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="beta-tester"
                      checked={newUserRole === "beta-tester"}
                      onChange={() => setNewUserRole("beta-tester")}
                      className="form-radio h-4 w-4 text-[#facc15] border-[#373737] focus:ring-[#facc15]"
                    />
                    <span className="ml-2 text-white">Beta Tester</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="admin"
                      checked={newUserRole === "admin"}
                      onChange={() => setNewUserRole("admin")}
                      className="form-radio h-4 w-4 text-[#facc15] border-[#373737] focus:ring-[#facc15]"
                    />
                    <span className="ml-2 text-white">Admin</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className={`px-4 py-2 rounded-lg text-black font-medium ${
                    isCreatingUser
                      ? "bg-[#facc15]/70 cursor-not-allowed"
                      : "bg-[#facc15] hover:bg-[#fde047]"
                  } transition-colors duration-200`}
                >
                  {isCreatingUser ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(false)}
                  className="px-4 py-2 rounded-lg text-white font-medium bg-[#373737] hover:bg-[#444] transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Waitlist Entries */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-[#373737]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Waitlist Entries
          </h2>

          {waitlistUsers.length === 0 ? (
            <div className="text-center py-8 text-[#b3b3b3]">
              No waitlist entries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#b3b3b3] border-b border-[#373737]">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistUsers.slice(0, 5).map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#262626] text-white"
                    >
                      <td className="py-3">{user.name || "—"}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {waitlistUsers.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/admin/waitlist"
                    className="text-[#facc15] hover:underline"
                  >
                    View all {waitlistUsers.length} entries
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
