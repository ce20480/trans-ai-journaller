import { redirect } from "next/navigation";
import PaymentClient from "@/components/Payments/PaymentClient";
import { createClient as createServerClient } from "@/utils/supabase/server";

export default async function PaymentPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login, then back here
  if (!user) {
    return redirect(`/login?redirect=/payment`);
  }

  // Already paid → send to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status === "active") {
    return redirect("/dashboard");
  }

  // All good → render the client‑side UI
  return <PaymentClient user={user} />;
}
