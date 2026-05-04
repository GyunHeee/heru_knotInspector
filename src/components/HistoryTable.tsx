import type { HistoryItem } from "@/lib/mockHistory"

type HistoryTableProps = {
  history: HistoryItem[]
}

// 최근 검사 이력을 한눈에 볼 수 있는 관리자용 테이블 컴포넌트입니다.
export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-4 font-semibold">번호</th>
              <th className="px-4 py-4 font-semibold">작업자</th>
              <th className="px-4 py-4 font-semibold">매듭 종류</th>
              <th className="px-4 py-4 font-semibold">결과</th>
              <th className="px-4 py-4 font-semibold">불량 이유</th>
              <th className="px-4 py-4 font-semibold">정확도</th>
              <th className="px-4 py-4 font-semibold">시각</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => {
              const isPass = item.result === "PASS"

              return (
                <tr key={item.id} className="border-t border-slate-100 text-slate-800">
                  <td className="px-4 py-4">{item.id}</td>
                  <td className="px-4 py-4">{item.worker}</td>
                  <td className="px-4 py-4">{item.knotType}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-base font-bold text-white ${
                        isPass ? "bg-pass" : "bg-fail"
                      }`}
                    >
                      {isPass ? "O" : "X"}
                    </span>
                  </td>
                  <td className="px-4 py-4">{item.reason ?? "-"}</td>
                  <td className="px-4 py-4 font-semibold">{item.accuracy}%</td>
                  <td className="px-4 py-4">{item.inspectedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
