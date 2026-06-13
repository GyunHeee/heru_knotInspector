import { NextResponse } from "next/server"
import { getWorkerAttendanceStatus, isAttendanceDbConfigured } from "@/lib/attendance"

// 작업자의 현재 출근 상태를 조회하는 API 라우트입니다.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get("workerId")

  if (!workerId) {
    return NextResponse.json({ error: "workerId는 필수입니다." }, { status: 400 })
  }

  if (!isAttendanceDbConfigured()) {
    return NextResponse.json(
      {
        dbConfigured: false,
        status: {
          workerId,
          workerName: workerId,
          isWorking: false,
          latestRecord: null,
        },
      },
      { status: 200 },
    )
  }

  try {
    const status = await getWorkerAttendanceStatus(workerId)
    return NextResponse.json({ dbConfigured: true, status }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_WORKER") {
      return NextResponse.json({ error: "등록되지 않은 작업자입니다." }, { status: 400 })
    }

    return NextResponse.json({ error: "출근 상태 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
