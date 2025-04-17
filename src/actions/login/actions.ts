"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Get form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.user) {
    return { error: "No user returned from authentication" };
  }

  // Check subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", data.user.id)
    .single();

  // Get user role from metadata
  const userRole = data.user.user_metadata?.role || "user";
  const isAdmin = userRole === "admin";
  const isBetaTester = userRole === "beta-tester";

  // Determine if user has premium access
  const hasPremiumAccess =
    isAdmin || isBetaTester || profile?.subscription_status === "active";

  // Revalidate all pages that might show user state
  revalidatePath("/", "layout");

  // Redirect based on access level
  if (hasPremiumAccess) {
    redirect("/dashboard");
  } else {
    redirect("/payment");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Get form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Register the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: "user", // Default role
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.user) {
    return { error: "No user returned from registration" };
  }

  // For email confirmation flows
  if (data.session === null) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  // Revalidate all pages that might show user state
  revalidatePath("/", "layout");

  // Redirect to payment page
  redirect("/payment");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
