import AccuracyBar from "@/components/AccuracyBar"
import type { KnotResult } from "@/lib/mockAnalyzer"

type ResultCardProps = {
  knotType: string
  result: KnotResult
}

// 매듭 판정 결과와 세부 정보를 따뜻한 정보 카드로 정리해 주는 컴포넌트입니다.
export default function ResultCard({ knotType, result }: ResultCardProps) {
  const isPass = result.result === "PASS"

  return (
    <section className="result-appear w-full rounded-[1.1rem] border border-knot-sand bg-white/92 p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-knot-sand/70 pb-5">
        <div>
          <p className="text-base font-semibold text-knot-brown">판정 결과 카드</p>
          <h2 className="mt-1 text-2xl font-black text-knot-ink">{isPass ? "합격 안내" : "보완이 필요한 부분"}</h2>
        </div>
        <span
          className={`inline-flex rounded-full px-4 py-2 text-base font-black ${
            isPass ? "bg-pass/10 text-pass" : "bg-fail/10 text-fail"
          }`}
        >
          {isPass ? "합격" : "불합격"}
        </span>
      </div>

      <div className="mt-5 space-y-4 text-lg text-knot-ink">
        <div className="flex flex-col gap-2 rounded-2xl bg-knot-mist px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-knot-brown">매듭 종류</span>
          <span className="font-bold">{knotType}</span>
        </div>

        {!isPass && result.reason ? (
          <div className="rounded-2xl border border-fail/15 bg-fail/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-fail text-base font-black text-white">
                !
              </span>
              <div>
                <p className="font-semibold text-fail">불량 이유</p>
                <p className="mt-1 font-bold text-knot-ink">{result.reason}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-pass/15 bg-pass/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-pass text-base font-black text-white">
                ✓
              </span>
              <div>
                <p className="font-semibold text-pass">검사 의견</p>
                <p className="mt-1 font-bold text-knot-ink">기준 범위 안에서 안정적으로 제작되었습니다.</p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-knot-ivory px-4 py-4">
          <AccuracyBar accuracy={result.accuracy} />
        </div>
      </div>
    </section>
  )
}
