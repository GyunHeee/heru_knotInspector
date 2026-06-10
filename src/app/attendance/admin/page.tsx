import Link from "next/link"
import AttendanceHistoryTable from "@/components/AttendanceHistoryTable"
import MonthlyAttendanceSummaryTable from "@/components/MonthlyAttendanceSummaryTable"
import { formatWorkMinutes } from "@/lib/attendanceShared"
import { getAttendanceDashboardData } from "@/lib/attendance"

export const dynamic = "force-dynamic"

// 관리자용 출퇴근 현황과 월별 총 근무 시간을 보여주는 화면입니다.
export default async function AttendanceAdminPage() {
  const dashboard = await getAttendanceDashboardData()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">출퇴근 관리자 화면</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
              일별 기록과 월별 근무 현황
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/attendance"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500"
            >
              출퇴근 기록 화면
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:border-slate-500"
            >
              검사 화면
            </Link>
          </div>
        </div>

        {!dashboard.dbConfigured ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-lg text-amber-900">
            <p className="font-bold">Vercel Postgres 연결 정보가 아직 없습니다.</p>
            <p className="mt-2">
              배포 환경 또는 로컬 `.env.local`에 `POSTGRES_URL` 또는 `DATABASE_URL`을 설정하면
              출퇴근 기록이 실제 DB에 저장됩니다.
            </p>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-slate-500">오늘 기록 수</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{dashboard.todayCount}건</p>
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-slate-500">이번 달 총 근무 시간</p>
            <p className="mt-3 text-4xl font-black text-pass">
              {formatWorkMinutes(dashboard.monthlyTotalMinutes)}
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-slate-500">기록된 작업자 수</p>
            <p className="mt-3 text-4xl font-black text-slate-900">
              {dashboard.monthlySummaries.filter((summary) => summary.workDays > 0).length}명
            </p>
          </article>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">월별 근무 시간 합산</h2>
            <p className="text-lg text-slate-500">
              같은 작업자의 출근과 퇴근 기록을 순서대로 짝지어 자동 합산합니다.
            </p>
          </div>
          <MonthlyAttendanceSummaryTable summaries={dashboard.monthlySummaries} />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">날짜별 출퇴근 이력</h2>
            <p className="text-lg text-slate-500">
              최근 저장된 출근/퇴근 기록을 최신순으로 표시합니다.
            </p>
          </div>
          <AttendanceHistoryTable records={dashboard.recentRecords} />
        </section>
      </div>
    </main>
  )
}
