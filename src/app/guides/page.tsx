import { cookies } from "next/headers"
import Link from "next/link"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "@/lib/adminAuth"
import { GUIDE_KNOT_TYPES } from "@/lib/guidesShared"

export default function GuidesPage() {
  const cookieStore = cookies()
  const isAdminAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
        <header className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
          <p className="text-lg font-semibold text-slate-500">매듭 제작 가이드</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">필요한 매듭 방법을 바로 확인하세요</h1>
          <p className="mt-3 text-xl leading-relaxed text-slate-600">작업 중 헷갈리는 단계가 있으면 큰 사진과 단계 설명으로 다시 확인할 수 있습니다.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {GUIDE_KNOT_TYPES.map((item) => (
            <Link
              key={item.knotType}
              href={`/guide/${encodeURIComponent(item.knotType)}`}
              className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 transition hover:ring-slate-300 md:p-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-3xl font-black text-white">
                {item.slug === "dongsim" ? "동" : "매"}
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900">{item.knotType}</h2>
              <p className="mt-3 text-xl leading-relaxed text-slate-600">{item.subtitle}</p>
            </Link>
          ))}
        </section>

        <div className="flex flex-wrap justify-end gap-4">
          <Link href="/" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            검사 화면으로
          </Link>
          {isAdminAuthenticated ? (
            <Link href="/admin/guides" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
              관리자
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  )
}
