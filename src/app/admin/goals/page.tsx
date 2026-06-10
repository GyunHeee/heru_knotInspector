import Link from "next/link"
import DailyGoalsAdminClient from "@/components/DailyGoalsAdminClient"
import { getDailyGoalsHistory, getTodayGoalsOverview, isDailyGoalsDbConfigured } from "@/lib/dailyGoals"

export const dynamic = "force-dynamic"

export default async function AdminGoalsPage() {
  const [goals, history] = await Promise.all([getTodayGoalsOverview(), getDailyGoalsHistory(20)])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">관리자 화면</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">오늘 목표 생산량 관리</h1>
          </div>
          <div className="flex flex-wrap gap-3 sm:self-start">
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
              검사 화면으로
            </Link>
          </div>
        </div>

        <DailyGoalsAdminClient
          initialGoals={goals}
          initialHistory={history}
          dbConfigured={isDailyGoalsDbConfigured()}
        />
      </div>
    </main>
  )
}
