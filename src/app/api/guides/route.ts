import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createGuide, isGuidesDbConfigured, updateGuide } from "@/lib/guides"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "@/lib/adminAuth"
import { getGuideSlug, isGuideKnotType, type KnotGuideType } from "@/lib/guidesShared"

export const runtime = "nodejs"

function parseStep(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(typeof value === "string" ? value : "", 10)
  return parsed
}

async function saveUploadedImage(file: File, knotType: KnotGuideType, step: number) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "png" : "png"
  const safeName = `${getGuideSlug(knotType)}-${Date.now()}-step-${step}.${extension.toLowerCase()}`
  const relativePath = `/guides/${safeName}`
  const absoluteDir = path.join(process.cwd(), "public", "guides")
  const absolutePath = path.join(absoluteDir, safeName)

  await mkdir(absoluteDir, { recursive: true })
  await writeFile(absolutePath, buffer)

  return relativePath
}

// 관리자 가이드 등록과 수정을 처리하는 API 라우트입니다.
export async function POST(request: Request) {
  const cookieStore = cookies()
  const isAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  if (!isAuthenticated) {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 })
  }

  if (!isGuidesDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const formData = await request.formData()
  const knotTypeValue = formData.get("knotType")
  const descriptionValue = formData.get("description")
  const file = formData.get("image")
  const step = parseStep(formData.get("step"))

  if (typeof knotTypeValue !== "string" || !isGuideKnotType(knotTypeValue)) {
    return NextResponse.json({ error: "유효한 매듭 종류를 선택해주세요." }, { status: 400 })
  }

  if (typeof descriptionValue !== "string") {
    return NextResponse.json({ error: "설명을 입력해주세요." }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "가이드 이미지를 업로드해주세요." }, { status: 400 })
  }

  try {
    const imagePath = await saveUploadedImage(file, knotTypeValue, step)
    const guide = await createGuide({
      knotType: knotTypeValue,
      step,
      imagePath,
      description: descriptionValue,
    })
    return NextResponse.json({ guide }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_STEP") {
      return NextResponse.json({ error: "단계 번호는 1 이상의 숫자여야 합니다." }, { status: 400 })
    }

    if (error instanceof Error && error.message === "INVALID_DESCRIPTION") {
      return NextResponse.json({ error: "설명은 5자 이상 입력해주세요." }, { status: 400 })
    }

    return NextResponse.json({ error: "가이드 등록 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = cookies()
  const isAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  if (!isAuthenticated) {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 })
  }

  if (!isGuidesDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const formData = await request.formData()
  const guideId = Number.parseInt(String(formData.get("id") ?? ""), 10)
  const knotTypeValue = formData.get("knotType")
  const descriptionValue = formData.get("description")
  const existingImagePath = formData.get("existingImagePath")
  const file = formData.get("image")
  const step = parseStep(formData.get("step"))

  if (!Number.isFinite(guideId)) {
    return NextResponse.json({ error: "수정할 가이드 번호가 필요합니다." }, { status: 400 })
  }

  if (typeof knotTypeValue !== "string" || !isGuideKnotType(knotTypeValue)) {
    return NextResponse.json({ error: "유효한 매듭 종류를 선택해주세요." }, { status: 400 })
  }

  if (typeof descriptionValue !== "string") {
    return NextResponse.json({ error: "설명을 입력해주세요." }, { status: 400 })
  }

  let imagePath = typeof existingImagePath === "string" ? existingImagePath : ""

  try {
    if (file instanceof File && file.size > 0) {
      imagePath = await saveUploadedImage(file, knotTypeValue, step)
    }

    const guide = await updateGuide(guideId, {
      knotType: knotTypeValue,
      step,
      imagePath,
      description: descriptionValue,
    })

    return NextResponse.json({ guide }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "GUIDE_NOT_FOUND") {
      return NextResponse.json({ error: "수정할 가이드를 찾을 수 없습니다." }, { status: 404 })
    }

    if (error instanceof Error && error.message === "INVALID_STEP") {
      return NextResponse.json({ error: "단계 번호는 1 이상의 숫자여야 합니다." }, { status: 400 })
    }

    if (error instanceof Error && error.message === "INVALID_DESCRIPTION") {
      return NextResponse.json({ error: "설명은 5자 이상 입력해주세요." }, { status: 400 })
    }

    return NextResponse.json({ error: "가이드 수정 중 오류가 발생했습니다." }, { status: 500 })
  }
}
