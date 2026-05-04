type AccuracyBarProps = {
  accuracy: number
}

// 판정 정확도를 큰 게이지 바로 보여주는 컴포넌트입니다.
export default function AccuracyBar({ accuracy }: AccuracyBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-lg font-semibold text-slate-700">
        <span>정확도</span>
        <span>{accuracy}%</span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-700 transition-all duration-500"
          style={{ width: `${accuracy}%` }}
        />
      </div>
    </div>
  )
}
