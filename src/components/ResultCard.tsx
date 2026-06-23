import { formatInspectionDateTime } from "@/lib/inspectionRecordsShared"

type ResultCardProps = {
  workerName: string
  knotType: string
  submittedAt: string
}

// 매듭 촬영 등록 완료 정보와 세부 내용을 따뜻한 정보 카드로 정리해 주는 컴포넌트입니다.
export default function ResultCard({ workerName, knotType, submittedAt }: ResultCardProps) {
  return (
    <section className="result-appear w-full rounded-[1.1rem] border border-knot-sand bg-white/92 p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-knot-sand/70 pb-5">
        <div>
          <p className="text-base font-semibold text-knot-brown">촬영 등록 카드</p>
          <h2 className="mt-1 text-2xl font-black text-knot-ink">관리자 확인용으로 등록되었습니다</h2>
        </div>
        <span className="inline-flex rounded-full bg-pass/10 px-4 py-2 text-base font-black text-pass">
          등록 완료
        </span>
      </div>

      <div className="mt-5 space-y-4 text-lg text-knot-ink">
        <div className="flex flex-col gap-2 rounded-2xl bg-knot-mist px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-knot-brown">작업자</span>
          <span className="font-bold">{workerName}</span>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-knot-mist px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-knot-brown">매듭 종류</span>
          <span className="font-bold">{knotType}</span>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-knot-mist px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-knot-brown">등록 시각</span>
          <span className="font-bold">{formatInspectionDateTime(submittedAt)}</span>
        </div>

        <div className="rounded-2xl border border-pass/15 bg-pass/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-pass text-base font-black text-white">
              ✓
            </span>
            <div>
              <p className="font-semibold text-pass">등록 안내</p>
              <p className="mt-1 font-bold text-knot-ink">촬영한 매듭 사진이 관리자 화면의 등록 이력에 반영되었습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
