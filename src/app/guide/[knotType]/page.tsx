import GuideSliderClient from "@/components/GuideSliderClient"
import { getGuidesByKnotType } from "@/lib/guides"
import { isGuideKnotType } from "@/lib/guidesShared"

export default async function GuideDetailPage({ params }: { params: { knotType: string } }) {
  const knotType = decodeURIComponent(params.knotType)

  if (!isGuideKnotType(knotType)) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl rounded-[2rem] bg-white p-6 text-center shadow-xl ring-1 ring-slate-200 md:p-8">
          <h1 className="text-3xl font-black text-slate-900">가이드를 찾을 수 없습니다.</h1>
        </div>
      </main>
    )
  }

  const guides = await getGuidesByKnotType(knotType)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <GuideSliderClient knotType={knotType} guides={guides} />
      </div>
    </main>
  )
}
