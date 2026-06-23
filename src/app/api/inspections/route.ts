import { NextResponse } from "next/server"
import { createInspectionRecord, isInspectionDbConfigured } from "@/lib/inspections"
import type { InspectionRecordCreateInput } from "@/lib/inspectionRecordsShared"

type InspectionRequestBody = Partial<InspectionRecordCreateInput>

// 촬영 등록 저장 요청을 처리하는 API 라우트입니다.
export async function POST(request: Request) {
  if (!isInspectionDbConfigured()) {
    return NextResponse.json(
      { error: "DB 연결 정보가 없습니다. DATABASE_URL 또는 POSTGRES_URL을 설정해주세요." },
      { status: 503 },
    )
  }

  const body = (await request.json()) as InspectionRequestBody

  if (!body.workerId || !body.workerName || !body.knotType) {
    return NextResponse.json({ error: "workerId, workerName, knotType은 필수입니다." }, { status: 400 })
  }

  try {
    const record = await createInspectionRecord({
      workerId: body.workerId,
      workerName: body.workerName,
      knotType: body.knotType,
      imageData: body.imageData ?? null,
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "촬영 등록 저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}
