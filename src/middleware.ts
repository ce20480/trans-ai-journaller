import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window per IP

// In-memory store for rate limiting (WARNING: Not suitable for scaled deployments)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Paths that require any authentication
const protectedPaths = ["/dashboard", "/payment"];

// Paths that require admin authentication
const adminPaths = ["/admin"];

// Paths that require payment/subscription
const paidPaths = ["/dashboard"];

// Paths for authentication
const authPaths = ["/login", "/register", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Get user's IP address from header (more reliable in Vercel/proxied envs)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // --- Apply Rate Limiting ---
  const now = Date.now();
  const ipData = requestCounts.get(ip);

  if (ipData && now - ipData.timestamp < RATE_LIMIT_WINDOW_MS) {
    // Within the window
    if (ipData.count >= RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip} on path: ${pathname}`);
      return new NextResponse("Too many requests", { status: 429 });
    }
    // Increment count
    ipData.count++;
  } else {
    // Reset count for new window or new IP
    requestCounts.set(ip, { count: 1, timestamp: now });
  }

  // Clean up old entries periodically (simple approach)
  if (Math.random() < 0.1) {
    // Run cleanup roughly 10% of the time
    const expiryTime = now - RATE_LIMIT_WINDOW_MS;
    for (const [keyIp, data] of requestCounts.entries()) {
      if (data.timestamp < expiryTime) {
        requestCounts.delete(keyIp);
      }
    }
  }
  // --- End Rate Limiting ---

  // Create Supabase client in middleware
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Check Supabase authentication status
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;

  // Get user metadata to check role
  const userRole = session?.user?.user_metadata?.role || "user";
  const isAdmin = userRole === "admin";
  const isBetaTester = userRole === "beta-tester";

  console.log(`Middleware checking path: ${pathname}`, {
    hasSession: isAuthenticated,
    userEmail: session?.user?.email || "none",
    userRole,
  });

  // Check payment status for paid paths
  let hasActiveSubscription = false;
  if (
    isAuthenticated &&
    paidPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    try {
      // Check if user has profile with active subscription
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", session.user.id)
        .single();

      hasActiveSubscription =
        profile?.subscription_status === "active" || isAdmin || isBetaTester;
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if path requires admin role
  const isAdminPath = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is an auth path (login/register)
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if path requires payment
  const isPaidPath = paidPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  console.log("Authentication check:", {
    isAuthenticated,
    isProtectedPath,
    isAuthPath,
    isAdmin,
    isAdminPath,
    isPaidPath,
    hasActiveSubscription,
  });

  // Redirect if needed
  if (isAdminPath && (!isAuthenticated || !isAdmin)) {
    // Redirect to login if trying to access admin route without admin rights
    console.log("Redirecting to login (unauthorized admin access)");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    console.log(
      "Redirecting to login (unauthenticated access to protected path)"
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPaidPath && isAuthenticated && !hasActiveSubscription && !isAdmin) {
    // Redirect to payment if trying to access paid feature without subscription
    console.log("Redirecting to payment (unpaid access to premium feature)");
    return NextResponse.redirect(new URL("/payment", request.url));
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access login/register
    console.log("Redirecting to dashboard (authenticated access to auth page)");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  console.log("Continuing with request");
  return response;
}

export const config = {
  // Matcher for routes that should run the middleware
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/payment/:path*",
    "/api/:path*",
  ],
};
