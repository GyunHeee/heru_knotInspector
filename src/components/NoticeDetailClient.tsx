"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { NoticeDetailResponse } from "@/lib/noticesShared"
import type { WorkerProfileWithStats } from "@/lib/workerProfilesShared"
import { WORKERS } from "@/lib/workers"

type NoticeDetailClientProps = {
  noticeId: number
  initialWorkerId: string
}

// 작업자가 공지 상세를 읽고 자동으로 읽음 처리를 남기는 화면입니다.
export default function NoticeDetailClient({ noticeId, initialWorkerId }: NoticeDetailClientProps) {
  const [workerId, setWorkerId] = useState(initialWorkerId)
  const [workerOptions, setWorkerOptions] = useState(WORKERS)
  const [notice, setNotice] = useState<NoticeDetailResponse["notice"]>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbConfigured, setDbConfigured] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadWorkers = async () => {
      try {
        const response = await fetch("/api/workers", { cache: "no-store" })
        const payload = (await response.json()) as {
          workers?: WorkerProfileWithStats[]
        }

        if (!response.ok) {
          throw new Error("작업자 목록을 불러오지 못했습니다.")
        }

        const activeWorkers =
          payload.workers
            ?.filter((worker) => worker.active)
            .map((worker) => ({
              id: worker.id,
              name: worker.name,
              scoreReference: `${worker.knotType} 담당`,
            })) ?? []

        if (!ignore && activeWorkers.length > 0) {
          setWorkerOptions(activeWorkers)
        }
      } catch {
        if (!ignore) {
          setWorkerOptions(WORKERS)
        }
      }
    }

    void loadWorkers()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadNotice = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ noticeId: String(noticeId) })

        if (workerId) {
          params.set("workerId", workerId)
        }

        const response = await fetch(`/api/notices?${params.toString()}`, { cache: "no-store" })
        const payload = (await response.json()) as NoticeDetailResponse & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? "공지 상세를 불러오지 못했습니다.")
        }

        let nextNotice = payload.notice

        if (workerId && nextNotice && !nextNotice.isRead) {
          const readResponse = await fetch(`/api/notices/${noticeId}/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId }),
          })

          const readPayload = (await readResponse.json()) as { error?: string; notice?: NoticeDetailResponse["notice"] }

          if (!readResponse.ok) {
            throw new Error(readPayload.error ?? "읽음 처리 중 오류가 발생했습니다.")
          }

          nextNotice = readPayload.notice ?? nextNotice
        }

        if (!ignore) {
          setNotice(nextNotice)
          setUnreadCount(workerId ? Math.max(0, (payload.unreadCount ?? 0) - (payload.notice && !payload.notice.isRead ? 1 : 0)) : 0)
          setDbConfigured(payload.dbConfigured)
        }
      } catch (loadError) {
        if (!ignore) {
          setNotice(null)
          setError(loadError instanceof Error ? loadError.message : "공지 상세를 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadNotice()

    return () => {
      ignore = true
    }
  }, [noticeId, workerId])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={workerId ? `/notices?workerId=${workerId}` : "/notices"} className="text-lg font-bold text-slate-500 hover:underline">
          공지 목록으로
        </Link>
        <div className="rounded-2xl bg-rose-50 px-4 py-2 text-base font-bold text-rose-600">남은 미읽음 {unreadCount}건</div>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <label className="block space-y-2">
          <span className="text-lg font-bold text-slate-800">작업자 선택</span>
          <select
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option value="">작업자를 선택하세요</option>
            {workerOptions.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </label>

        {!dbConfigured ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
            DATABASE_URL 또는 POSTGRES_URL을 설정하면 공지 읽음 여부를 사용할 수 있습니다.
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <section className="rounded-3xl bg-white px-4 py-10 text-center text-lg font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
          공지 내용을 불러오는 중입니다...
        </section>
      ) : error ? (
        <section className="rounded-3xl bg-white px-4 py-10 text-center text-lg font-semibold text-fail shadow-sm ring-1 ring-slate-200">
          {error}
        </section>
      ) : !notice ? (
        <section className="rounded-3xl bg-white px-4 py-10 text-center text-lg text-slate-500 shadow-sm ring-1 ring-slate-200">
          공지를 찾을 수 없습니다.
        </section>
      ) : (
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                {!notice.isRead ? <span className="h-3 w-3 rounded-full bg-fail" /> : null}
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{notice.title}</h1>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-500">등록 시각 {notice.createdAt}</p>
            </div>
            <div className="rounded-full px-4 py-2 text-base font-bold text-slate-700 ring-1 ring-slate-200">
              {notice.isRead ? `읽음 ${notice.readAt ?? "완료"}` : "읽지 않음"}
            </div>
          </div>

          <div className="mt-8 whitespace-pre-wrap text-[20px] leading-[1.9] text-slate-800">{notice.content}</div>
        </article>
      )}
    </div>
  )
}
