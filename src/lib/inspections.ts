import "server-only"
import { Pool, type QueryResultRow } from "pg"
import type { InspectionRecord, InspectionRecordCreateInput } from "@/lib/inspectionRecordsShared"

type InspectionRecordRow = QueryResultRow & {
  id: number
  worker_id: string
  worker_name: string
  knot_type: "동심결 매듭" | "매화 매듭"
  image_data: string | null
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

// 촬영 등록 DB 연결 여부를 확인하는 헬퍼입니다.
export function isInspectionDbConfigured() {
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

function mapInspectionRecord(row: InspectionRecordRow): InspectionRecord {
  return {
    id: row.id,
    workerId: row.worker_id,
    workerName: row.worker_name,
    knotType: row.knot_type,
    imageData: row.image_data,
    createdAt: row.created_at.toISOString(),
  }
}

async function ensureInspectionSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS inspection_records (
      id SERIAL PRIMARY KEY,
      worker_id VARCHAR(20) NOT NULL,
      worker_name VARCHAR(100) NOT NULL,
      knot_type VARCHAR(30) NOT NULL,
      image_data TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_inspection_records_created_at
    ON inspection_records (created_at DESC)
  `)
}

// 촬영 등록 이력을 최신순으로 불러오는 함수입니다.
export async function listInspectionRecords(limit = 10) {
  if (!isInspectionDbConfigured()) {
    return [] as InspectionRecord[]
  }

  await ensureInspectionSchema()

  const rows = await queryRows<InspectionRecordRow>(
    `
      SELECT id, worker_id, worker_name, knot_type, image_data, created_at
      FROM inspection_records
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit],
  )

  return rows.map(mapInspectionRecord)
}

// 촬영 등록 요약 정보를 불러오는 함수입니다.
export async function getInspectionSummary() {
  const records = await listInspectionRecords(200)

  return {
    totalCount: records.length,
    dongsimCount: records.filter((record) => record.knotType === "동심결 매듭").length,
    maehwaCount: records.filter((record) => record.knotType === "매화 매듭").length,
  }
}

// 작업자별 누적 촬영 등록 건수를 계산합니다.
export async function getInspectionCountByWorkerId(workerId: string) {
  if (!isInspectionDbConfigured()) {
    return 0
  }

  await ensureInspectionSchema()

  const rows = await queryRows<QueryResultRow & { count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM inspection_records
      WHERE worker_id = $1
    `,
    [workerId],
  )

  return Number(rows[0]?.count ?? "0")
}

// 촬영 등록 정보를 저장하는 함수입니다.
export async function createInspectionRecord(input: InspectionRecordCreateInput) {
  if (!isInspectionDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  await ensureInspectionSchema()

  const rows = await queryRows<InspectionRecordRow>(
    `
      INSERT INTO inspection_records (worker_id, worker_name, knot_type, image_data)
      VALUES ($1, $2, $3, $4)
      RETURNING id, worker_id, worker_name, knot_type, image_data, created_at
    `,
    [input.workerId, input.workerName, input.knotType, input.imageData],
  )

  return mapInspectionRecord(rows[0])
}
