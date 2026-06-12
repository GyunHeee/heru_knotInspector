import { NextResponse } from "next/server"
import { getGuidesByKnotType } from "@/lib/guides"
import { isGuideKnotType } from "@/lib/guidesShared"

// 매듭 종류별 단계 가이드를 조회하는 API 라우트입니다.
export async function GET(request: Request, context: { params: { knotType: string } }) {
  const knotType = decodeURIComponent(context.params.knotType)

  if (!isGuideKnotType(knotType)) {
    return NextResponse.json({ error: "유효한 매듭 종류가 아닙니다." }, { status: 400 })
  }

  const guides = await getGuidesByKnotType(knotType)
  return NextResponse.json({ guides }, { status: 200 })
}
