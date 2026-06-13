"use client"

import { useEffect, useState } from "react"
import SpeakerIcon from "@/components/SpeakerIcon"
import {
  DEFAULT_VOICE_SETTINGS,
  loadVoiceSettings,
  normalizeVoiceSettings,
  saveVoiceSettings,
  speakKorean,
  type VoiceSettings,
} from "@/lib/voiceSettings"

// 작업자가 음성 안내 사용 여부와 속도를 조절하는 설정 화면입니다.
export default function VoiceSettingsClient() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setSettings(loadVoiceSettings())
    setIsReady(true)
  }, [])

  const updateSettings = (patch: Partial<VoiceSettings>) => {
    const nextSettings = normalizeVoiceSettings({ ...settings, ...patch })
    setSettings(nextSettings)
    saveVoiceSettings(nextSettings)
  }

  const handlePreview = () => {
    speakKorean("음성 안내 설정이 적용되었습니다.", settings)
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-500">접근성 설정</p>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">음성 안내 설정</h1>
        </div>
        {settings.enabled ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-pass">
            <SpeakerIcon className="h-6 w-6" />
            <span className="text-base font-bold">음성 ON</span>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black text-slate-900">음성 안내</p>
              <p className="mt-1 text-lg text-slate-500">검사 결과와 새 공지 도착 시 소리로 안내합니다.</p>
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

        <label className="block space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-black text-slate-900">음성 속도</span>
            <span className="text-lg font-bold text-slate-600">{settings.rate.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.rate}
            onChange={(event) => updateSettings({ rate: Number(event.target.value) })}
            className="w-full accent-slate-900"
          />
        </label>

        <label className="block space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-black text-slate-900">볼륨</span>
            <span className="text-lg font-bold text-slate-600">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(event) => updateSettings({ volume: Number(event.target.value) })}
            className="w-full accent-slate-900"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={!isReady || !settings.enabled}
          className="min-h-14 rounded-2xl bg-slate-900 px-6 py-3 text-lg font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          음성 미리 듣기
        </button>
      </div>
    </section>
  )
}
