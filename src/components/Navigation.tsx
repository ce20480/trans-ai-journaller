"use client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function Navigation({ user }: { user: User | null }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  return (
    <nav className="bg-[#1a1a1a]/80 backdrop-blur-md py-4 sticky top-0 z-50 border-b border-[#262626]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-white group-hover:text-[#facc15] transition-colors duration-300">
            Just T2A It
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="#how-it-works"
            className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
          >
            How It Works
          </Link>

          {isLoggedIn ? (
            // Show links for logged-in users
            <>
              <Link
                href="/dashboard"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/notes"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              >
                My Notes
              </Link>
              <LogoutButton />
            </>
          ) : (
            // Show links for logged-out users
            <>
              <Link
                href="/register"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              >
                Login
              </Link>
              <Link
                href="#join-waitlist"
                className="bg-[#facc15] hover:bg-[#fde047] text-black px-5 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Join Waitlist
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
