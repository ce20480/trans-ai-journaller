// app/dashboard/notes/page.tsx
import { redirect } from "next/navigation";
import NotesList from "@/components/NotesList";
import { createClient as createServerClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function NotesPage() {
  // 1️⃣ Server‑side Supabase client (reads cookies automatically)
  const supabase = await createServerClient();

  // 2️⃣ Get session & user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no session, middleware would've already redirected you to /login,
  // but in case this page is hit directly, enforce it again:
  if (!user) {
    return redirect(`/login?redirect=/dashboard/notes`);
  }

  // 3️⃣ Role & subscription guard
  const role = user.user_metadata?.role;
  if (role !== "admin") {
    // for non‑admins, check subscription_status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status !== "active") {
      // bounce to payment page
      return redirect("/payment");
    }
  }

  // 4️⃣ Authorized! Render page content
  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      {/* your header block was redundant */}
      <header className="bg-[#1a1a1a] shadow-md sticky top-0 z-40 border-b border-[#262626]">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">T2A Notes</h1>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full"
            >
              Back
            </Link>
            <Link
              href="/logout"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">My Notes</h2>
          <Link
            href="/dashboard"
            className="bg-[#facc15] hover:bg-[#fde047] text-black px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Note
          </Link>
        </div>

        <NotesList />
      </section>
    </main>
  );
}
