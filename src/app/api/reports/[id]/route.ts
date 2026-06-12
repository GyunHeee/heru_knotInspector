import { NextResponse } from "next/server"
import { isReportsDbConfigured, updateReportStatus } from "@/lib/reports"
import type { ReportStatus } from "@/lib/reportsShared"

type UpdateReportBody = {
  status?: ReportStatus
}

// 관리자 신고 상태를 갱신하는 API 라우트입니다.
export async function PUT(request: Request, context: { params: { id: string } }) {
  if (!isReportsDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const reportId = Number.parseInt(context.params.id, 10)
  const body = (await request.json()) as UpdateReportBody

  if (!Number.isFinite(reportId)) {
    return NextResponse.json({ error: "유효한 신고 번호가 필요합니다." }, { status: 400 })
  }

  if (!body.status) {
    return NextResponse.json({ error: "status는 필수입니다." }, { status: 400 })
  }

  try {
    const report = await updateReportStatus(reportId, body.status)
    return NextResponse.json({ report }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      return NextResponse.json({ error: "유효한 상태값이 아닙니다." }, { status: 400 })
    }

    if (error instanceof Error && error.message === "REPORT_NOT_FOUND") {
      return NextResponse.json({ error: "신고 내역을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ error: "신고 상태 변경 중 오류가 발생했습니다." }, { status: 500 })
  }
}
