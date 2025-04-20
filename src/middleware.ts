// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { verifyAuth } from "@/utils/supabase/auth";
import { createClient as createServerClient } from "@/utils/supabase/server";

const PUBLIC_PAGES = [
  "/",
  "/register",
  "/verify-email",
  "/login",
  "/payment",
  "/cookies",
];
const ADMIN_ROUTES = ["/admin"];
// Routes that require authentication but not necessarily a subscription
const AUTH_ROUTES = ["/dashboard", "/dashboard/notes", "/dashboard/waitlist"];
const AUTH_CONFIRM_ROUTES = "/auth/confirm";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1) Public HTML-only pages:
  if (PUBLIC_PAGES.some((r) => path === r || path.startsWith(`${r}/`))) {
    return NextResponse.next();
  }

  if (
    path === AUTH_CONFIRM_ROUTES ||
    path.startsWith(`${AUTH_CONFIRM_ROUTES}/`)
  ) {
    return NextResponse.next();
  }

  // 2) Refresh Supabase session & cookies (no redirects here)
  const response = await updateSession(req);

  // 3) Check if the route requires authentication
  const requiresAuth =
    AUTH_ROUTES.some((r) => path === r || path.startsWith(`${r}/`)) ||
    ADMIN_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

  if (requiresAuth) {
    const supabase = await createServerClient();
    const { isAuthenticated, user } = await verifyAuth(supabase);

    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    // 4) Admin guard
    if (ADMIN_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
      if (user!.user_metadata?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything _except_:
    // – any /api/* route
    // – next internals
    // – asset files
    "/((?!api/|_next/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
