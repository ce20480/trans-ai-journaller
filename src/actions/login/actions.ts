"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  try {
    const supabase = await createServerClient();

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
      console.error("Login error:", error.message);
      return { error: error.message };
    }

    if (!data?.user) {
      return { error: "No user returned from authentication" };
    }

    try {
      // Get user role from metadata
      const userRole = data.user.user_metadata?.role || "user";

      // Admin users go directly to admin dashboard
      if (userRole === "admin") {
        console.log(`Admin user redirected to admin dashboard`);
        revalidatePath("/", "layout");
        redirect("/admin");
      }

      // For regular users, check subscription status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", data.user.id)
        .single();

      // Paid users go to dashboard, others to payment
      if (profile?.subscription_status === "active") {
        console.log("Paid user redirected to dashboard");
        revalidatePath("/", "layout");
        redirect("/dashboard");
      } else {
        console.log("Unpaid user redirected to payment");
        revalidatePath("/", "layout");
        redirect("/payment");
      }

      // We never reach here because redirect() throws an error
      return { error: "" };
    } catch (err) {
      // Check if this is a redirect error - if so, let it propagate
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err; // Re-throw redirect errors to let Next.js handle them
      }

      console.error("Post-login process error:", err);

      // If we reached here, authentication succeeded but we had a different error
      // Redirect to dashboard as fallback
      console.log("Redirecting to dashboard as fallback");
      redirect("/dashboard");
    }
  } catch (err) {
    // Check if this is a redirect error - if so, let it propagate
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err; // Re-throw redirect errors to let Next.js handle them
    }

    console.error("Login process error:", err);
    return {
      error: "Login failed. Please try clearing your cookies and try again.",
    };
  }
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient();

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
        role: "user", // Default role is regular user
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

export async function signout(): Promise<undefined | { error: string }> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during signout:", error.message);
      return { error: error.message };
    }

    // Revalidate pages to update UI state
    revalidatePath("/", "layout");

    // Success case - return undefined (no error)
    return undefined;
  } catch (err) {
    // Check if this is a redirect error - if so, let it propagate
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err; // Re-throw redirect errors to let Next.js handle them
    }

    console.error("Signout exception:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during logout",
    };
  }
}
