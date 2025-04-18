// app/admin/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { createClient as createServerClient } from "@/utils/supabase/server";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Not logged in → send to login (with redirect back to /admin)
    return redirect(`/login?redirect=/admin`);
  }

  const role = user.user_metadata?.role;
  if (role !== "admin") {
    // Logged in but not admin → bounce to user dashboard
    return redirect("/dashboard");
  }

  // All good → render client‑side layout
  return <AdminLayout>{children}</AdminLayout>;
}
