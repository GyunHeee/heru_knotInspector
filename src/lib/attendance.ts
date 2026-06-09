import { sql } from "@vercel/postgres"
import { getWorkerById, getWorkerName, WORKERS } from "@/lib/workers"

export type AttendanceType = "IN" | "OUT"

type AttendanceRow = {
  id: number
  worker_id: string
  type: AttendanceType
  timestamp: Date
}

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

export type AttendanceDashboardData = {
  dbConfigured: boolean
  todayCount: number
  monthlyTotalMinutes: number
  recentRecords: AttendanceRecord[]
  monthlySummaries: MonthlyWorkerSummary[]
}

const DB_ENV_KEYS = ["POSTGRES_URL", "POSTGRES_PRISMA_URL", "DATABASE_URL"] as const

// Vercel Postgres 연결 여부를 확인하는 헬퍼입니다.
export function isAttendanceDbConfigured() {
  return DB_ENV_KEYS.some((key) => {
    const value = process.env[key]
    return typeof value === "string" && value.length > 0
  })
}

async function ensureAttendanceSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      worker_id VARCHAR(20) NOT NULL,
      type VARCHAR(3) NOT NULL CHECK (type IN ('IN', 'OUT')),
      "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_attendance_worker_timestamp
    ON attendance (worker_id, "timestamp" DESC)
  `
}

function mapAttendanceRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    workerId: row.worker_id,
    workerName: getWorkerName(row.worker_id),
    type: row.type,
    timestamp: row.timestamp.toISOString(),
  }
}

function toKstDateKey(timestamp: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp))
}

function getMonthRange(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear()
  const month = referenceDate.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))

  return { start, end }
}

function buildMonthlySummaries(records: AttendanceRecord[]) {
  return WORKERS.map((worker) => {
    const workerRecords = records
      .filter((record) => record.workerId === worker.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    let openInTime: Date | null = null
    let totalMinutes = 0
    const workDays = new Set<string>()

    for (const record of workerRecords) {
      const recordTime = new Date(record.timestamp)

      if (record.type === "IN") {
        openInTime = recordTime
        workDays.add(toKstDateKey(record.timestamp))
        continue
      }

      if (openInTime) {
        const diffMinutes = Math.max(
          0,
          Math.round((recordTime.getTime() - openInTime.getTime()) / 60000),
        )
        totalMinutes += diffMinutes
        workDays.add(toKstDateKey(record.timestamp))
        openInTime = null
      }
    }

    return {
      workerId: worker.id,
      workerName: worker.name,
      totalMinutes,
      workDays: workDays.size,
    }
  }).sort((a, b) => b.totalMinutes - a.totalMinutes)
}

// 출퇴근 기록을 저장하는 데이터 접근 함수입니다.
export async function createAttendanceRecord(input: {
  workerId: string
  type: AttendanceType
}) {
  if (!isAttendanceDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  if (!getWorkerById(input.workerId)) {
    throw new Error("INVALID_WORKER")
  }

  await ensureAttendanceSchema()

  const result = await sql<AttendanceRow>`
    INSERT INTO attendance (worker_id, type)
    VALUES (${input.workerId}, ${input.type})
    RETURNING id, worker_id, type, "timestamp"
  `

  return mapAttendanceRow(result.rows[0])
}

// 관리자 화면용 출퇴근 이력과 월 집계를 읽어오는 함수입니다.
export async function getAttendanceDashboardData(): Promise<AttendanceDashboardData> {
  if (!isAttendanceDbConfigured()) {
    return {
      dbConfigured: false,
      todayCount: 0,
      monthlyTotalMinutes: 0,
      recentRecords: [],
      monthlySummaries: WORKERS.map((worker) => ({
        workerId: worker.id,
        workerName: worker.name,
        totalMinutes: 0,
        workDays: 0,
      })),
    }
  }

  await ensureAttendanceSchema()

  const { start, end } = getMonthRange()
  const today = toKstDateKey(new Date().toISOString())

  const recentResult = await sql<AttendanceRow>`
    SELECT id, worker_id, type, "timestamp"
    FROM attendance
    ORDER BY "timestamp" DESC
    LIMIT 100
  `

  const monthlyResult = await sql<AttendanceRow>`
    SELECT id, worker_id, type, "timestamp"
    FROM attendance
    WHERE "timestamp" >= ${start.toISOString()} AND "timestamp" < ${end.toISOString()}
    ORDER BY "timestamp" ASC
  `

  const recentRecords = recentResult.rows.map(mapAttendanceRow)
  const monthlyRecords = monthlyResult.rows.map(mapAttendanceRow)
  const monthlySummaries = buildMonthlySummaries(monthlyRecords)
  const monthlyTotalMinutes = monthlySummaries.reduce(
    (sum, summary) => sum + summary.totalMinutes,
    0,
  )
  const todayCount = recentRecords.filter((record) => toKstDateKey(record.timestamp) === today).length

  return {
    dbConfigured: true,
    todayCount,
    monthlyTotalMinutes,
    recentRecords,
    monthlySummaries,
  }
}

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

export function formatWorkMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}시간 ${minutes}분`
}
