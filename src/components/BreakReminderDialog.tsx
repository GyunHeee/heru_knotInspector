"use client"

type BreakReminderDialogProps = {
  countdownSeconds: number
  onClose: () => void
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`
}

// 작업자에게 휴식을 권유하는 팝업과 원형 카운트다운을 보여주는 컴포넌트입니다.
export default function BreakReminderDialog({ countdownSeconds, onClose }: BreakReminderDialogProps) {
  const totalSeconds = 300
  const progress = Math.max(0, Math.min(1, countdownSeconds / totalSeconds))
  const circumference = 2 * Math.PI * 56
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200 md:p-8">
        <p className="text-lg font-semibold text-slate-500">휴식 알림</p>
        <h1 className="mt-3 text-[24px] font-black leading-snug text-slate-900">
          잠깐 쉬세요! 5분 후 다시 시작해요
        </h1>
        <p className="mt-3 text-xl text-slate-600">지금 잠시 손과 눈을 쉬어주세요.</p>

        <div className="mt-8 flex justify-center">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle cx="70" cy="70" r="56" stroke="#E2E8F0" strokeWidth="12" fill="none" />
              <circle
                cx="70"
                cy="70"
                r="56"
                stroke="#0F172A"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-slate-900">
              {formatRemaining(countdownSeconds)}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onClose}
            className="min-h-16 w-full rounded-2xl bg-slate-900 px-6 py-4 text-2xl font-black text-white transition hover:bg-slate-700"
          >
            지금 쉴게요
          </button>
        </div>
      </div>
    </div>
  )
}
