import { NextResponse } from "next/server"
import { isNoticesDbConfigured, markNoticeAsRead } from "@/lib/notices"

type ReadNoticeBody = {
  workerId?: string
}

// 작업자가 공지를 열람했을 때 읽음 상태를 저장하는 API 라우트입니다.
export async function POST(request: Request, context: { params: { id: string } }) {
  if (!isNoticesDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const noticeId = Number.parseInt(context.params.id, 10)
  const body = (await request.json()) as ReadNoticeBody

  if (!Number.isFinite(noticeId)) {
    return NextResponse.json({ error: "유효한 공지 번호가 필요합니다." }, { status: 400 })
  }

  if (!body.workerId) {
    return NextResponse.json({ error: "workerId는 필수입니다." }, { status: 400 })
  }

  try {
    const notice = await markNoticeAsRead(noticeId, body.workerId)
    return NextResponse.json({ notice }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "읽음 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
