"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  formatAttendanceDateTime,
  type AttendanceRecord,
  type AttendanceType,
} from "@/lib/attendanceShared"
import { WORKERS, getWorkerById } from "@/lib/workers"

// 작업자가 큰 버튼으로 출근과 퇴근을 남기는 출퇴근 메인 화면입니다.
export default function AttendancePage() {
  const [workerId, setWorkerId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [savedRecord, setSavedRecord] = useState<AttendanceRecord | null>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  const selectedWorker = getWorkerById(workerId)

  useEffect(() => {
    let ignore = false

    const loadAdminSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" })
        const payload = (await response.json()) as { isAuthenticated?: boolean }

        if (!ignore) {
          setIsAdminAuthenticated(payload.isAuthenticated === true)
        }
      } catch {
        if (!ignore) {
          setIsAdminAuthenticated(false)
        }
      }
    }

    void loadAdminSession()

    return () => {
      ignore = true
    }
  }, [])

  const submitAttendance = async (type: AttendanceType) => {
    if (!workerId) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workerId, type }),
      })

      const payload = (await response.json()) as {
        message?: string
        record?: AttendanceRecord
      }

      if (!response.ok || !payload.record) {
        setSavedRecord(null)
        setErrorMessage(payload.message ?? "기록 저장에 실패했습니다.")
        return
      }

      setSavedRecord(payload.record)
      setMessage(type === "IN" ? "출근이 기록되었습니다." : "퇴근이 기록되었습니다.")
    } catch {
      setSavedRecord(null)
      setErrorMessage("네트워크 오류로 기록 저장에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-10">
        <header className="space-y-3">
          <p className="text-lg font-semibold text-slate-500">출퇴근 기록</p>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
            큰 버튼 한 번으로 출근과 퇴근을 남기세요
          </h1>
        </header>

        <label className="space-y-3">
          <span className="block text-xl font-bold text-slate-800">작업자 선택</span>
          <select
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-xl text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option value="">작업자를 선택하세요</option>
            {WORKERS.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name} ({worker.id})
              </option>
            ))}
          </select>
        </label>

        {selectedWorker ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg text-slate-700">
            <p className="font-bold text-slate-900">{selectedWorker.name}</p>
            <p>{selectedWorker.scoreReference}</p>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            disabled={!workerId || isSubmitting}
            onClick={() => void submitAttendance("IN")}
            className="min-h-24 rounded-3xl bg-pass px-6 py-5 text-3xl font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "기록 중..." : "출근"}
          </button>
          <button
            type="button"
            disabled={!workerId || isSubmitting}
            onClick={() => void submitAttendance("OUT")}
            className="min-h-24 rounded-3xl bg-fail px-6 py-5 text-3xl font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "기록 중..." : "퇴근"}
          </button>
        </section>

        {message ? (
          <section className="rounded-3xl border border-green-200 bg-green-50 px-5 py-4 text-lg text-green-900">
            <p className="font-bold">{message}</p>
            {savedRecord ? (
              <p className="mt-2">
                {savedRecord.workerName} / {savedRecord.type === "IN" ? "출근" : "퇴근"} / {" "}
                {formatAttendanceDateTime(savedRecord.timestamp)}
              </p>
            ) : null}
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-lg text-red-900">
            <p className="font-bold">{errorMessage}</p>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 text-lg text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>버튼을 누르면 서버 시각 기준으로 기록됩니다.</p>
          <div className="flex gap-4">
            {isAdminAuthenticated ? (
              <Link href="/attendance/admin" className="font-semibold text-slate-700 underline-offset-4 hover:underline">
                출퇴근 관리자
              </Link>
            ) : null}
            <Link href="/" className="font-semibold text-slate-700 underline-offset-4 hover:underline">
              검사 화면
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
