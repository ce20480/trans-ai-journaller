"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProblemForm from "@/components/ProblemForm";
import ProblemsList from "@/components/ProblemsList";
import { FREE_NOTES_LIMIT } from "@/utils/constants";

export default function CommunityPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleTagClick = (tag: string | null) => {
    setActiveTag(tag);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-[#121212] text-white">
      <header className="bg-[#1a1a1a] shadow-md sticky top-0 z-40 border-b border-[#262626]">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center">
            <span className="text-[#facc15] mr-2">T2A</span> Community Problems
          </h1>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <section className="mb-12">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316] mb-6">
              Share a Problem
            </h2>

            <p className="text-white/70 mb-6">
              Share a problem you're facing or an idea you'd like to see built.
              No sign-up required! The community can help provide solutions or
              builders might pick it up.
            </p>

            <ProblemForm
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onSuccess={() => {
                // Reset form and refresh problems list
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Community Problems
            </h2>
          </div>

          <ProblemsList activeTag={activeTag} onTagClick={handleTagClick} />
        </section>
      </main>

      <footer className="bg-[#0a0a0a] border-t border-[#262626] py-8 text-center text-white/40 text-sm">
        <div className="container mx-auto px-4">
          <p>Built for makers and indie hackers who think out loud.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-[#facc15]">
              Privacy Policy
            </Link>{" "}
            •{" "}
            <Link href="/terms" className="hover:text-[#facc15]">
              Terms of Service
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
