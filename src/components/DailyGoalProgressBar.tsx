// 일일 목표 달성률을 굵은 프로그레스 바로 보여주는 공용 컴포넌트입니다.
type DailyGoalProgressBarProps = {
  percent: number
}

export default function DailyGoalProgressBar({ percent }: DailyGoalProgressBarProps) {
  return (
    <div className="h-6 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-pass transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  )
}
