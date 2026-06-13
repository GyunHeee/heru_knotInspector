"use client"

import { useEffect, useState } from "react"
import SpeakerIcon from "@/components/SpeakerIcon"
import {
  DEFAULT_BREAK_REMINDER_SETTINGS,
  loadBreakReminderSettings,
  normalizeBreakReminderSettings,
  saveBreakReminderSettings,
  type BreakIntervalMinutes,
  type BreakReminderSettings,
} from "@/lib/breakReminderSettings"

type BreakReminderSettingsCardProps = {
  compact?: boolean
}

// 작업자가 휴식 알림 간격과 사용 여부를 조절하는 설정 카드입니다.
export default function BreakReminderSettingsCard({ compact = false }: BreakReminderSettingsCardProps) {
  const [settings, setSettings] = useState<BreakReminderSettings>(DEFAULT_BREAK_REMINDER_SETTINGS)

  useEffect(() => {
    setSettings(loadBreakReminderSettings())
  }, [])


  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  const updateSettings = (patch: Partial<BreakReminderSettings>) => {
    const nextSettings = normalizeBreakReminderSettings({ ...settings, ...patch })
    setSettings(nextSettings)
    saveBreakReminderSettings(nextSettings)
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-500">휴식 알림</p>
          <h2 className={`${compact ? "text-2xl" : "text-3xl md:text-4xl"} font-black text-slate-900`}>
            자동 휴식 권유 설정
          </h2>
        </div>
        {settings.enabled ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-700">
            <SpeakerIcon className="h-6 w-6" />
            <span className="text-base font-bold">알림 ON</span>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black text-slate-900">휴식 알림 사용</p>
              <p className="mt-1 text-lg text-slate-500">작업 중일 때만 일정 시간마다 쉬는 시간을 알려줍니다.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ enabled: !settings.enabled })}
              className={`min-h-14 min-w-32 rounded-2xl px-5 py-3 text-lg font-bold transition ${
                settings.enabled ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {settings.enabled ? "켜짐" : "꺼짐"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black text-slate-900">알림 간격</p>
              <p className="mt-1 text-lg text-slate-500">30분 / 1시간 / 2시간 중에서 선택하세요.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {([30, 60, 120] as BreakIntervalMinutes[]).map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => updateSettings({ intervalMinutes: minutes })}
                  className={`min-h-14 rounded-2xl px-5 py-3 text-lg font-bold transition ${
                    settings.intervalMinutes === minutes
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-300"
                  }`}
                >
                  {minutes === 30 ? "30분" : minutes === 60 ? "1시간" : "2시간"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => void requestNotificationPermission()}
          className="min-h-14 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-bold text-slate-700 transition hover:border-slate-900"
        >
          브라우저 알림 허용
        </button>
      </div>
    </section>
  )
}
