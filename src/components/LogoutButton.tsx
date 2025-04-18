// components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.refresh(); // re‑runs middleware → clears session & redirects if needed
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`text-white/70 hover:text-white border-white/10 hover:border-[#facc15] text-sm px-4 py-2 rounded-md border transition-all duration-200 flex items-center justify-center min-w-[80px] ${className}`}
    >
      {children || (isLoading ? "Logging out…" : "Logout")}
    </button>
  );
}
