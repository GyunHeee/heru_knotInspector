"use client"

import Link from "next/link"
import { useState } from "react"
import KnotTypeBadge from "@/components/KnotTypeBadge"
import WorkerAvatar from "@/components/WorkerAvatar"
import type {
  WorkerKnotType,
  WorkerProfileCreateInput,
  WorkerProfileWithStats,
} from "@/lib/workerProfilesShared"

type WorkersAdminClientProps = {
  initialWorkers: WorkerProfileWithStats[]
  dbConfigured: boolean
}

type WorkerFormState = WorkerProfileCreateInput

const INITIAL_FORM: WorkerFormState = {
  name: "",
  phone: "",
  knotType: "동심결 매듭",
  note: "",
}

// 작업자 등록, 수정, 비활성화를 관리하는 관리자 클라이언트 컴포넌트입니다.
export default function WorkersAdminClient({
  initialWorkers,
  dbConfigured,
}: WorkersAdminClientProps) {
  const [workers, setWorkers] = useState(initialWorkers)
  const [form, setForm] = useState<WorkerFormState>(INITIAL_FORM)
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingWorkerId(null)
  }

  const updateField = <K extends keyof WorkerFormState>(field: K, value: WorkerFormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleEdit = (worker: WorkerProfileWithStats) => {
    setEditingWorkerId(worker.id)
    setForm({
      name: worker.name,
      phone: worker.phone,
      knotType: worker.knotType,
      note: worker.note,
    })
    setMessage(null)
    setErrorMessage(null)
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      const isEditing = editingWorkerId !== null
      const response = await fetch("/api/workers", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isEditing ? { id: editingWorkerId, ...form } : form),
      })

      const payload = (await response.json()) as {
        message?: string
        worker?: WorkerProfileWithStats
      }

      if (!response.ok || !payload.worker) {
        setErrorMessage(payload.message ?? "작업자 저장에 실패했습니다.")
        return
      }

      const nextWorker = payload.worker

      setWorkers((current) => {
        if (isEditing) {
          return current.map((item) => (item.id === nextWorker.id ? nextWorker : item))
        }

        return [nextWorker, ...current]
      })

      setMessage(isEditing ? "작업자 정보가 수정되었습니다." : "작업자가 등록되었습니다.")
      resetForm()
    } catch {
      setErrorMessage("네트워크 오류로 저장에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (worker: WorkerProfileWithStats) => {
    setMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/workers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: worker.id, active: !worker.active }),
      })

      const payload = (await response.json()) as {
        message?: string
        worker?: WorkerProfileWithStats
      }

      if (!response.ok || !payload.worker) {
        setErrorMessage(payload.message ?? "상태 변경에 실패했습니다.")
        return
      }

      const nextWorker = payload.worker

      setWorkers((current) =>
        current.map((item) => (item.id === nextWorker.id ? nextWorker : item)),
      )
      setMessage(nextWorker.active ? "작업자가 다시 활성화되었습니다." : "작업자가 비활성화되었습니다.")
    } catch {
      setErrorMessage("네트워크 오류로 상태 변경에 실패했습니다.")
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-900">
            {editingWorkerId ? "작업자 정보 수정" : "작업자 등록"}
          </h2>
          <p className="mt-2 text-lg text-slate-500">이름, 연락처, 담당 매듭, 특이사항을 관리합니다.</p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-base font-bold text-slate-700">이름</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-slate-900"
              placeholder="작업자 이름"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-base font-bold text-slate-700">연락처</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-slate-900"
              placeholder="010-0000-0000"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-base font-bold text-slate-700">담당 매듭</span>
            <select
              value={form.knotType}
              onChange={(event) => updateField("knotType", event.target.value as WorkerKnotType)}
              className="min-h-14 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-slate-900"
            >
              <option value="동심결 매듭">동심결 매듭</option>
              <option value="매화 매듭">매화 매듭</option>
              <option value="공통">공통</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-base font-bold text-slate-700">특이사항</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-slate-900"
              placeholder="예: 세밀 작업 시 확대경 필요"
            />
          </label>
        </div>

        {message ? <p className="mt-4 text-base font-semibold text-pass">{message}</p> : null}
        {errorMessage ? <p className="mt-4 text-base font-semibold text-fail">{errorMessage}</p> : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => void submitForm()}
            disabled={!dbConfigured || isSubmitting}
            className="min-h-14 flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "저장 중..." : editingWorkerId ? "수정 저장" : "등록하기"}
          </button>
          {editingWorkerId ? (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-14 rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold text-slate-700"
            >
              취소
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        {workers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-lg text-slate-500">
            등록된 작업자가 없습니다.
          </div>
        ) : null}

        {workers.map((worker) => (
          <article key={worker.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <WorkerAvatar name={worker.name} />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900">{worker.name}</h3>
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

              <div className="grid gap-3 text-center sm:grid-cols-2 md:min-w-[240px]">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-500">누적 촬영 등록 수</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{worker.stats.totalProduction}건</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/admin/workers/${worker.id}`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 text-base font-bold text-slate-700"
              >
                상세 보기
              </Link>
              <button
                type="button"
                onClick={() => handleEdit(worker)}
                className="min-h-12 rounded-2xl border border-slate-300 px-4 py-2 text-base font-bold text-slate-700"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => void toggleActive(worker)}
                disabled={!dbConfigured}
                className="min-h-12 rounded-2xl bg-slate-900 px-4 py-2 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {worker.active ? "비활성화" : "다시 활성화"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
