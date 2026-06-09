import {
  formatAttendanceDateTime,
  type AttendanceRecord,
} from "@/lib/attendance"

type AttendanceHistoryTableProps = {
  records: AttendanceRecord[]
}

// 날짜별 출퇴근 기록을 관리자 화면에서 확인하는 테이블 컴포넌트입니다.
export default function AttendanceHistoryTable({
  records,
}: AttendanceHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-lg text-slate-500">
        아직 저장된 출퇴근 기록이 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-lg">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-4 font-semibold">번호</th>
              <th className="px-4 py-4 font-semibold">작업자</th>
              <th className="px-4 py-4 font-semibold">구분</th>
              <th className="px-4 py-4 font-semibold">기록 시각</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isClockIn = record.type === "IN"

              return (
                <tr key={record.id} className="border-t border-slate-100 text-slate-800">
                  <td className="px-4 py-4">{record.id}</td>
                  <td className="px-4 py-4 font-semibold">{record.workerName}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1 text-base font-bold text-white ${
                        isClockIn ? "bg-pass" : "bg-fail"
                      }`}
                    >
                      {isClockIn ? "출근" : "퇴근"}
                    </span>
                  </td>
                  <td className="px-4 py-4">{formatAttendanceDateTime(record.timestamp)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
