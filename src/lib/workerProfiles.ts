import "server-only"
import { Pool, type QueryResultRow } from "pg"
import type {
  WorkerProfile,
  WorkerProfileCreateInput,
  WorkerProfileStats,
  WorkerProfileUpdateInput,
  WorkerProfileWithStats,
} from "@/lib/workerProfilesShared"
import { getInspectionCountByWorkerId } from "@/lib/inspections"

type WorkerRow = QueryResultRow & {
  id: string
  name: string
  phone: string
  knot_type: string
  note: string
  active: boolean
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

const DEFAULT_WORKER_ROWS = [
  {
    id: "K-002",
    name: "김상희",
    phone: "010-1111-0002",
    knotType: "매화 매듭",
    note: "매화 매듭 중심 정렬 작업 담당",
  },
  {
    id: "K-003",
    name: "김경희",
    phone: "010-1111-0003",
    knotType: "동심결 매듭",
    note: "오전 라인 동심결 검수 병행",
  },
  {
    id: "K-004",
    name: "최복술",
    phone: "010-1111-0004",
    knotType: "매화 매듭",
    note: "세밀 작업 시 확대경 사용 필요",
  },
  {
    id: "K-005",
    name: "김경애",
    phone: "010-1111-0005",
    knotType: "동심결 매듭",
    note: "손끝 작업이 안정적이며 반복 공정 숙련",
  },
  {
    id: "K-006",
    name: "양인애",
    phone: "010-1111-0006",
    knotType: "매화 매듭",
    note: "매화 매듭 꽃잎 균형 작업 담당",
  },
  {
    id: "K-007",
    name: "이금자",
    phone: "010-1111-0007",
    knotType: "동심결 매듭",
    note: "오후 라인 동심결 제작 담당",
  },
  {
    id: "K-008",
    name: "김영숙",
    phone: "010-1111-0008",
    knotType: "공통",
    note: "공정 보조 및 공통 작업 지원",
  },
] as const

// 작업자 프로필 DB 연결 여부를 확인하는 헬퍼입니다.
export function isWorkerProfilesDbConfigured() {
  return typeof connectionString === "string" && connectionString.length > 0
}

function getDb() {
  if (!db) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  return db
}

async function queryRows<T extends QueryResultRow>(queryText: string, values: unknown[] = []) {
  const pool = getDb()
  const result = await pool.query<T>(queryText, values)
  return result.rows
}

function normalizePhone(phone: string) {
  return phone.trim()
}

function mapWorkerRow(row: WorkerRow): WorkerProfile {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    knotType: row.knot_type as WorkerProfile["knotType"],
    note: row.note,
    active: row.active,
    createdAt: row.created_at.toISOString(),
  }
}

async function computeWorkerStats(workerId: string): Promise<WorkerProfileStats> {
  const totalProduction = await getInspectionCountByWorkerId(workerId)
  return {
    totalProduction,
  }
}

async function attachStats(worker: WorkerProfile): Promise<WorkerProfileWithStats> {
  return {
    ...worker,
    stats: await computeWorkerStats(worker.id),
  }
}

async function seedDefaultWorkers() {
  for (const worker of DEFAULT_WORKER_ROWS) {
    await queryRows(
      `
        INSERT INTO workers (id, name, phone, knot_type, note, active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (id) DO UPDATE
        SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          knot_type = EXCLUDED.knot_type,
          note = EXCLUDED.note
      `,
      [worker.id, worker.name, worker.phone, worker.knotType, worker.note],
    )
  }

  await queryRows(
    `
      UPDATE workers
      SET active = false
      WHERE id = 'K-001' AND name = '오세철'
    `,
  )
}

async function ensureWorkersSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS workers (
      id VARCHAR(20) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      knot_type VARCHAR(30) NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_workers_active_created_at
    ON workers (active, created_at DESC)
  `)

  await seedDefaultWorkers()
}

function validateWorkerInput(input: WorkerProfileCreateInput) {
  if (input.name.trim().length < 2) {
    throw new Error("INVALID_NAME")
  }

  if (normalizePhone(input.phone).length < 8) {
    throw new Error("INVALID_PHONE")
  }
}

async function createNextWorkerId() {
  const rows = await queryRows<QueryResultRow & { id: string }>(`
    SELECT id
    FROM workers
    ORDER BY id DESC
    LIMIT 1
  `)

  const currentId = rows[0]?.id ?? "K-000"
  const nextNumber = Number.parseInt(currentId.replace("K-", ""), 10) + 1

  return `K-${String(nextNumber).padStart(3, "0")}`
}

// 작업자 목록을 불러오는 함수입니다.
export async function getWorkerProfiles() {
  if (!isWorkerProfilesDbConfigured()) {
    return [] as WorkerProfileWithStats[]
  }

  await ensureWorkersSchema()

  const rows = await queryRows<WorkerRow>(`
    SELECT id, name, phone, knot_type, note, active, created_at
    FROM workers
    ORDER BY active DESC, created_at DESC
  `)

  return Promise.all(rows.map(mapWorkerRow).map(attachStats))
}

// 단일 작업자 상세 정보를 불러오는 함수입니다.
export async function getWorkerProfileById(workerId: string) {
  if (!isWorkerProfilesDbConfigured()) {
    return null
  }

  await ensureWorkersSchema()

  const rows = await queryRows<WorkerRow>(
    `
      SELECT id, name, phone, knot_type, note, active, created_at
      FROM workers
      WHERE id = $1
      LIMIT 1
    `,
    [workerId],
  )

  const row = rows[0]

  if (!row) {
    return null
  }

  return attachStats(mapWorkerRow(row))
}

// 작업자 기본 정보를 등록하는 함수입니다.
export async function createWorkerProfile(input: WorkerProfileCreateInput) {
  if (!isWorkerProfilesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  validateWorkerInput(input)
  await ensureWorkersSchema()

  const workerId = await createNextWorkerId()

  const rows = await queryRows<WorkerRow>(
    `
      INSERT INTO workers (id, name, phone, knot_type, note, active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, name, phone, knot_type, note, active, created_at
    `,
    [workerId, input.name.trim(), normalizePhone(input.phone), input.knotType, input.note.trim()],
  )

  return attachStats(mapWorkerRow(rows[0]))
}

// 작업자 정보를 수정하거나 비활성화 상태를 갱신하는 함수입니다.
export async function updateWorkerProfile(workerId: string, input: WorkerProfileUpdateInput) {
  if (!isWorkerProfilesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  await ensureWorkersSchema()

  const current = await getWorkerProfileById(workerId)

  if (!current) {
    throw new Error("WORKER_NOT_FOUND")
  }

  const nextInput: WorkerProfileCreateInput = {
    name: input.name?.trim() ?? current.name,
    phone: normalizePhone(input.phone ?? current.phone),
    knotType: input.knotType ?? current.knotType,
    note: input.note?.trim() ?? current.note,
  }

  validateWorkerInput(nextInput)

  const rows = await queryRows<WorkerRow>(
    `
      UPDATE workers
      SET
        name = $2,
        phone = $3,
        knot_type = $4,
        note = $5,
        active = $6
      WHERE id = $1
      RETURNING id, name, phone, knot_type, note, active, created_at
    `,
    [workerId, nextInput.name, nextInput.phone, nextInput.knotType, nextInput.note, input.active ?? current.active],
  )

  return attachStats(mapWorkerRow(rows[0]))
}
