import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/utils/supabase/server";
import PaymentSuccessClient from "@/components/Payments/PaymentSuccessClient";

export default async function PaymentSuccessPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // No session → send to login
    return redirect(`/login?redirect=/payment/success`);
  }

  // Let the client component handle the Stripe session‑id logic
  return <PaymentSuccessClient />;
}
