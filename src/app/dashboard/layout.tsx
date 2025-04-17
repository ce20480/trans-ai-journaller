"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Top navigation bar - mobile only */}
      <header className="bg-[#1a1a1a] border-b border-[#262626] p-4 flex md:hidden items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          T2A Dashboard
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#b3b3b3] hover:text-white"
        >
          {isMobileMenuOpen ? (
            <span className="text-2xl">×</span>
          ) : (
            <span>☰</span>
          )}
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar navigation - desktop */}
        <aside className="hidden md:block w-64 bg-[#1a1a1a] border-r border-[#262626]">
          <div className="p-4">
            <h1 className="text-xl font-bold mb-6">T2A Dashboard</h1>
            <nav className="space-y-2">
              <NavLink href="/dashboard" isActive={pathname === "/dashboard"}>
                Dashboard
              </NavLink>
              <NavLink
                href="/dashboard/waitlist"
                isActive={pathname === "/dashboard/waitlist"}
              >
                Waitlist Admin
              </NavLink>
              <hr className="border-[#373737] my-4" />
              <NavLink href="/api/auth/logout">Logout</NavLink>
            </nav>
          </div>
        </aside>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
            <div className="bg-[#1a1a1a] w-64 h-full border-r border-[#262626] p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">T2A Dashboard</h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#b3b3b3] hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <nav className="space-y-2">
                <NavLink href="/dashboard" isActive={pathname === "/dashboard"}>
                  Dashboard
                </NavLink>
                <NavLink
                  href="/dashboard/waitlist"
                  isActive={pathname === "/dashboard/waitlist"}
                >
                  Waitlist Admin
                </NavLink>
                <hr className="border-[#373737] my-4" />
                <NavLink href="/api/auth/logout">Logout</NavLink>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// Navigation link component
function NavLink({
  href,
  children,
  isActive = false,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md ${
        isActive
          ? "bg-[#facc15] text-black font-medium"
          : "text-[#b3b3b3] hover:bg-[#262626] hover:text-white"
      } transition-colors`}
    >
      {children}
    </Link>
  );
}
