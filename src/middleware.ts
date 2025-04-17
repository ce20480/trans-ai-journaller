import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window per IP

// In-memory store for rate limiting (WARNING: Not suitable for scaled deployments)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Protected routes
const PROTECTED_ROUTES = ["/dashboard", "/payment", "/success"];

// Public routes
// const PUBLIC_ROUTES = ["/", "/login", "/register", "/verify-email"];

export async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Otherwise, continue with custom path protection logic
  // but use the response from Supabase to maintain correct cookies
  const pathname = request.nextUrl.pathname;

  // Then handle Supabase session refresh
  // This will set the necessary cookies and ensure the auth session is valid
  if (PROTECTED_ROUTES.some((path) => pathname.startsWith(path))) {
    const supabaseResponse = await updateSession(request);

    // If we need to redirect to login based on Supabase auth, return early
    if (supabaseResponse.status !== 200) {
      return supabaseResponse;
    }

    // Modify the response to include our custom redirects if needed
    // We need to clone it so we don't modify the original
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Copy all cookies from supabaseResponse to our response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });

    // Log the path being accessed
    console.log(`Middleware checking path: ${pathname}`);

    return response;
  }
}

// Helper function to apply rate limiting
function applyRateLimit(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // If rate limit wasn't exceeded, return null to proceed
  return null;
}

export const config = {
  // Matcher for routes that should run the middleware
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
