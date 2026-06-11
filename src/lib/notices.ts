import "server-only"
import { Pool, type QueryResultRow } from "pg"
import {
  createNoticePreview,
  type NoticeCreateInput,
  type NoticeDetail,
  type NoticeSummary,
} from "@/lib/noticesShared"

type NoticeRow = QueryResultRow & {
  id: number
  title: string
  content: string
  created_at: Date
  read_at?: Date | null
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? null

const db = connectionString
  ? new Pool({
      connectionString,
      ssl: false,
    })
  : null

// 공지 기능의 DB 연결 여부를 확인하는 헬퍼입니다.
export function isNoticesDbConfigured() {
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

async function ensureNoticesSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS notices (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await queryRows(`
    CREATE TABLE IF NOT EXISTS notice_reads (
      notice_id INTEGER NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
      worker_id VARCHAR(20) NOT NULL,
      read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (notice_id, worker_id)
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_notices_created_at
    ON notices (created_at DESC)
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_notice_reads_worker_id
    ON notice_reads (worker_id, read_at DESC)
  `)
}

function mapNoticeSummary(row: NoticeRow): NoticeSummary {
  return {
    id: row.id,
    title: row.title,
    contentPreview: createNoticePreview(row.content),
    createdAt: formatDateTime(row.created_at),
    isRead: row.read_at !== null && row.read_at !== undefined,
  }
}

function mapNoticeDetail(row: NoticeRow): NoticeDetail {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: formatDateTime(row.created_at),
    isRead: row.read_at !== null && row.read_at !== undefined,
    readAt: row.read_at ? formatDateTime(row.read_at) : null,
  }
}

function validateNoticeInput(input: NoticeCreateInput) {
  if (input.title.trim().length < 2) {
    throw new Error("INVALID_TITLE")
  }

  if (input.content.trim().length < 5) {
    throw new Error("INVALID_CONTENT")
  }
}

// 공지 목록과 읽지 않은 개수를 조회하는 함수입니다.
export async function listNotices(workerId?: string) {
  if (!isNoticesDbConfigured()) {
    return {
      notices: [] as NoticeSummary[],
      unreadCount: 0,
    }
  }

  await ensureNoticesSchema()

  if (!workerId) {
    const rows = await queryRows<NoticeRow>(`
      SELECT id, title, content, created_at, NULL::timestamptz AS read_at
      FROM notices
      ORDER BY created_at DESC
    `)

    return {
      notices: rows.map(mapNoticeSummary),
      unreadCount: 0,
    }
  }

  const rows = await queryRows<NoticeRow>(
    `
      SELECT notices.id, notices.title, notices.content, notices.created_at, notice_reads.read_at
      FROM notices
      LEFT JOIN notice_reads
        ON notice_reads.notice_id = notices.id
       AND notice_reads.worker_id = $1
      ORDER BY notices.created_at DESC
    `,
    [workerId],
  )

  return {
    notices: rows.map(mapNoticeSummary),
    unreadCount: rows.filter((row) => row.read_at === null || row.read_at === undefined).length,
  }
}

// 단일 공지 상세를 조회하는 함수입니다.
export async function getNoticeById(noticeId: number, workerId?: string) {
  if (!isNoticesDbConfigured()) {
    return null
  }

  await ensureNoticesSchema()

  const values = workerId ? [noticeId, workerId] : [noticeId]
  const queryText = workerId
    ? `
        SELECT notices.id, notices.title, notices.content, notices.created_at, notice_reads.read_at
        FROM notices
        LEFT JOIN notice_reads
          ON notice_reads.notice_id = notices.id
         AND notice_reads.worker_id = $2
        WHERE notices.id = $1
        LIMIT 1
      `
    : `
        SELECT id, title, content, created_at, NULL::timestamptz AS read_at
        FROM notices
        WHERE id = $1
        LIMIT 1
      `

  const rows = await queryRows<NoticeRow>(queryText, values)
  const row = rows[0]

  return row ? mapNoticeDetail(row) : null
}

// 관리자가 새 공지를 등록하는 함수입니다.
export async function createNotice(input: NoticeCreateInput) {
  if (!isNoticesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  validateNoticeInput(input)
  await ensureNoticesSchema()

  const rows = await queryRows<NoticeRow>(
    `
      INSERT INTO notices (title, content)
      VALUES ($1, $2)
      RETURNING id, title, content, created_at, NULL::timestamptz AS read_at
    `,
    [input.title.trim(), input.content.trim()],
  )

  return mapNoticeSummary(rows[0])
}

// 작업자가 공지를 읽었을 때 읽음 상태를 기록하는 함수입니다.
export async function markNoticeAsRead(noticeId: number, workerId: string) {
  if (!isNoticesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  await ensureNoticesSchema()

  await queryRows(
    `
      INSERT INTO notice_reads (notice_id, worker_id)
      VALUES ($1, $2)
      ON CONFLICT (notice_id, worker_id)
      DO UPDATE SET read_at = NOW()
    `,
    [noticeId, workerId],
  )

  return getNoticeById(noticeId, workerId)
}
