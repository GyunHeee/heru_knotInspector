import Link from "next/link"
import HistoryTable from "@/components/HistoryTable"
import { getHistorySummary, MOCK_HISTORY } from "@/lib/mockHistory"

export default function AdminPage() {
  const summary = getHistorySummary(MOCK_HISTORY)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">관리자 화면</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">오늘의 검사 현황</h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500 sm:self-start"
          >
            검사 화면으로
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <p className="text-lg font-semibold text-slate-500">오늘 총 검사 수</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalCount}건</p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
            <p className="text-lg font-semibold text-slate-500">합격률</p>
            <p className="mt-3 text-4xl font-black text-pass">{summary.passRate}%</p>
          </article>
          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6 sm:col-span-2 xl:col-span-1">
            <p className="text-lg font-semibold text-slate-500">평균 정확도</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{summary.averageAccuracy}%</p>
          </article>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">최근 검사 이력</h2>
            <p className="text-lg text-slate-500">오늘 진행된 최근 10건의 검사 결과입니다.</p>
          </div>
          <HistoryTable history={MOCK_HISTORY} />
        </section>
      </div>
    </main>
  )
}
