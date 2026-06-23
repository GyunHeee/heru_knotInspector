"use client"

import { useMemo, useState } from "react"
import type { ReportItem } from "@/lib/reportsShared"

type AdminReportsClientProps = {
  initialReports: ReportItem[]
  dbConfigured: boolean
}

// 관리자가 신고 목록을 확인하고 처리 상태를 변경하는 화면입니다.
export default function AdminReportsClient({ initialReports, dbConfigured }: AdminReportsClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const summary = useMemo(() => {
    const pendingCount = reports.filter((report) => report.status === "PENDING").length
    const doneCount = reports.filter((report) => report.status === "DONE").length

    return {
      totalCount: reports.length,
      pendingCount,
      doneCount,
    }
  }, [reports])

  const handleMarkDone = async (reportId: number) => {
    setUpdatingId(reportId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      })

      const payload = (await response.json()) as { error?: string; report?: ReportItem }

      if (!response.ok || !payload.report) {
        throw new Error(payload.error ?? "처리 상태 변경 중 오류가 발생했습니다.")
      }

      const nextReport = payload.report
      setReports((current) => current.map((report) => (report.id === reportId ? nextReport : report)))
      setMessage(`${nextReport.workerName} 작업자의 신고를 처리완료로 변경했습니다.`)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "처리 상태 변경 중 오류가 발생했습니다.")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">총 신고 수</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalCount}건</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">미처리</p>
          <p className="mt-3 text-4xl font-black text-fail">{summary.pendingCount}건</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">처리완료</p>
          <p className="mt-3 text-4xl font-black text-pass">{summary.doneCount}건</p>
        </article>
      </section>

      {!dbConfigured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
          DATABASE_URL 또는 POSTGRES_URL을 설정하면 신고 접수와 상태 관리 기능을 사용할 수 있습니다.
        </div>
      ) : null}
      {message ? <p className="text-lg font-semibold text-pass">{message}</p> : null}
      {error ? <p className="text-lg font-semibold text-fail">{error}</p> : null}

      <section className="space-y-4 md:hidden">
        {reports.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-8 text-center text-lg text-slate-500 shadow-sm">
            접수된 신고가 없습니다.
          </div>
        ) : (
          reports.map((report) => (
            <article key={report.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">신고 #{report.id}</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">{report.workerName}</h2>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-base font-bold ${
                    report.status === "DONE" ? "bg-emerald-100 text-pass" : "bg-rose-100 text-fail"
                  }`}
                >
                  {report.statusLabel}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-lg text-slate-700">
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-500">신고 유형</span>
                  <span className="text-right font-bold text-slate-900">{report.typeLabel}</span>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-500">접수 시각</span>
                  <span className="text-right font-bold text-slate-900">{report.createdAt}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleMarkDone(report.id)}
                disabled={!dbConfigured || report.status === "DONE" || updatingId === report.id}
                className="mt-4 min-h-14 w-full rounded-2xl bg-slate-900 px-4 py-3 text-lg font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {report.status === "DONE" ? "처리완료" : updatingId === report.id ? "변경 중..." : "처리 완료"}
              </button>
            </article>
          ))
        )}
      </section>

      <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-100 text-base font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3">번호</th>
                <th className="px-4 py-3">작업자</th>
                <th className="px-4 py-3">신고 유형</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">접수 시각</th>
                <th className="px-4 py-3">처리</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-lg text-slate-500">
                    접수된 신고가 없습니다.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-200 text-lg text-slate-700">
                    <td className="px-4 py-4 font-semibold text-slate-900">{report.id}</td>
                    <td className="px-4 py-4">{report.workerName}</td>
                    <td className="px-4 py-4">{report.typeLabel}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-base font-bold ${
                          report.status === "DONE" ? "bg-emerald-100 text-pass" : "bg-rose-100 text-fail"
                        }`}
                      >
                        {report.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">{report.createdAt}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void handleMarkDone(report.id)}
                        disabled={!dbConfigured || report.status === "DONE" || updatingId === report.id}
                        className="min-h-12 rounded-2xl bg-slate-900 px-4 py-2 text-base font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        {report.status === "DONE" ? "처리완료" : updatingId === report.id ? "변경 중..." : "처리 완료"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
