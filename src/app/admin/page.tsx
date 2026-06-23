import Link from "next/link"
import AdminLogoutButton from "@/components/AdminLogoutButton"
import HistoryTable from "@/components/HistoryTable"
import ResponsiveMenu from "@/components/ResponsiveMenu"
import { requireAdminSession } from "@/lib/adminGuard"
import { getHistorySummary, MOCK_HISTORY } from "@/lib/mockHistory"

const SUMMARY_CARDS = [
  { key: "total", label: "오늘 총 검사 수", icon: "◎", trend: "작업 흐름 안정", valueSuffix: "건" },
  { key: "passRate", label: "합격률", icon: "↗", trend: "기준 대비 양호", valueSuffix: "%" },
  { key: "averageAccuracy", label: "평균 정확도", icon: "◌", trend: "판정 신뢰도", valueSuffix: "%" },
] as const

export default function AdminPage() {
  requireAdminSession()
  const summary = getHistorySummary(MOCK_HISTORY)
  const adminLinks = [
    { href: "/admin/workers", label: "작업자 관리" },
    { href: "/admin/goals", label: "목표 관리" },
    { href: "/admin/notices", label: "공지 관리" },
    { href: "/admin/reports", label: "신고 관리" },
    { href: "/admin/guides", label: "가이드 관리" },
    { href: "/", label: "검사 화면으로" },
  ]
  const values = {
    total: summary.totalCount,
    passRate: summary.passRate,
    averageAccuracy: summary.averageAccuracy,
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <section className="knot-panel overflow-hidden rounded-[1.2rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full bg-knot-red/10 px-4 py-2 text-sm font-bold text-knot-red">
                관리자 대시보드
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-knot-ink md:text-5xl">오늘의 검사 현황</h1>
              <p className="mt-3 text-lg text-knot-brown">
                최근 검사 흐름과 합격 추이를 한 화면에서 확인하고, 작업자와 공정 상태를 빠르게 점검할 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end gap-3 md:hidden">
              <ResponsiveMenu links={adminLinks} title="관리자 메뉴" />
              <AdminLogoutButton />
            </div>

            <div className="hidden flex-wrap gap-3 md:flex lg:max-w-xl lg:justify-end">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="soft-press inline-flex min-h-14 items-center justify-center rounded-[0.95rem] border border-knot-sand bg-white/90 px-5 py-3 text-base font-bold text-knot-ink hover:border-knot-red/40 hover:bg-knot-ivory"
                >
                  {link.label}
                </Link>
              ))}
              <AdminLogoutButton />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.key} className="rounded-[1.05rem] border border-knot-sand bg-white/92 p-5 shadow-card md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-knot-brown">{card.label}</p>
                  <p className="mt-3 text-4xl font-black text-knot-ink">
                    {values[card.key]}
                    {card.valueSuffix}
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-knot-mist text-2xl font-black text-knot-red">
                  {card.icon}
                </span>
              </div>
              <div className="mt-4 inline-flex rounded-full bg-knot-paper px-3 py-1 text-sm font-semibold text-knot-brown">
                {card.trend}
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-knot-ink">최근 검사 이력</h2>
              <p className="text-lg text-knot-brown">오늘 진행된 최근 10건의 검사 결과를 시간 순으로 정리했습니다.</p>
            </div>
            <div className="inline-flex rounded-full bg-knot-paper px-4 py-2 text-sm font-semibold text-knot-brown">
              실시간 보고용 요약 표
            </div>
          </div>
          <HistoryTable history={MOCK_HISTORY} />
        </section>
      </div>
    </main>
  )
}
