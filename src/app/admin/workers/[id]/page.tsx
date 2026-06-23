import Link from "next/link"
import { notFound } from "next/navigation"
import KnotTypeBadge from "@/components/KnotTypeBadge"
import WorkerAvatar from "@/components/WorkerAvatar"
import { requireAdminSession } from "@/lib/adminGuard"
import { getWorkerProfileById } from "@/lib/workerProfiles"

type WorkerDetailPageProps = {
  params: {
    id: string
  }
}

// 작업자 상세 정보와 누적 생산 통계를 보여주는 화면입니다.
export default async function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  requireAdminSession()
  const worker = await getWorkerProfileById(params.id)

  if (!worker) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">작업자 상세</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{worker.name} 프로필</h1>
          </div>
          <Link
            href="/admin/workers"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500"
          >
            작업자 목록으로
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <WorkerAvatar name={worker.name} />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900">{worker.name}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                    {worker.id}
                  </span>
                  <KnotTypeBadge knotType={worker.knotType} />
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      worker.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {worker.active ? "활성" : "비활성"}
                  </span>
                </div>
                <p className="text-lg text-slate-600">연락처 {worker.phone}</p>
                <p className="text-lg text-slate-600">특이사항 {worker.note || "없음"}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:min-w-[320px]">
              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
                <p className="text-base font-semibold text-slate-500">누적 촬영 등록 수</p>
                <p className="mt-2 text-4xl font-black text-slate-900">{worker.stats.totalProduction}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
