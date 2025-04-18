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
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect(`/login?redirect=/dashboard`);
  }

  const { user } = session;
  const role = user.user_metadata?.role;

  // Non‑admins need an active subscription
  if (role !== "admin") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status !== "active") {
      return redirect("/payment");
    }
  }

  // Wrap all dashboard sub‑pages in the client layout
  return <DashboardLayout>{children}</DashboardLayout>;
}
