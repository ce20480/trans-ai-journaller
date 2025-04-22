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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if sidebar preference is stored in localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("sidebarCollapsed");
    if (savedPreference !== null) {
      setIsSidebarCollapsed(savedPreference === "true");
    }
  }, []);

  // Save sidebar preference when it changes
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="min-h-screen bg-[#010101] text-white flex flex-col">
      {/* mobile top bar */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-white/10 p-4 flex md:hidden items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316]"
        >
          T2A Dashboard
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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
      </header>

      <div className="flex flex-1">
        {/* desktop sidebar */}
        <aside
          className={`hidden md:block bg-black/40 backdrop-blur-lg border-r border-white/10 transition-all duration-300 ${
            isSidebarCollapsed ? "w-[72px]" : "w-64"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {!isSidebarCollapsed && (
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316]">
                  T2A Dashboard
                </h1>
              )}
              <button
                onClick={toggleSidebar}
                className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isSidebarCollapsed
                        ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                        : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    }
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              <NavLink
                href="/dashboard"
                isActive={pathname === "/dashboard"}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                }
                collapsed={isSidebarCollapsed}
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/dashboard/notes"
                isActive={pathname === "/dashboard/notes"}
                collapsed={isSidebarCollapsed}
              >
                My Notes
              </NavLink>
              <hr className="border-white/10 my-4" />
            </nav>
          </div>
        </aside>

        {/* mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 md:hidden">
            <div className="bg-black/60 w-64 h-full border-r border-white/10 p-4 animate-slide-in-left">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#f97316]">
                  T2A Dashboard
                </h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
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
                </button>
              </div>
              <nav className="space-y-2">
                <NavLink
                  href="/dashboard"
                  isActive={pathname === "/dashboard"}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  href="/dashboard/notes"
                  isActive={pathname === "/dashboard/notes"}
                >
                  My Notes
                </NavLink>
                <hr className="border-white/10 my-4" />
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
  isActive = false,
  icon,
  collapsed = false,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  icon?: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center transition-all ${
        isActive
          ? "bg-gradient-to-r from-[#facc15] to-[#f97316] text-black font-medium"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      } rounded-md ${collapsed ? "justify-center w-10 h-10 p-0 mx-auto" : "px-3 py-2"}`}
      title={collapsed ? String(children) : undefined}
    >
      {icon && <span className={collapsed ? "" : "mr-3"}>{icon}</span>}
      {!collapsed && children}
    </Link>
  );
}
