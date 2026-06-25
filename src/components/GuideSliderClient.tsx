"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import SpeakerIcon from "@/components/SpeakerIcon"
import type { GuideItem, KnotGuideType } from "@/lib/guidesShared"
import { DEFAULT_VOICE_SETTINGS, loadVoiceSettings, type VoiceSettings } from "@/lib/voiceSettings"

type GuideSliderClientProps = {
  knotType: KnotGuideType
  guides: GuideItem[]
}

// 작업자가 단계별 사진과 설명을 넘겨보는 가이드 슬라이드 화면입니다.
export default function GuideSliderClient({ knotType, guides }: GuideSliderClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const currentGuide = guides[currentIndex]
  const totalCount = guides.length

  const progressText = useMemo(() => `${currentIndex + 1} / ${totalCount}`, [currentIndex, totalCount])

  useEffect(() => {
    setVoiceSettings(loadVoiceSettings())

    const handleStorage = () => {
      setVoiceSettings(loadVoiceSettings())
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !voiceSettings.enabled) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(`${currentGuide.step}단계. ${currentGuide.description}`)
    utterance.lang = "ko-KR"
    utterance.rate = voiceSettings.rate
    utterance.volume = voiceSettings.volume
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const handleStopSpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  if (!currentGuide) {
    return (
      <section className="rounded-[2rem] bg-white p-6 text-center shadow-xl ring-1 ring-slate-200 md:p-8">
        <h1 className="text-3xl font-black text-slate-900">{knotType}</h1>
        <p className="mt-4 text-xl text-slate-500">등록된 가이드 단계가 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-500">매듭 제작 가이드</p>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{knotType}</h1>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-lg font-bold text-slate-700">{progressText}</div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
        <img src={currentGuide.imagePath} alt={`${knotType} ${currentGuide.step}단계`} className="w-full object-cover" />
      </div>

      <div className="mt-8 flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-3xl font-black text-white">
          {currentGuide.step}
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-slate-500">단계 설명</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!voiceSettings.enabled}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-base font-bold text-slate-800 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <SpeakerIcon className="h-5 w-5" />
                설명 듣기
              </button>
              <button
                type="button"
                onClick={handleStopSpeaking}
                disabled={!isSpeaking}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-base font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-300 disabled:text-slate-500"
              >
                재생 중단
              </button>
            </div>
          </div>
          <p className="mt-2 text-[20px] leading-relaxed text-slate-800">{currentGuide.description}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
          className="min-h-16 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xl font-bold text-slate-800 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          이전 단계
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((index) => Math.min(totalCount - 1, index + 1))}
          disabled={currentIndex === totalCount - 1}
          className="min-h-16 rounded-2xl bg-slate-900 px-6 py-4 text-xl font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          다음 단계
        </button>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <Link href="/guides" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
          가이드 목록
        </Link>
        <Link href="/" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
          검사 화면으로
        </Link>
      </div>
    </section>
  )
}
