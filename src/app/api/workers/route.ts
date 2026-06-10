import { NextResponse } from "next/server"
import {
  createWorkerProfile,
  getWorkerProfiles,
  isWorkerProfilesDbConfigured,
  updateWorkerProfile,
} from "@/lib/workerProfiles"
import type {
  WorkerProfileCreateInput,
  WorkerProfileUpdateInput,
} from "@/lib/workerProfilesShared"

type WorkerUpdateRequestBody = WorkerProfileUpdateInput & {
  id?: string
}

function messageForWorkerError(error: Error) {
  switch (error.message) {
    case "INVALID_NAME":
      return { status: 400, message: "이름은 2자 이상이어야 합니다." }
    case "INVALID_PHONE":
      return { status: 400, message: "연락처를 다시 확인해주세요." }
    case "WORKER_NOT_FOUND":
      return { status: 404, message: "작업자 정보를 찾을 수 없습니다." }
    default:
      return { status: 500, message: "작업자 정보 처리 중 오류가 발생했습니다." }
  }
}

// 작업자 목록 조회와 등록/수정을 처리하는 API 라우트입니다.
export async function GET() {
  if (!isWorkerProfilesDbConfigured()) {
    return NextResponse.json(
      {
        message: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요.",
        workers: [],
      },
      { status: 200 },
    )
  }

  const workers = await getWorkerProfiles()
  return NextResponse.json({ workers }, { status: 200 })
}

export async function POST(request: Request) {
  if (!isWorkerProfilesDbConfigured()) {
    return NextResponse.json(
      { message: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as Partial<WorkerProfileCreateInput>

  if (!body.name || !body.phone || !body.knotType || body.note === undefined) {
    return NextResponse.json(
      { message: "이름, 연락처, 담당 매듭, 특이사항은 모두 필요합니다." },
      { status: 400 },
    )
  }

  try {
    const worker = await createWorkerProfile({
      name: body.name,
      phone: body.phone,
      knotType: body.knotType,
      note: body.note,
    })

    return NextResponse.json({ worker }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      const { status, message } = messageForWorkerError(error)
      return NextResponse.json({ message }, { status })
    }

    return NextResponse.json({ message: "작업자 등록 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!isWorkerProfilesDbConfigured()) {
    return NextResponse.json(
      { message: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as WorkerUpdateRequestBody

  if (!body.id) {
    return NextResponse.json({ message: "수정할 작업자 id가 필요합니다." }, { status: 400 })
  }

  try {
    const worker = await updateWorkerProfile(body.id, {
      name: body.name,
      phone: body.phone,
      knotType: body.knotType,
      note: body.note,
      active: body.active,
    })

    return NextResponse.json({ worker }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      const { status, message } = messageForWorkerError(error)
      return NextResponse.json({ message }, { status })
    }

    return NextResponse.json({ message: "작업자 수정 중 오류가 발생했습니다." }, { status: 500 })
  }
}
