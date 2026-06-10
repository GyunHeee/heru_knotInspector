import { NextResponse } from "next/server"
import { createAttendanceRecord, isAttendanceDbConfigured } from "@/lib/attendance"
import type { AttendanceType } from "@/lib/attendanceShared"

type AttendanceRequestBody = {
  workerId?: string
  type?: AttendanceType
}

// 출퇴근 기록 저장 요청을 처리하는 API 라우트입니다.
export async function POST(request: Request) {
  if (!isAttendanceDbConfigured()) {
    return NextResponse.json(
      {
        message:
          "Vercel Postgres 연결 정보가 없습니다. POSTGRES_URL 또는 DATABASE_URL을 설정해주세요.",
      },
      { status: 503 },
    )
  }

  const body = (await request.json()) as AttendanceRequestBody

  if (!body.workerId || (body.type !== "IN" && body.type !== "OUT")) {
    return NextResponse.json(
      { message: "workerId와 type(IN/OUT)은 필수입니다." },
      { status: 400 },
    )
  }

  try {
    const record = await createAttendanceRecord({
      workerId: body.workerId,
      type: body.type,
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_WORKER") {
      return NextResponse.json({ message: "등록되지 않은 작업자입니다." }, { status: 400 })
    }

    return NextResponse.json(
      { message: "출퇴근 기록 저장 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
