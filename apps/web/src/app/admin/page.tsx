"use server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  // Session guaranteed by layout, but we need waitlist data:
  const { data: waitlistUsers = [] } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (!waitlistUsers) {
    return <div>No waitlist users found</div>;
  }

  const todayCount = waitlistUsers.filter(
    (u) => new Date(u.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-white">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-md border border-[#373737]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Waitlist Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Users" value={waitlistUsers.length} />
            <StatCard label="Added Today" value={todayCount} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-md border border-[#373737]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <LinkButton href="/admin/users">User Management</LinkButton>
            <LinkButton href="/admin/waitlist">Waitlist Management</LinkButton>
            <LinkButton
              href="https://dashboard.stripe.com/test/subscriptions"
              external
            >
              Stripe Dashboard
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#262626] p-4 rounded-lg">
      <p className="text-sm text-[#b3b3b3]">{label}</p>
      <p className="text-2xl font-bold text-[#facc15]">{value}</p>
    </div>
  );
}

function LinkButton({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const Tag = external ? "a" : "a";
  return (
    <Tag
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="bg-[#262626] p-3 rounded-lg text-white hover:bg-[#373737] transition-colors flex items-center"
    >
      {children}
    </Tag>
  );
}
