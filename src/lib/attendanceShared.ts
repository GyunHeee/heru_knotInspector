export type AttendanceType = "IN" | "OUT"

export type AttendanceRecord = {
  id: number
  workerId: string
  workerName: string
  type: AttendanceType
  timestamp: string
}

export type MonthlyWorkerSummary = {
  workerId: string
  workerName: string
  totalMinutes: number
  workDays: number
}


export type WorkerAttendanceStatus = {
  workerId: string
  workerName: string
  isWorking: boolean
  latestRecord: AttendanceRecord | null
}

export type AttendanceDashboardData = {
  dbConfigured: boolean
  todayCount: number
  monthlyTotalMinutes: number
  recentRecords: AttendanceRecord[]
  monthlySummaries: MonthlyWorkerSummary[]
}

// 출퇴근 시각을 한국 시간 기준으로 읽기 쉽게 보여주는 함수입니다.
export function formatAttendanceDateTime(timestamp: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

// 누적 근무 시간을 시/분 문자열로 보여주는 함수입니다.
export function formatWorkMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}시간 ${minutes}분`
}
