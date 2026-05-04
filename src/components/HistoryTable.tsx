import type { HistoryItem } from "@/lib/mockHistory";

type HistoryTableProps = {
  items: HistoryItem[];
};

// 최근 검사 기록을 관리자에게 표 형태로 보여주는 컴포넌트입니다.
export default function HistoryTable({ items }: HistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-base font-bold text-slate-700">
            <tr>
              <th className="px-4 py-4">번호</th>
              <th className="px-4 py-4">작업자</th>
              <th className="px-4 py-4">매듭 종류</th>
              <th className="px-4 py-4">결과</th>
              <th className="px-4 py-4">불량 이유</th>
              <th className="px-4 py-4">정확도</th>
              <th className="px-4 py-4">시각</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-base text-slate-700">
            {items.map((item) => {
              const isPass = item.result === "PASS";

              return (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-4 font-semibold">{item.id}</td>
                  <td className="px-4 py-4">{item.worker}</td>
                  <td className="px-4 py-4">{item.knotType}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex min-w-12 justify-center rounded-full px-3 py-1 font-bold text-white ${
                        isPass ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {isPass ? "O" : "X"}
                    </span>
                  </td>
                  <td className="px-4 py-4">{item.reason ?? "-"}</td>
                  <td className="px-4 py-4 font-semibold">{item.accuracy}%</td>
                  <td className="px-4 py-4">{item.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
