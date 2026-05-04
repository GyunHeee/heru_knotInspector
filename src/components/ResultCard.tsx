import AccuracyBar from "@/components/AccuracyBar"
import type { KnotResult } from "@/lib/mockAnalyzer"

type ResultCardProps = {
  knotType: string
  result: KnotResult
}

// 매듭 판정 결과와 세부 정보를 카드로 정리해 주는 컴포넌트입니다.
export default function ResultCard({ knotType, result }: ResultCardProps) {
  const isPass = result.result === "PASS"

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="space-y-4 text-lg text-slate-800">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-slate-500">매듭 종류</span>
          <span className="text-right font-bold">{knotType}</span>
        </div>
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-slate-500">판정 결과</span>
          <span className={isPass ? "font-bold text-pass" : "font-bold text-fail"}>
            {isPass ? "합격" : "불합격"}
          </span>
        </div>
        {!isPass && result.reason ? (
          <div className="border-b border-slate-100 pb-4">
            <p className="mb-2 font-semibold text-slate-500">불량 이유</p>
            <p className="font-bold text-slate-900">{result.reason}</p>
          </div>
        ) : null}
        <AccuracyBar accuracy={result.accuracy} />
      </div>
    </section>
  )
}
