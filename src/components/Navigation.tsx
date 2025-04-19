"use client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navigation({ user }: { user: User | null }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-[#1a1a1a]/80 backdrop-blur-md py-4 sticky top-0 z-50 border-b border-[#262626]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-white group-hover:text-[#facc15] transition-colors duration-300">
            Just T2A It
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[69px] z-40"
          ref={mobileMenuRef}
        >
          <div className="bg-[#1a1a1a]/95 backdrop-blur-lg px-6 py-4 space-y-3 border-t border-[#262626] shadow-lg animate-slide-in-top">
            <Link
              href="#how-it-works"
              className="block py-2 text-[#b3b3b3] hover:text-[#facc15] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>

            {isLoggedIn ? (
              // Show links for logged-in users
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/notes"
                  className="block py-2 text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Notes
                </Link>
                <div className="pt-2">
                  <LogoutButton />
                </div>
              </>
            ) : (
              // Show links for logged-out users
              <>
                <Link
                  href="/register"
                  className="block py-2 text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="block py-2 text-[#b3b3b3] hover:text-[#facc15] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <div className="pt-2">
                  <Link
                    href="#join-waitlist"
                    className="block w-full text-center bg-[#facc15] hover:bg-[#fde047] text-black px-5 py-2 rounded-full text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Waitlist
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
