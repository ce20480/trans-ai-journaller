import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/auth";

// Paths that require authentication
const protectedPaths = ["/dashboard"];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/dashboard/:path*", "/login"],
};
