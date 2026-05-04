type AccuracyBarProps = {
  accuracy: number;
  result: "PASS" | "FAIL";
};

// 판정 정확도를 한눈에 보여주는 게이지 바 컴포넌트입니다.
export default function AccuracyBar({ accuracy, result }: AccuracyBarProps) {
  const clampedAccuracy = Math.max(0, Math.min(accuracy, 100));
  const barColor = result === "PASS" ? "bg-success" : "bg-danger";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-base font-semibold text-slate-700">
        <span>정확도</span>
        <span>{clampedAccuracy}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${clampedAccuracy}%` }}
        />
      </div>
    </div>
  );
}
