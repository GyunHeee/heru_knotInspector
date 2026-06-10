import { NextResponse } from "next/server"
import { incrementDailyGoalAchieved, isDailyGoalsDbConfigured, setDailyGoal } from "@/lib/dailyGoals"
import type { DailyGoalInput } from "@/lib/dailyGoalsShared"

type IncrementGoalBody = {
  workerId?: string
}

// 일일 목표 설정과 달성 수량 증가를 처리하는 API 라우트입니다.
export async function PUT(request: Request) {
  if (!isDailyGoalsDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as Partial<DailyGoalInput>

  if (!body.workerId || typeof body.target !== "number") {
    return NextResponse.json({ error: "workerId와 target은 필수입니다." }, { status: 400 })
  }

  try {
    const goal = await setDailyGoal({ workerId: body.workerId, target: body.target })
    return NextResponse.json({ goal }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TARGET") {
      return NextResponse.json({ error: "목표 개수는 0 이상이어야 합니다." }, { status: 400 })
    }

    return NextResponse.json({ error: "목표 저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isDailyGoalsDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as IncrementGoalBody

  if (!body.workerId) {
    return NextResponse.json({ error: "workerId는 필수입니다." }, { status: 400 })
  }

  try {
    const goal = await incrementDailyGoalAchieved(body.workerId)
    return NextResponse.json({ goal }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "달성 수량 갱신 중 오류가 발생했습니다." }, { status: 500 })
  }
}
