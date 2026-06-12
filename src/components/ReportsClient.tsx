"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { ReportItem, ReportType } from "@/lib/reportsShared"
import { REPORT_TYPE_OPTIONS } from "@/lib/reportsShared"
import { WORKERS } from "@/lib/workers"

// 작업자가 큰 버튼으로 간단히 신고를 접수하는 화면입니다.
export default function ReportsClient() {
  const [workerId, setWorkerId] = useState("")
  const [isSubmittingType, setIsSubmittingType] = useState<ReportType | null>(null)
  const [submittedReport, setSubmittedReport] = useState<ReportItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedWorkerName = useMemo(
    () => WORKERS.find((worker) => worker.id === workerId)?.name ?? "",
    [workerId],
  )

  const handleReport = async (type: ReportType) => {
    if (!workerId) {
      setError("작업자를 먼저 선택해주세요.")
      return
    }

    setIsSubmittingType(type)
    setError(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, type }),
      })

      const payload = (await response.json()) as { error?: string; report?: ReportItem }

      if (!response.ok || !payload.report) {
        throw new Error(payload.error ?? "신고 접수 중 오류가 발생했습니다.")
      }

      setSubmittedReport(payload.report)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "신고 접수 중 오류가 발생했습니다.")
    } finally {
      setIsSubmittingType(null)
    }
  }

  if (submittedReport) {
    return (
      <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl font-black text-pass">
            O
          </div>
          <h1 className="mt-6 text-4xl font-black text-slate-900">접수되었습니다</h1>
          <p className="mt-4 text-xl leading-relaxed text-slate-600">
            {submittedReport.workerName} 작업자의 <span className="font-bold text-slate-900">{submittedReport.typeLabel}</span> 신고가 관리자에게 전달되었습니다.
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-500">접수 시각 {submittedReport.createdAt}</p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmittedReport(null)
                setError(null)
              }}
              className="min-h-16 rounded-2xl bg-slate-900 px-6 py-4 text-xl font-bold text-white transition hover:bg-slate-700"
            >
              다른 신고 하기
            </button>
            <Link
              href="/"
              className="inline-flex min-h-16 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xl font-bold text-slate-800 transition hover:border-slate-900"
            >
              검사 화면으로
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
      <header className="space-y-3">
        <p className="text-lg font-semibold text-slate-500">작업자 신고</p>
        <h1 className="text-3xl font-black text-slate-900 md:text-4xl">도움이 필요하면 바로 알려주세요</h1>
        <p className="text-xl leading-relaxed text-slate-600">타이핑 없이 큰 버튼 하나만 누르면 신고가 접수됩니다.</p>
      </header>

      <label className="mt-6 block space-y-3">
        <span className="block text-lg font-bold text-slate-800">작업자 이름</span>
        <select
          value={workerId}
          onChange={(event) => setWorkerId(event.target.value)}
          className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-slate-900 sm:text-xl"
        >
          <option value="">작업자를 선택하세요</option>
          {WORKERS.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </label>

      {selectedWorkerName ? (
        <p className="mt-4 text-lg font-semibold text-slate-500">현재 선택: {selectedWorkerName}</p>
      ) : null}
      {error ? <p className="mt-4 text-lg font-semibold text-fail">{error}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {REPORT_TYPE_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => void handleReport(option.type)}
            disabled={!workerId || isSubmittingType !== null}
            className="flex min-h-20 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-left transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${option.accentClass}`}>
              {option.iconText}
            </span>
            <span className="text-2xl font-black text-slate-900">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <Link href="/" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
          검사 화면으로
        </Link>
        <Link href="/admin/reports" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
          관리자
        </Link>
      </div>
    </section>
  )
}
