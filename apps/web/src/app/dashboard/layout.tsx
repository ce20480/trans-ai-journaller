// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/Layouts/DashboardLayout";
import { createClient as createServerClient } from "@/utils/supabase/server";

export default async function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect(`/login?redirect=/dashboard`);
  }

  const role = user.user_metadata?.role;

  // Only admins need special handling - we allow all authenticated users now
  if (role === "admin") {
    // Admin users can always access the dashboard
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // For regular users, we allow access but will limit features in the API
  return <DashboardLayout>{children}</DashboardLayout>;
}
