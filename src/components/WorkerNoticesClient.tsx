"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { NoticeListResponse, NoticeSummary } from "@/lib/noticesShared"
import { WORKERS } from "@/lib/workers"

type WorkerNoticesClientProps = {
  initialWorkerId: string
}

// 작업자가 공지 목록을 확인하고 읽지 않은 공지를 구분하는 화면입니다.
export default function WorkerNoticesClient({ initialWorkerId }: WorkerNoticesClientProps) {
  const [workerId, setWorkerId] = useState(initialWorkerId)
  const [notices, setNotices] = useState<NoticeSummary[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbConfigured, setDbConfigured] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadNotices = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const query = workerId ? `?workerId=${encodeURIComponent(workerId)}` : ""
        const response = await fetch(`/api/notices${query}`, { cache: "no-store" })
        const payload = (await response.json()) as Partial<NoticeListResponse> & { error?: string }

        if (!response.ok || !payload.notices) {
          throw new Error(payload.error ?? "공지 목록을 불러오지 못했습니다.")
        }

        if (!ignore) {
          setNotices(payload.notices)
          setUnreadCount(payload.unreadCount ?? 0)
          setDbConfigured(payload.dbConfigured ?? true)
        }
      } catch (loadError) {
        if (!ignore) {
          setNotices([])
          setUnreadCount(0)
          setError(loadError instanceof Error ? loadError.message : "공지 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadNotices()

    return () => {
      ignore = true
    }
  }, [workerId])

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-500">작업자 공지함</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">중요한 공지를 확인하세요</h1>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-lg font-bold text-rose-600">
            읽지 않은 공지 {unreadCount}건
          </div>
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-lg font-bold text-slate-800">작업자 선택</span>
          <select
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option value="">작업자를 선택하세요</option>
            {WORKERS.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </label>

        {!dbConfigured ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
            DATABASE_URL 또는 POSTGRES_URL을 설정하면 공지 저장과 읽음 여부를 사용할 수 있습니다.
          </div>
        ) : null}
        {error ? <p className="mt-4 text-lg font-semibold text-fail">{error}</p> : null}
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-3xl bg-white px-4 py-8 text-center text-lg font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
            공지를 불러오는 중입니다...
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-3xl bg-white px-4 py-8 text-center text-lg text-slate-500 shadow-sm ring-1 ring-slate-200">
            등록된 공지가 없습니다.
          </div>
        ) : (
          notices.map((notice) => (
            <Link
              key={notice.id}
              href={workerId ? `/notices/${notice.id}?workerId=${workerId}` : `/notices/${notice.id}`}
              className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300 md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {!notice.isRead ? <span className="h-3 w-3 rounded-full bg-fail" /> : null}
                    <p className="truncate text-2xl font-black text-slate-900">{notice.title}</p>
                  </div>
                  <p className="mt-3 text-[20px] leading-relaxed text-slate-700">{notice.contentPreview}</p>
                </div>
                <p className="shrink-0 text-base font-semibold text-slate-500">{notice.createdAt}</p>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}
