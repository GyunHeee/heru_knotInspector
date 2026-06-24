import "server-only"
import type { QueryResultRow } from "pg"
import {
  calculateGoalPercent,
  type DailyGoalHistoryItem,
  type DailyGoalInput,
  type DailyGoalProgress,
} from "@/lib/dailyGoalsShared"
import { connectionString, createDbPool } from "@/lib/db"
import { getWorkerProfiles, isWorkerProfilesDbConfigured } from "@/lib/workerProfiles"
import { WORKERS, getWorkerName } from "@/lib/workers"

type DailyGoalRow = QueryResultRow & {
  id: number
  worker_id: string
  date: string
  target: number
  achieved: number
}

const db = createDbPool()

// 일일 목표 DB 연결 여부를 확인하는 헬퍼입니다.
export function isDailyGoalsDbConfigured() {
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

function getKstDateString(reference = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return formatter.format(reference)
}

async function ensureDailyGoalsSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS daily_goals (
      id SERIAL PRIMARY KEY,
      worker_id VARCHAR(20) NOT NULL,
      date DATE NOT NULL,
      target INTEGER NOT NULL DEFAULT 0,
      achieved INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (worker_id, date)
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_daily_goals_date_worker
    ON daily_goals (date DESC, worker_id)
  `)
}

function mapRowToProgress(row: Pick<DailyGoalRow, "worker_id" | "date" | "target" | "achieved">): DailyGoalProgress {
  return mapRowToProgressWithWorkerName(row, getWorkerName(row.worker_id))
}

function mapRowToProgressWithWorkerName(
  row: Pick<DailyGoalRow, "worker_id" | "date" | "target" | "achieved">,
  workerName: string,
): DailyGoalProgress {
  const target = Number(row.target)
  const achieved = Number(row.achieved)
  const percent = calculateGoalPercent(target, achieved)

  return {
    workerId: row.worker_id,
    workerName,
    date: row.date,
    target,
    achieved,
    percent,
    reached: target > 0 && achieved >= target,
  }
}

function createEmptyProgress(workerId: string, date = getKstDateString()): DailyGoalProgress {
  return {
    workerId,
    workerName: getWorkerName(workerId),
    date,
    target: 0,
    achieved: 0,
    percent: 0,
    reached: false,
  }
}

async function getGoalWorkers() {
  if (!isWorkerProfilesDbConfigured()) {
    return WORKERS.map((worker) => ({ id: worker.id, name: worker.name }))
  }

  const profiles = await getWorkerProfiles()
  const activeProfiles = profiles
    .filter((worker) => worker.active)
    .map((worker) => ({ id: worker.id, name: worker.name }))

  return activeProfiles.length > 0
    ? activeProfiles
    : WORKERS.map((worker) => ({ id: worker.id, name: worker.name }))
}

async function getGoalWorkerName(workerId: string) {
  const workers = await getGoalWorkers()
  return workers.find((worker) => worker.id === workerId)?.name ?? getWorkerName(workerId)
}

// 특정 작업자의 오늘 목표를 불러오는 함수입니다.
export async function getTodayGoalByWorkerId(workerId: string) {
  const today = getKstDateString()
  const workerName = await getGoalWorkerName(workerId)

  if (!isDailyGoalsDbConfigured()) {
    return {
      ...createEmptyProgress(workerId, today),
      workerName,
    }
  }

  await ensureDailyGoalsSchema()

  const rows = await queryRows<DailyGoalRow>(
    `
      SELECT id, worker_id, date::text AS date, target, achieved
      FROM daily_goals
      WHERE worker_id = $1 AND date = $2
      LIMIT 1
    `,
    [workerId, today],
  )

  const row = rows[0]
  return row ? mapRowToProgressWithWorkerName(row, workerName) : { ...createEmptyProgress(workerId, today), workerName }
}

// 관리자 화면용 오늘 목표 현황을 작업자별로 불러오는 함수입니다.
export async function getTodayGoalsOverview() {
  const today = getKstDateString()
  const workers = await getGoalWorkers()

  if (!isDailyGoalsDbConfigured()) {
    return workers.map((worker) => ({
      ...createEmptyProgress(worker.id, today),
      workerName: worker.name,
    }))
  }

  await ensureDailyGoalsSchema()

  const rows = await queryRows<DailyGoalRow>(
    `
      SELECT id, worker_id, date::text AS date, target, achieved
      FROM daily_goals
      WHERE date = $1
    `,
    [today],
  )

  return workers.map((worker) => {
    const row = rows.find((item) => item.worker_id === worker.id)
    return row
      ? mapRowToProgressWithWorkerName(row, worker.name)
      : {
          ...createEmptyProgress(worker.id, today),
          workerName: worker.name,
        }
  })
}

// 관리자 화면용 일별 달성 이력을 최신순으로 불러오는 함수입니다.
export async function getDailyGoalsHistory(limit = 20) {
  if (!isDailyGoalsDbConfigured()) {
    return [] as DailyGoalHistoryItem[]
  }

  await ensureDailyGoalsSchema()
  const workers = await getGoalWorkers()

  const rows = await queryRows<DailyGoalRow>(
    `
      SELECT id, worker_id, date::text AS date, target, achieved
      FROM daily_goals
      ORDER BY date DESC, worker_id ASC
      LIMIT $1
    `,
    [limit],
  )

  return rows.map((row) => ({
    id: row.id,
    ...mapRowToProgressWithWorkerName(
      row,
      workers.find((worker) => worker.id === row.worker_id)?.name ?? getWorkerName(row.worker_id),
    ),
  }))
}

// 관리자 화면에서 오늘 목표 수량을 설정하는 함수입니다.
export async function setDailyGoal(input: DailyGoalInput) {
  if (!isDailyGoalsDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  if (input.target < 0) {
    throw new Error("INVALID_TARGET")
  }

  await ensureDailyGoalsSchema()
  const today = getKstDateString()

  const rows = await queryRows<DailyGoalRow>(
    `
      INSERT INTO daily_goals (worker_id, date, target, achieved)
      VALUES ($1, $2, $3, 0)
      ON CONFLICT (worker_id, date)
      DO UPDATE SET target = EXCLUDED.target
      RETURNING id, worker_id, date::text AS date, target, achieved
    `,
    [input.workerId, today, input.target],
  )

  return mapRowToProgressWithWorkerName(rows[0], await getGoalWorkerName(input.workerId))
}

// 촬영 등록이 완료되면 오늘 달성 수량을 1 증가시키는 함수입니다.
export async function incrementDailyGoalAchieved(workerId: string) {
  if (!isDailyGoalsDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  await ensureDailyGoalsSchema()
  const today = getKstDateString()

  const rows = await queryRows<DailyGoalRow>(
    `
      INSERT INTO daily_goals (worker_id, date, target, achieved)
      VALUES ($1, $2, 0, 1)
      ON CONFLICT (worker_id, date)
      DO UPDATE SET achieved = daily_goals.achieved + 1
      RETURNING id, worker_id, date::text AS date, target, achieved
    `,
    [workerId, today],
  )

  return mapRowToProgressWithWorkerName(rows[0], await getGoalWorkerName(workerId))
}
