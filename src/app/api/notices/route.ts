import { NextResponse } from "next/server"
import { createNotice, getNoticeById, isNoticesDbConfigured, listNotices } from "@/lib/notices"
import type { NoticeCreateInput } from "@/lib/noticesShared"

function getWorkerId(searchParams: URLSearchParams) {
  const workerId = searchParams.get("workerId")
  return workerId && workerId.trim().length > 0 ? workerId : undefined
}

// 공지 목록 조회와 신규 공지 등록을 처리하는 API 라우트입니다.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const workerId = getWorkerId(searchParams)
  const noticeIdParam = searchParams.get("noticeId")

  if (noticeIdParam) {
    const noticeId = Number.parseInt(noticeIdParam, 10)

    if (!Number.isFinite(noticeId)) {
      return NextResponse.json({ error: "유효한 noticeId가 필요합니다." }, { status: 400 })
    }

    const notice = await getNoticeById(noticeId, workerId)
    const listResult = await listNotices(workerId)

    return NextResponse.json(
      {
        notice,
        unreadCount: listResult.unreadCount,
        dbConfigured: isNoticesDbConfigured(),
      },
      { status: 200 },
    )
  }

  const result = await listNotices(workerId)

  return NextResponse.json(
    {
      notices: result.notices,
      unreadCount: result.unreadCount,
      dbConfigured: isNoticesDbConfigured(),
    },
    { status: 200 },
  )
}

export async function POST(request: Request) {
  if (!isNoticesDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as Partial<NoticeCreateInput>

  if (!body.title || !body.content) {
    return NextResponse.json({ error: "title과 content는 필수입니다." }, { status: 400 })
  }

  try {
    const notice = await createNotice({ title: body.title, content: body.content })
    return NextResponse.json({ notice }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TITLE") {
      return NextResponse.json({ error: "공지 제목은 2자 이상이어야 합니다." }, { status: 400 })
    }

    if (error instanceof Error && error.message === "INVALID_CONTENT") {
      return NextResponse.json({ error: "공지 본문은 5자 이상이어야 합니다." }, { status: 400 })
    }

    return NextResponse.json({ error: "공지 저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}
