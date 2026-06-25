import "server-only"
import type { QueryResultRow } from "pg"
import type { GuideInput, GuideItem, KnotGuideType } from "@/lib/guidesShared"
import { connectionString, createDbPool } from "@/lib/db"
import { GUIDE_KNOT_TYPES } from "@/lib/guidesShared"

type GuideRow = QueryResultRow & {
  id: number
  knot_type: KnotGuideType
  step: number
  image_path: string
  description: string
}

const db = createDbPool()

const DEFAULT_GUIDES: GuideInput[] = [
  {
    knotType: "동심결 매듭",
    step: 1,
    imagePath: "/guides/dongsim-1.svg",
    description: "중심 고리를 만들고 좌우 끈 길이가 같은지 먼저 맞춰주세요.",
  },
  {
    knotType: "동심결 매듭",
    step: 2,
    imagePath: "/guides/dongsim-2.svg",
    description: "양쪽 끈을 교차해 중심 안으로 넣고 루프가 눌리지 않게 유지합니다.",
  },
  {
    knotType: "동심결 매듭",
    step: 3,
    imagePath: "/guides/dongsim-3.svg",
    description: "중심을 조이면서 좌우 루프 크기와 꼬리 길이를 같은 비율로 정리합니다.",
  },
  {
    knotType: "매화 매듭",
    step: 1,
    imagePath: "/guides/maehwa-1.svg",
    description: "가운데 중심을 잡고 첫 꽃잎 두 개의 간격과 크기를 맞춰줍니다.",
  },
  {
    knotType: "매화 매듭",
    step: 2,
    imagePath: "/guides/maehwa-2.svg",
    description: "아래 꽃잎 두 개를 추가하며 전체 간격이 사방으로 고르게 퍼지도록 확인합니다.",
  },
  {
    knotType: "매화 매듭",
    step: 3,
    imagePath: "/guides/maehwa-3.svg",
    description: "마지막 꽃잎을 더하고 중심을 조여 다섯 꽃잎이 같은 크기로 보이게 정리합니다.",
  },
]

// 가이드 기능의 DB 연결 여부를 확인하는 헬퍼입니다.
export function isGuidesDbConfigured() {
  return typeof connectionString === "string" && connectionString.length > 0
}

function getDb() {
  if (!db) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  return db
}

async function queryRows<T extends QueryResultRow>(queryText: string, values: unknown[] = []) {
  try {
    const result = await getDb().query<T>(queryText, values)
    return result.rows
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error("DUPLICATE_STEP")
    }

    throw error
  }
}

async function ensureGuidesSchema() {
  await queryRows(`
    CREATE TABLE IF NOT EXISTS guides (
      id SERIAL PRIMARY KEY,
      knot_type VARCHAR(30) NOT NULL,
      step INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      description TEXT NOT NULL,
      UNIQUE (knot_type, step)
    )
  `)

  await queryRows(`
    CREATE INDEX IF NOT EXISTS idx_guides_knot_type_step
    ON guides (knot_type, step ASC)
  `)

  const rows = await queryRows<QueryResultRow & { count: string }>(`SELECT COUNT(*)::text AS count FROM guides`)
  const count = Number.parseInt(rows[0]?.count ?? "0", 10)

  if (count === 0) {
    for (const guide of DEFAULT_GUIDES) {
      await queryRows(
        `
          INSERT INTO guides (knot_type, step, image_path, description)
          VALUES ($1, $2, $3, $4)
        `,
        [guide.knotType, guide.step, guide.imagePath, guide.description],
      )
    }
  }
}

function mapGuide(row: GuideRow): GuideItem {
  return {
    id: row.id,
    knotType: row.knot_type,
    step: row.step,
    imagePath: row.image_path,
    description: row.description,
  }
}

function validateGuideInput(input: GuideInput) {
  if (!GUIDE_KNOT_TYPES.some((item) => item.knotType === input.knotType)) {
    throw new Error("INVALID_KNOT_TYPE")
  }

  if (!Number.isInteger(input.step) || input.step <= 0) {
    throw new Error("INVALID_STEP")
  }

  if (input.description.trim().length < 5) {
    throw new Error("INVALID_DESCRIPTION")
  }
}

// 매듭 종류별 가이드를 단계 순서대로 불러오는 함수입니다.
export async function getGuidesByKnotType(knotType: KnotGuideType) {
  if (!isGuidesDbConfigured()) {
    return DEFAULT_GUIDES.filter((guide) => guide.knotType === knotType).map((guide, index) => ({
      id: index + 1,
      knotType: guide.knotType,
      step: guide.step,
      imagePath: guide.imagePath ?? "",
      description: guide.description,
    }))
  }

  await ensureGuidesSchema()

  const rows = await queryRows<GuideRow>(
    `
      SELECT id, knot_type, step, image_path, description
      FROM guides
      WHERE knot_type = $1
      ORDER BY step ASC
    `,
    [knotType],
  )

  return rows.map(mapGuide)
}

// 관리자 화면에서 전체 가이드를 불러오는 함수입니다.
export async function getAllGuides() {
  if (!isGuidesDbConfigured()) {
    return DEFAULT_GUIDES.map((guide, index) => ({
      id: index + 1,
      knotType: guide.knotType,
      step: guide.step,
      imagePath: guide.imagePath ?? "",
      description: guide.description,
    }))
  }

  await ensureGuidesSchema()

  const rows = await queryRows<GuideRow>(`
    SELECT id, knot_type, step, image_path, description
    FROM guides
    ORDER BY knot_type ASC, step ASC
  `)

  return rows.map(mapGuide)
}

// 관리자가 새 가이드 단계를 등록하는 함수입니다.
export async function createGuide(input: GuideInput) {
  if (!isGuidesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  validateGuideInput(input)

  if (!input.imagePath) {
    throw new Error("IMAGE_REQUIRED")
  }

  await ensureGuidesSchema()

  const rows = await queryRows<GuideRow>(
    `
      INSERT INTO guides (knot_type, step, image_path, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, knot_type, step, image_path, description
    `,
    [input.knotType, input.step, input.imagePath, input.description.trim()],
  )

  return mapGuide(rows[0])
}

// 관리자가 기존 가이드 단계를 수정하는 함수입니다.
export async function updateGuide(guideId: number, input: GuideInput) {
  if (!isGuidesDbConfigured()) {
    throw new Error("DB_NOT_CONFIGURED")
  }

  validateGuideInput(input)
  await ensureGuidesSchema()

  const rows = await queryRows<GuideRow>(
    `
      UPDATE guides
      SET knot_type = $2,
          step = $3,
          image_path = $4,
          description = $5
      WHERE id = $1
      RETURNING id, knot_type, step, image_path, description
    `,
    [guideId, input.knotType, input.step, input.imagePath ?? "", input.description.trim()],
  )

  if (!rows[0]) {
    throw new Error("GUIDE_NOT_FOUND")
  }

  return mapGuide(rows[0])
}
