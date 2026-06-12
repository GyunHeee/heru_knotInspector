import "server-only"
import { Pool, type QueryResultRow } from "pg"
import { getWorkerName } from "@/lib/workers"
import {
  getReportStatusLabel,
  getReportTypeLabel,
  type ReportCreateInput,
  type ReportItem,
  type ReportStatus,
  type ReportType,
} from "@/lib/reportsShared"

type ReportRow = QueryResultRow & {
  id: number
  worker_id: string
  type: ReportType
  status: ReportStatus
  created_at: Date
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? null

const db = connectionString
  ? new Pool({
      connectionString,
      ssl: false,
    })
  : null

// 신고 기능의 DB 연결 여부를 확인하는 헬퍼입니다.
export function isReportsDbConfigured() {
  return typeof connectionString === "string" && connectionString.length > 0
}

function getDb() {
  if (!db) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  return db
}

async function queryRows<T extends QueryResultRow>(queryText: string, values: unknown[] = []) {
  const result = await getDb().query<T>(queryText, values)
  return result.rows
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

async function ensureReportsSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      worker_id VARCHAR(20) NOT NULL,
      type VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_reports_created_at
    ON reports (created_at DESC)
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_reports_status_created_at
    ON reports (status, created_at DESC)
  `)
}

function mapReport(row: ReportRow): ReportItem {
  return {
    id: row.id,
    workerId: row.worker_id,
    workerName: getWorkerName(row.worker_id),
    type: row.type,
    typeLabel: getReportTypeLabel(row.type),
    status: row.status,
    statusLabel: getReportStatusLabel(row.status),
    createdAt: formatDateTime(row.created_at),
  }
}

function validateReportInput(input: ReportCreateInput) {
  if (!input.workerId.trim()) {
    throw new Error("INVALID_WORKER")
  }

  if (!["HEALTH", "MATERIAL", "EQUIPMENT", "OTHER"].includes(input.type)) {
    throw new Error("INVALID_TYPE")
  }
}

// 관리자 화면에서 신고 목록을 최신순으로 불러오는 함수입니다.
export async function listReports() {
  if (!isReportsDbConfigured()) {
    return [] as ReportItem[]
  }

  await ensureReportsSchema()

  const rows = await queryRows<ReportRow>(`
    SELECT id, worker_id, type, status, created_at
    FROM reports
    ORDER BY created_at DESC
  `)

  return rows.map(mapReport)
}

// 작업자가 새 신고를 등록하는 함수입니다.
export async function createReport(input: ReportCreateInput) {
  if (!isReportsDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  validateReportInput(input)
  await ensureReportsSchema()

  const rows = await queryRows<ReportRow>(
    `
      INSERT INTO reports (worker_id, type, status)
      VALUES ($1, $2, 'PENDING')
      RETURNING id, worker_id, type, status, created_at
    `,
    [input.workerId, input.type],
  )

  return mapReport(rows[0])
}

// 관리자가 신고 상태를 처리완료로 변경하는 함수입니다.
export async function updateReportStatus(reportId: number, status: ReportStatus) {
  if (!isReportsDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  if (!["PENDING", "DONE"].includes(status)) {
    throw new Error("INVALID_STATUS")
  }

  await ensureReportsSchema()

  const rows = await queryRows<ReportRow>(
    `
      UPDATE reports
      SET status = $2
      WHERE id = $1
      RETURNING id, worker_id, type, status, created_at
    `,
    [reportId, status],
  )

  if (!rows[0]) {
    throw new Error("REPORT_NOT_FOUND")
  }

  return mapReport(rows[0])
}
