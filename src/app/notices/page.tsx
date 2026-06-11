import WorkerNoticesClient from "@/components/WorkerNoticesClient"

export default function NoticesPage({ searchParams }: { searchParams?: { workerId?: string } }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <WorkerNoticesClient initialWorkerId={searchParams?.workerId ?? ""} />
      </div>
    </main>
  )
}
