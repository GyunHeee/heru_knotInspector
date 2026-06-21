import type { HistoryItem } from "@/lib/mockHistory"

type HistoryTableProps = {
  history: HistoryItem[]
}

// 최근 검사 이력을 한눈에 볼 수 있는 관리자용 테이블 컴포넌트입니다.
export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {history.map((item) => {
          const isPass = item.result === "PASS"

          return (
            <article
              key={item.id}
              className="rounded-[1.05rem] border border-knot-sand bg-white/92 p-5 shadow-card"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-knot-brown">검사 #{item.id}</p>
                  <h3 className="mt-1 text-xl font-black text-knot-ink">{item.worker}</h3>
                </div>
                <span
                  className={`inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-base font-black ${
                    isPass ? "bg-pass/10 text-pass" : "bg-fail/10 text-fail"
                  }`}
                >
                  {isPass ? "합격" : "불합격"}
                </span>
              </div>

              <div className="space-y-3 text-base text-knot-ink">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-knot-brown">매듭 종류</span>
                  <span className="text-right font-bold">{item.knotType}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-knot-brown">정확도</span>
                  <span className="font-black text-knot-ink">{item.accuracy}%</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-knot-brown">시각</span>
                  <span className="font-bold text-knot-ink">{item.inspectedAt}</span>
                </div>
                <div className="rounded-2xl bg-knot-mist px-4 py-3">
                  <p className="mb-1 font-semibold text-knot-brown">불량 이유</p>
                  <p className="font-medium text-knot-ink">{item.reason ?? "이상 없음"}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-[1.1rem] border border-knot-sand bg-white/92 shadow-card lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-lg">
            <thead className="bg-knot-mist text-knot-brown">
              <tr>
                <th className="px-5 py-4 font-semibold">번호</th>
                <th className="px-5 py-4 font-semibold">작업자</th>
                <th className="px-5 py-4 font-semibold">매듭 종류</th>
                <th className="px-5 py-4 font-semibold">결과</th>
                <th className="px-5 py-4 font-semibold">불량 이유</th>
                <th className="px-5 py-4 font-semibold">정확도</th>
                <th className="px-5 py-4 font-semibold">시각</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const isPass = item.result === "PASS"

                return (
                  <tr
                    key={item.id}
                    className="border-t border-knot-sand/70 text-knot-ink transition-colors hover:bg-knot-ivory/80"
                  >
                    <td className="px-5 py-4 font-semibold">{item.id}</td>
                    <td className="px-5 py-4 font-bold">{item.worker}</td>
                    <td className="px-5 py-4">{item.knotType}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-base font-black ${
                          isPass ? "bg-pass/10 text-pass" : "bg-fail/10 text-fail"
                        }`}
                      >
                        {isPass ? "O 합격" : "X 불합격"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-knot-brown">{item.reason ?? "-"}</td>
                    <td className="px-5 py-4 text-xl font-black">{item.accuracy}%</td>
                    <td className="px-5 py-4 font-semibold text-knot-brown">{item.inspectedAt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
