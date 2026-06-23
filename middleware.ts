import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "./src/lib/adminAuth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requiresAdminAuth = pathname.startsWith("/admin") || pathname.startsWith("/attendance/admin")

  if (!requiresAdminAuth || pathname === "/admin/login") {
    return NextResponse.next()
  }

  const isAuthenticated = isAdminAuthenticatedFromCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)

  if (isAuthenticated) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin/login", request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*", "/attendance/admin/:path*"],
}
