import type { HistoryItem } from "@/lib/mockHistory"
import { formatInspectionDateTime } from "@/lib/inspectionRecordsShared"

type HistoryTableProps = {
  history: HistoryItem[]
}

// 최근 검사 이력을 한눈에 볼 수 있는 관리자용 테이블 컴포넌트입니다.
export default function HistoryTable({ history }: HistoryTableProps) {
  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {history.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.05rem] border border-knot-sand bg-white/92 p-5 shadow-card"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-knot-brown">등록 #{item.id}</p>
                <h3 className="mt-1 text-xl font-black text-knot-ink">{item.workerName}</h3>
              </div>
              <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-pass/10 px-3 py-1 text-base font-black text-pass">
                등록 완료
              </span>
            </div>

            <div className="space-y-3 text-base text-knot-ink">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-knot-brown">매듭 종류</span>
                <span className="text-right font-bold">{item.knotType}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-knot-brown">작업자 코드</span>
                <span className="font-black text-knot-ink">{item.workerId}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-knot-brown">등록 시각</span>
                <span className="font-bold text-knot-ink">{formatInspectionDateTime(item.createdAt)}</span>
              </div>
              <div className="rounded-2xl bg-knot-mist px-4 py-3">
                <p className="mb-2 font-semibold text-knot-brown">촬영 이미지</p>
                {item.imageData ? (
                  <img
                    src={item.imageData}
                    alt={`${item.workerName} 촬영 이미지`}
                    className="h-40 w-full rounded-[0.9rem] object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-[0.9rem] bg-white text-center font-medium text-knot-brown">
                    이미지 미리보기 없음
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[1.1rem] border border-knot-sand bg-white/92 shadow-card lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-lg">
            <thead className="bg-knot-mist text-knot-brown">
              <tr>
                <th className="px-5 py-4 font-semibold">번호</th>
                <th className="px-5 py-4 font-semibold">작업자</th>
                <th className="px-5 py-4 font-semibold">매듭 종류</th>
                <th className="px-5 py-4 font-semibold">상태</th>
                <th className="px-5 py-4 font-semibold">촬영 이미지</th>
                <th className="px-5 py-4 font-semibold">등록 시각</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-knot-sand/70 text-knot-ink transition-colors hover:bg-knot-ivory/80"
                >
                  <td className="px-5 py-4 font-semibold">{item.id}</td>
                  <td className="px-5 py-4 font-bold">{item.workerName}</td>
                  <td className="px-5 py-4">{item.knotType}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-pass/10 px-3 py-1 text-base font-black text-pass">
                      등록 완료
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={`${item.workerName} 촬영 이미지`}
                        className="h-16 w-24 rounded-[0.8rem] object-cover"
                      />
                    ) : (
                      <span className="font-semibold text-knot-brown">이미지 없음</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-knot-brown">{formatInspectionDateTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
