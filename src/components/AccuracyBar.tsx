type AccuracyBarProps = {
  accuracy: number
}

// 판정 정확도를 부드러운 그라데이션 게이지 바로 보여주는 컴포넌트입니다.
export default function AccuracyBar({ accuracy }: AccuracyBarProps) {
  const clampedAccuracy = Math.max(0, Math.min(100, accuracy))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-lg">
        <span className="font-semibold text-knot-brown">정확도</span>
        <span className="text-3xl font-black text-knot-ink">{clampedAccuracy}%</span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-full bg-knot-paper">
        <div
          className="h-full rounded-full bg-gradient-to-r from-knot-gold via-knot-red-soft to-knot-red transition-all duration-500"
          style={{ width: `${clampedAccuracy}%` }}
        />
      </div>
    </div>
  )
}
