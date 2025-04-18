// components/AdminLayout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-64 bg-[#1a1a1a] border-r border-[#262626] p-4">
        <h1 className="text-xl font-bold mb-6 text-[#facc15]">T2A Admin</h1>
        <nav className="space-y-2">
          <NavLink href="/admin" isActive={pathname === "/admin"}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/users" isActive={pathname === "/admin/users"}>
            User Management
          </NavLink>
          <NavLink
            href="/admin/waitlist"
            isActive={pathname === "/admin/waitlist"}
          >
            Waitlist Admin
          </NavLink>
          <hr className="border-[#373737] my-4" />
          <LogoutButton />
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden p-4">
        <button onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <aside className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="bg-[#1a1a1a] w-64 h-full p-4 border-r border-[#262626]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-[#facc15]">T2A Admin</h1>
              <button onClick={() => setMobileOpen(false)}>×</button>
            </div>
            <nav className="space-y-2">
              <NavLink href="/admin" isActive={pathname === "/admin"}>
                Dashboard
              </NavLink>
              <NavLink
                href="/admin/users"
                isActive={pathname === "/admin/users"}
              >
                User Management
              </NavLink>
              <NavLink
                href="/admin/waitlist"
                isActive={pathname === "/admin/waitlist"}
              >
                Waitlist Admin
              </NavLink>
              <hr className="border-[#373737] my-4" />
              <LogoutButton />
            </nav>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#0d0d0d] text-white p-6">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-[#facc15] text-black"
          : "text-[#b3b3b3] hover:bg-[#262626] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
