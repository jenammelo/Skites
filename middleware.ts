import { NextRequest, NextResponse } from "next/server";

// Gates the admin dashboard and its API routes behind a single shared
// password (ADMIN_PASSWORD env var) — no user accounts, since only the
// event organizer/planner team should reach this, not the general public.
// Organizer/Guest/Usher stay code-and-token based, untouched by this.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    pathname !== "/api/admin/login" &&
    pathname !== "/api/admin/logout";

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const expected = process.env.ADMIN_PASSWORD;
  const cookie = req.cookies.get("skites_admin")?.value;

  const authed = Boolean(expected) && cookie === expected;
  if (authed) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
