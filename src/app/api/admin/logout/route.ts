import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth"

// 관리자 세션을 종료하는 API 라우트입니다.
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  })

  return response
}
