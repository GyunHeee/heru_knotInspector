"use client"

import { useState, type FormEvent } from "react"
import type { NoticeSummary } from "@/lib/noticesShared"

type AdminNoticesClientProps = {
  initialNotices: NoticeSummary[]
  dbConfigured: boolean
}

// 관리자가 공지를 작성하고 최근 등록 공지를 확인하는 화면입니다.
export default function AdminNoticesClient({ initialNotices, dbConfigured }: AdminNoticesClientProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [notices, setNotices] = useState(initialNotices)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      const payload = (await response.json()) as { error?: string; notice?: NoticeSummary }

      if (!response.ok || !payload.notice) {
        throw new Error(payload.error ?? "공지 등록 중 오류가 발생했습니다.")
      }

      const nextNotice = payload.notice

      setNotices((current) => [nextNotice, ...current])
      setTitle("")
      setContent("")
      setMessage("공지가 등록되었습니다.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "공지 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 md:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black leading-tight text-slate-900">공지 작성</h2>
          <p className="text-lg leading-relaxed text-slate-500">작성한 공지는 작업자 공지 화면에 바로 표시됩니다.</p>
        </div>

        {!dbConfigured ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
            DATABASE_URL 또는 POSTGRES_URL을 설정하면 공지 저장과 읽음 기록을 사용할 수 있습니다.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-lg font-bold text-slate-800">공지 제목</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 오늘 2시 안전교육이 있습니다"
              className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-lg font-bold text-slate-800">공지 본문</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="작업자에게 꼭 전달할 내용을 크게 적어주세요."
              rows={6}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[20px] text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>

          {message ? <p className="text-lg font-semibold text-pass">{message}</p> : null}
          {error ? <p className="text-lg font-semibold text-fail">{error}</p> : null}

          <button
            type="submit"
            disabled={!dbConfigured || isSaving}
            className="min-h-14 w-full rounded-2xl bg-slate-900 px-6 py-3 text-lg font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto"
          >
            {isSaving ? "등록 중..." : "공지 등록"}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 md:p-6">
        <div>
          <h2 className="text-2xl font-black leading-tight text-slate-900">최근 공지</h2>
          <p className="text-lg leading-relaxed text-slate-500">최근 등록된 공지를 최신순으로 확인합니다.</p>
        </div>

        <div className="space-y-3">
          {notices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-lg text-slate-500">
              등록된 공지가 없습니다.
            </div>
          ) : (
            notices.map((notice) => (
              <article key={notice.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-black leading-snug text-slate-900">{notice.title}</p>
                    <p className="mt-2 text-lg leading-relaxed text-slate-600">{notice.contentPreview}</p>
                  </div>
                  <p className="shrink-0 text-base font-semibold text-slate-500 sm:pt-1">{notice.createdAt}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
