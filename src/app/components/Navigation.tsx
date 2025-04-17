"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import LogoutButton from "./LogoutButton";

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <nav className="bg-[#1a1a1a]/80 backdrop-blur-md py-4 sticky top-0 z-50 border-b border-[#262626]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-white group-hover:text-[#facc15] transition-colors duration-300">
            T2A
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="#how-it-works"
            className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
          >
            How It Works
          </Link>

          {isLoading ? (
            // Show loading state
            <div className="w-20 h-8 bg-[#262626] animate-pulse rounded-full"></div>
          ) : isLoggedIn ? (
            // Show links for logged-in users
            <>
              <Link
                href="/dashboard"
                className="text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              >
                Dashboard
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
