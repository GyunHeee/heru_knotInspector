import Link from "next/link";
import HistoryTable from "@/components/HistoryTable";
import { MOCK_HISTORY } from "@/lib/mockHistory";

function getSummary() {
  const totalCount = MOCK_HISTORY.length;
  const passCount = MOCK_HISTORY.filter((item) => item.result === "PASS").length;
  const averageAccuracy =
    MOCK_HISTORY.reduce((sum, item) => sum + item.accuracy, 0) / totalCount;

  return {
    totalCount,
    passRate: Math.round((passCount / totalCount) * 100),
    averageAccuracy: Math.round(averageAccuracy),
  };
}

// 관리자에게 일별 요약과 최근 검사 이력을 보여주는 화면입니다.
export default function AdminPage() {
  const summary = getSummary();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-white/85 p-5 shadow-panel backdrop-blur sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-sky-700">관리자 대시보드</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              오늘 검사 현황
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          >
            검사 화면
          </Link>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-panel">
            <p className="text-base font-semibold text-slate-300">오늘 총 검사 수</p>
            <p className="mt-3 text-4xl font-black">{summary.totalCount}건</p>
          </div>
          <div className="rounded-3xl bg-success p-6 text-white shadow-panel">
            <p className="text-base font-semibold text-green-100">합격률</p>
            <p className="mt-3 text-4xl font-black">{summary.passRate}%</p>
          </div>
          <div className="rounded-3xl bg-sky-600 p-6 text-white shadow-panel">
            <p className="text-base font-semibold text-sky-100">평균 정확도</p>
            <p className="mt-3 text-4xl font-black">{summary.averageAccuracy}%</p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">최근 검사 이력</h2>
            <p className="mt-1 text-base text-slate-500">최근 10건의 검사 결과입니다.</p>
          </div>
          <HistoryTable items={MOCK_HISTORY} />
        </section>
      </div>
    </main>
  );
}
