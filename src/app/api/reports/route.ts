import { NextResponse } from "next/server"
import { createReport, isReportsDbConfigured } from "@/lib/reports"
import type { ReportCreateInput } from "@/lib/reportsShared"

// 작업자 신고를 등록하는 API 라우트입니다.
export async function POST(request: Request) {
  if (!isReportsDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as Partial<ReportCreateInput>

  if (!body.workerId || !body.type) {
    return NextResponse.json({ error: "workerId와 type은 필수입니다." }, { status: 400 })
  }

  try {
    const report = await createReport({ workerId: body.workerId, type: body.type })
    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_WORKER") {
      return NextResponse.json({ error: "작업자를 선택해주세요." }, { status: 400 })
    }

    if (error instanceof Error && error.message === "INVALID_TYPE") {
      return NextResponse.json({ error: "유효한 신고 유형이 아닙니다." }, { status: 400 })
    }

    return NextResponse.json({ error: "신고 접수 중 오류가 발생했습니다." }, { status: 500 })
  }
}
