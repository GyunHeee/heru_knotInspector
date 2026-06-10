export type DailyGoalProgress = {
  workerId: string
  workerName: string
  date: string
  target: number
  achieved: number
  percent: number
  reached: boolean
}

export type DailyGoalHistoryItem = DailyGoalProgress & {
  id: number
}

export type DailyGoalInput = {
  workerId: string
  target: number
}

// 목표 달성률을 0~100 범위 정수로 계산합니다.
export function calculateGoalPercent(target: number, achieved: number) {
  if (target <= 0) {
    return 0
  }

  return Math.min(100, Math.round((achieved / target) * 100))
}
