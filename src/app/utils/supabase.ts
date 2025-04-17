import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create standard client (for client-side and anonymous operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create admin client with service role key (for server-side only operations)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Authentication helper functions
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

// Middleware helper to check if a user is authenticated
export async function verifyAuth(request: NextRequest) {
  // Method 1: Check for the Supabase session cookie
  const supabaseAuth = request.cookies.get("sb-auth-token")?.value;

  // Method 2: Check for the Authorization header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  // Use either the cookie or the Bearer token
  const token = supabaseAuth || bearerToken;

  if (!token) {
    console.log("No authentication token found in cookies or headers");
    return { isAuthenticated: false, error: "No session found" };
  }

  try {
    // Verify the session with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.log("Invalid session:", error?.message);
      return {
        isAuthenticated: false,
        error: error?.message || "Invalid session",
      };
    }

    console.log("Authentication successful for user:", data.user.email);
    return {
      isAuthenticated: true,
      user: data.user,
      email: data.user.email,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { isAuthenticated: false, error: "Session verification failed" };
  }
}

// Helper to protect admin API routes
export async function requireAdmin(request: NextRequest) {
  const { isAuthenticated, user, error } = await verifyAuth(request);

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Here you can add additional checks if needed
  // For example, check if the user has admin role in your database

  return null; // No error, proceed with request
}

// Database types based on your schema
export type WaitlistUser = {
  id?: string;
  email: string;
  name?: string;
  created_at?: string;
  source?: string;
};
