import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "@/lib/adminAuth"

// 현재 사용자의 관리자 로그인 여부를 반환하는 API 라우트입니다.
export async function GET() {
  const cookieStore = cookies()
  const isAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  return NextResponse.json({ isAuthenticated }, { status: 200 })
}
