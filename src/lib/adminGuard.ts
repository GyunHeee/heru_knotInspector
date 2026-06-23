import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "@/lib/adminAuth"

// 서버 컴포넌트에서 관리자 세션이 없으면 로그인 화면으로 이동시킵니다.
export function requireAdminSession() {
  const cookieStore = cookies()
  const isAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  if (!isAuthenticated) {
    redirect("/admin/login")
  }
}
