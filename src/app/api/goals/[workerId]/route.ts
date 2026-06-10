import { NextResponse } from "next/server"
import { getTodayGoalByWorkerId } from "@/lib/dailyGoals"

// 선택된 작업자의 오늘 목표와 달성률을 조회하는 API 라우트입니다.
export async function GET(
  request: Request,
  context: { params: { workerId: string } },
) {
  const goal = await getTodayGoalByWorkerId(context.params.workerId)
  return NextResponse.json({ goal }, { status: 200 })
}
