"use client"

import { useMemo, useState } from "react"
import DailyGoalProgressBar from "@/components/DailyGoalProgressBar"
import type { DailyGoalHistoryItem, DailyGoalProgress } from "@/lib/dailyGoalsShared"

type DailyGoalsAdminClientProps = {
  initialGoals: DailyGoalProgress[]
  initialHistory: DailyGoalHistoryItem[]
  dbConfigured: boolean
}

// 관리자가 작업자별 목표를 설정하고 오늘 달성 현황을 확인하는 화면입니다.
export default function DailyGoalsAdminClient({
  initialGoals,
  initialHistory,
  dbConfigured,
}: DailyGoalsAdminClientProps) {
  const [goals, setGoals] = useState(initialGoals)
  const [history] = useState(initialHistory)
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialGoals.map((goal) => [goal.workerId, String(goal.target)])),
  )
  const [savingWorkerId, setSavingWorkerId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0)
    const totalAchieved = goals.reduce((sum, goal) => sum + goal.achieved, 0)
    const reachedCount = goals.filter((goal) => goal.reached).length

    return {
      totalTarget,
      totalAchieved,
      reachedCount,
      averagePercent: goals.length === 0 ? 0 : Math.round(goals.reduce((sum, goal) => sum + goal.percent, 0) / goals.length),
    }
  }, [goals])

  const handleDraftChange = (workerId: string, nextValue: string) => {
    setDrafts((current) => ({ ...current, [workerId]: nextValue }))
  }

  const handleSave = async (workerId: string) => {
    const draftValue = drafts[workerId] ?? "0"
    const parsedTarget = Number.parseInt(draftValue, 10)

    if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
      setError("목표 수량은 0 이상의 숫자로 입력해주세요.")
      setMessage(null)
      return
    }

    setSavingWorkerId(workerId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, target: parsedTarget }),
      })

      const payload = (await response.json()) as { error?: string; goal?: DailyGoalProgress }

      if (!response.ok || !payload.goal) {
        throw new Error(payload.error ?? "목표 저장 중 오류가 발생했습니다.")
      }

      const nextGoal = payload.goal

      setGoals((current) => current.map((goal) => (goal.workerId === workerId ? nextGoal : goal)))
      setDrafts((current) => ({ ...current, [workerId]: String(nextGoal.target) }))
      setMessage(`${nextGoal.workerName} 작업자의 오늘 목표를 저장했습니다.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "목표 저장 중 오류가 발생했습니다.")
    } finally {
      setSavingWorkerId(null)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">오늘 총 목표</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalTarget}개</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">현재 달성 수</p>
          <p className="mt-3 text-4xl font-black text-pass">{summary.totalAchieved}개</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">평균 달성률</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{summary.averagePercent}%</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <p className="text-lg font-semibold text-slate-500">목표 달성 작업자</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{summary.reachedCount}명</p>
        </article>
      </section>

      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">작업자별 오늘 목표 설정</h2>
          <p className="text-lg text-slate-500">관리자가 목표 수량을 입력하면 메인 검사 화면 상단에 바로 반영됩니다.</p>
        </div>

        {!dbConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
            DATABASE_URL 또는 POSTGRES_URL을 설정하면 목표 저장과 달성 이력 기록을 사용할 수 있습니다.
          </div>
        ) : null}

        {message ? <p className="text-lg font-semibold text-pass">{message}</p> : null}
        {error ? <p className="text-lg font-semibold text-fail">{error}</p> : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {goals.map((goal) => (
            <article key={goal.workerId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black text-slate-900">{goal.workerName}</p>
                    <p className="mt-1 text-lg text-slate-500">기준일 {goal.date}</p>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 text-base font-bold ${
                      goal.reached ? "bg-emerald-100 text-pass" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {goal.reached ? "달성 완료" : "진행 중"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="space-y-2">
                    <span className="block text-lg font-bold text-slate-800">오늘 목표 개수</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={drafts[goal.workerId] ?? "0"}
                      onChange={(event) => handleDraftChange(goal.workerId, event.target.value)}
                      className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleSave(goal.workerId)}
                    disabled={!dbConfigured || savingWorkerId === goal.workerId}
                    className="min-h-14 rounded-2xl bg-slate-900 px-6 py-3 text-lg font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {savingWorkerId === goal.workerId ? "저장 중..." : "목표 저장"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-base font-semibold text-slate-500">목표</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{goal.target}개</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-base font-semibold text-slate-500">달성</p>
                    <p className="mt-2 text-2xl font-black text-pass">{goal.achieved}개</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-base font-semibold text-slate-500">달성률</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{goal.percent}%</p>
                  </div>
                </div>

                <DailyGoalProgressBar percent={goal.percent} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">일별 달성 이력</h2>
          <p className="text-lg text-slate-500">저장된 목표와 달성 결과를 최근 순으로 확인합니다.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white text-left">
              <thead className="bg-slate-100 text-base font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3">날짜</th>
                  <th className="px-4 py-3">작업자</th>
                  <th className="px-4 py-3">목표</th>
                  <th className="px-4 py-3">달성</th>
                  <th className="px-4 py-3">달성률</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-lg text-slate-500">
                      아직 저장된 달성 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 text-lg text-slate-700">
                      <td className="px-4 py-4 font-semibold text-slate-900">{item.date}</td>
                      <td className="px-4 py-4">{item.workerName}</td>
                      <td className="px-4 py-4">{item.target}개</td>
                      <td className="px-4 py-4 text-pass">{item.achieved}개</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{item.percent}%</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-base font-bold ${
                            item.reached ? "bg-emerald-100 text-pass" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.reached ? "달성" : "진행 중"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
