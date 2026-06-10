import { formatWorkMinutes, type MonthlyWorkerSummary } from "@/lib/attendanceShared"

type MonthlyAttendanceSummaryTableProps = {
  summaries: MonthlyWorkerSummary[]
}

// 월별 총 근무 시간을 작업자별로 보여주는 관리자용 요약 테이블입니다.
export default function MonthlyAttendanceSummaryTable({
  summaries,
}: MonthlyAttendanceSummaryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-4 font-semibold">작업자</th>
              <th className="px-4 py-4 font-semibold">근무 일수</th>
              <th className="px-4 py-4 font-semibold">월 총 근무 시간</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.workerId} className="border-t border-slate-100 text-slate-800">
                <td className="px-4 py-4 font-semibold">{summary.workerName}</td>
                <td className="px-4 py-4">{summary.workDays}일</td>
                <td className="px-4 py-4 font-bold">{formatWorkMinutes(summary.totalMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
