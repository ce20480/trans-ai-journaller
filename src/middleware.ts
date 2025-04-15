import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/auth";

// --- Rate Limiting Configuration ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window per IP

// In-memory store for rate limiting (WARNING: Not suitable for scaled deployments)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Paths that require authentication
const protectedPaths = ["/dashboard"];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/login"];

export async function middleware(request: NextRequest) {
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
  // --- End Rate Limiting ---

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value;
  console.log(`Middleware checking path: ${pathname}`, {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 10)}...` : "none",
  });

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is an auth path (login)
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Verify JWT token
  const isAuthenticated = token ? (await verifyToken(token)).isValid : false;
  console.log("Authentication check:", {
    isAuthenticated,
    isProtectedPath,
    isAuthPath,
  });

  // Redirect if needed
  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    console.log(
      "Redirecting to login (unauthenticated access to protected path)"
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access login
    console.log(
      "Redirecting to dashboard (authenticated access to login page)"
    );
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  console.log("Continuing with request");
  return NextResponse.next();
}

export const config = {
  // Matcher for routes that should run the middleware
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"], // Apply to protected pages, login, and API routes
};
