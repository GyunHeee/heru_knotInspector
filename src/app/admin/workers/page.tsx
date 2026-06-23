import Link from "next/link"
import WorkersAdminClient from "@/components/WorkersAdminClient"
import { requireAdminSession } from "@/lib/adminGuard"
import { getWorkerProfiles, isWorkerProfilesDbConfigured } from "@/lib/workerProfiles"

export const dynamic = "force-dynamic"

// 작업자 등록과 목록 관리를 담당하는 관리자 화면입니다.
export default async function WorkersAdminPage() {
  requireAdminSession()
  const dbConfigured = isWorkerProfilesDbConfigured()
  const workers = await getWorkerProfiles()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">작업자 프로필 관리</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">작업자 등록 및 조회</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500"
            >
              관리자 홈
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500"
            >
              검사 화면
            </Link>
          </div>
        </div>

        {!dbConfigured ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-lg text-amber-900">
            <p className="font-bold">DB 연결 정보가 아직 없습니다.</p>
            <p className="mt-2">`DATABASE_URL` 또는 `POSTGRES_URL`을 설정하면 작업자 정보를 저장하고 수정할 수 있습니다.</p>
          </section>
        ) : null}

        <WorkersAdminClient initialWorkers={workers} dbConfigured={dbConfigured} />
      </div>
    </main>
  )
}
