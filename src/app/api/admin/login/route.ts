import { NextResponse } from "next/server"
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME,
} from "@/lib/adminAuth"

// 데모용 관리자 로그인을 처리하는 API 라우트입니다.
export async function POST(request: Request) {
  const payload = (await request.json()) as { username?: string; password?: string }

  if (payload.username !== ADMIN_USERNAME || payload.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 })
  }

  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  })

  return response
}
