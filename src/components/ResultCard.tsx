import type { KnotResult } from "@/lib/mockAnalyzer";
import AccuracyBar from "./AccuracyBar";

type ResultCardProps = {
  knotType: string;
  resultData: KnotResult;
};

// 검사 결과의 핵심 정보를 카드 형태로 정리해 보여주는 컴포넌트입니다.
export default function ResultCard({ knotType, resultData }: ResultCardProps) {
  const isPass = resultData.result === "PASS";

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-panel sm:p-8">
      <div className="grid gap-5 text-lg text-slate-800">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <span className="font-semibold text-slate-500">매듭 종류</span>
          <span className="text-right font-bold">{knotType}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <span className="font-semibold text-slate-500">판정 결과</span>
          <span className={isPass ? "font-extrabold text-success" : "font-extrabold text-danger"}>
            {isPass ? "합격" : "불합격"}
          </span>
        </div>
        {!isPass && resultData.reason ? (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <span className="shrink-0 font-semibold text-slate-500">불량 이유</span>
            <span className="text-right font-bold text-danger">{resultData.reason}</span>
          </div>
        ) : null}
        <AccuracyBar accuracy={resultData.accuracy} result={resultData.result} />
      </div>
    </div>
  );
}
