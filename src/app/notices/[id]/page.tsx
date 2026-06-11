import NoticeDetailClient from "@/components/NoticeDetailClient"

export default function NoticeDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { workerId?: string }
}) {
  const noticeId = Number.parseInt(params.id, 10)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <NoticeDetailClient noticeId={Number.isFinite(noticeId) ? noticeId : -1} initialWorkerId={searchParams?.workerId ?? ""} />
      </div>
    </main>
  )
}
