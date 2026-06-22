"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import BreakReminderDialog from "@/components/BreakReminderDialog"
import DailyGoalProgressBar from "@/components/DailyGoalProgressBar"
import ResponsiveMenu from "@/components/ResponsiveMenu"
import SpeakerIcon from "@/components/SpeakerIcon"
import KnotSelector from "@/components/KnotSelector"
import ResultCard from "@/components/ResultCard"
import type { DailyGoalProgress } from "@/lib/dailyGoalsShared"
import type { NoticeListResponse } from "@/lib/noticesShared"
import { analyzeKnot, type KnotResult } from "@/lib/mockAnalyzer"
import { getWorkerById, WORKERS } from "@/lib/workers"
import { DEFAULT_VOICE_SETTINGS, loadVoiceSettings, speakKorean, type VoiceSettings } from "@/lib/voiceSettings"
import { DEFAULT_BREAK_REMINDER_SETTINGS, loadBreakReminderSettings, type BreakReminderSettings } from "@/lib/breakReminderSettings"

// 작업자가 실제 카메라로 사진을 촬영하고 검사 결과를 확인하는 메인 화면입니다.
export default function HomePage() {
  const [workerId, setWorkerId] = useState("")
  const [selectedKnot, setSelectedKnot] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<KnotResult | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCameraStarting, setIsCameraStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [goal, setGoal] = useState<DailyGoalProgress | null>(null)
  const [goalError, setGoalError] = useState<string | null>(null)
  const [isGoalLoading, setIsGoalLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const [breakReminderSettings, setBreakReminderSettings] = useState<BreakReminderSettings>(DEFAULT_BREAK_REMINDER_SETTINGS)
  const [isWorking, setIsWorking] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [breakCountdownSeconds, setBreakCountdownSeconds] = useState(300)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const celebrationTimeoutRef = useRef<number | null>(null)
  const previousUnreadNoticeCountRef = useRef(0)
  const hasSpokenResultRef = useRef(false)
  const breakIntervalRef = useRef<number | null>(null)
  const breakCountdownIntervalRef = useRef<number | null>(null)

  const selectedWorker = getWorkerById(workerId)
  const canStart = workerId !== "" && selectedKnot !== "" && capturedImage !== null && !isLoading
  const isResultView = result !== null
  const todayLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date())
  const todayLabelCompact = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date())
  const inspectionSteps = [
    { number: "1", title: "작업자 선택", complete: workerId !== "" },
    { number: "2", title: "매듭 종류 선택", complete: selectedKnot !== "" },
    { number: "3", title: "촬영 준비", complete: capturedImage !== null },
  ] as const
  const showKnotStep = workerId !== ""
  const showCameraStep = selectedKnot !== ""
  const visibleSteps = inspectionSteps.filter((step) => {
    if (step.number === "1") {
      return true
    }

    if (step.number === "2") {
      return showKnotStep
    }

    return showCameraStep
  })
  const currentStepTitle = !showKnotStep ? "1단계 작업자 선택" : !showCameraStep ? "2단계 매듭 종류 선택" : "3단계 촬영 및 검사"
  const quickLinks = [
    { href: "/attendance", label: "출퇴근 기록" },
    { href: "/guides", label: "가이드" },
    { href: "/reports", label: "신고" },
    { href: workerId ? `/notices?workerId=${workerId}` : "/notices", label: "공지", badgeCount: unreadNoticeCount },
    { href: "/settings", label: "설정" },
    { href: isAdminAuthenticated ? "/admin" : "/admin/login", label: isAdminAuthenticated ? "관리자" : "관리자 로그인" },
  ]

  useEffect(() => {
    const nextVoiceSettings = loadVoiceSettings()
    const nextBreakReminderSettings = loadBreakReminderSettings()
    setVoiceSettings(nextVoiceSettings)
    setBreakReminderSettings(nextBreakReminderSettings)

    const handleStorage = () => {
      setVoiceSettings(loadVoiceSettings())
      setBreakReminderSettings(loadBreakReminderSettings())
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadAdminSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" })
        const payload = (await response.json()) as { isAuthenticated?: boolean }

        if (!ignore) {
          setIsAdminAuthenticated(payload.isAuthenticated === true)
        }
      } catch {
        if (!ignore) {
          setIsAdminAuthenticated(false)
        }
      }
    }

    void loadAdminSession()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    void startCamera()

    return () => {
      stopCamera()

      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (workerId === "") {
      setUnreadNoticeCount(0)
      return
    }

    let ignore = false

    const loadUnreadNotices = async () => {
      try {
        const response = await fetch(`/api/notices?workerId=${workerId}`, { cache: "no-store" })
        const payload = (await response.json()) as Partial<NoticeListResponse> & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? "공지 정보를 불러오지 못했습니다.")
        }

        if (!ignore) {
          setUnreadNoticeCount(payload.unreadCount ?? 0)
        }
      } catch {
        if (!ignore) {
          setUnreadNoticeCount(0)
        }
      }
    }

    void loadUnreadNotices()

    return () => {
      ignore = true
    }
  }, [workerId])

  useEffect(() => {
    if (workerId === "") {
      setGoal(null)
      setGoalError(null)
      return
    }

    let ignore = false

    const loadGoal = async () => {
      setIsGoalLoading(true)
      setGoalError(null)

      try {
        const response = await fetch(`/api/goals/${workerId}`, { cache: "no-store" })
        const payload = (await response.json()) as { error?: string; goal?: DailyGoalProgress }

        if (!response.ok || !payload.goal) {
          throw new Error(payload.error ?? "목표 정보를 불러오지 못했습니다.")
        }

        if (!ignore) {
          setGoal(payload.goal)
        }
      } catch (loadError) {
        if (!ignore) {
          setGoal(null)
          setGoalError(loadError instanceof Error ? loadError.message : "목표 정보를 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setIsGoalLoading(false)
        }
      }
    }

    void loadGoal()

    return () => {
      ignore = true
    }
  }, [workerId])

  useEffect(() => {
    if (!result) {
      hasSpokenResultRef.current = false
      return
    }

    if (hasSpokenResultRef.current) {
      return
    }

    const speechText =
      result.result === "PASS"
        ? "합격입니다"
        : `불합격입니다. 사유: ${result.reason ?? "확인 필요"}`

    speakKorean(speechText, voiceSettings)
    hasSpokenResultRef.current = true
  }, [result, voiceSettings])

  useEffect(() => {
    if (workerId === "") {
      previousUnreadNoticeCountRef.current = 0
      return
    }

    if (unreadNoticeCount > previousUnreadNoticeCountRef.current && previousUnreadNoticeCountRef.current > 0) {
      speakKorean("새 공지가 있습니다", voiceSettings)
    }

    previousUnreadNoticeCountRef.current = unreadNoticeCount
  }, [workerId, unreadNoticeCount, voiceSettings])


  useEffect(() => {
    if (workerId === "") {
      setIsWorking(false)
      return
    }

    let ignore = false

    const loadAttendanceStatus = async () => {
      try {
        const response = await fetch(`/api/break-status?workerId=${workerId}`, { cache: "no-store" })
        const payload = (await response.json()) as {
          error?: string
          status?: { isWorking?: boolean }
        }

        if (!response.ok) {
          throw new Error(payload.error ?? "출근 상태를 불러오지 못했습니다.")
        }

        if (!ignore) {
          setIsWorking(payload.status?.isWorking ?? false)
        }
      } catch {
        if (!ignore) {
          setIsWorking(false)
        }
      }
    }

    void loadAttendanceStatus()

    return () => {
      ignore = true
    }
  }, [workerId])

  useEffect(() => {
    if (breakIntervalRef.current) {
      window.clearInterval(breakIntervalRef.current)
      breakIntervalRef.current = null
    }

    if (!breakReminderSettings.enabled || !isWorking || workerId === "") {
      return
    }

    breakIntervalRef.current = window.setInterval(() => {
      setShowBreakReminder(true)
      setBreakCountdownSeconds(300)
      speakKorean("휴식 시간입니다", voiceSettings)

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("휴식 알림", {
          body: "잠깐 쉬세요! 5분 후 다시 시작해요",
        })
      }
    }, breakReminderSettings.intervalMinutes * 60 * 1000)

    return () => {
      if (breakIntervalRef.current) {
        window.clearInterval(breakIntervalRef.current)
        breakIntervalRef.current = null
      }
    }
  }, [breakReminderSettings, isWorking, voiceSettings, workerId])

  useEffect(() => {
    if (!showBreakReminder) {
      if (breakCountdownIntervalRef.current) {
        window.clearInterval(breakCountdownIntervalRef.current)
        breakCountdownIntervalRef.current = null
      }
      return
    }

    breakCountdownIntervalRef.current = window.setInterval(() => {
      setBreakCountdownSeconds((current) => {
        if (current <= 1) {
          if (breakCountdownIntervalRef.current) {
            window.clearInterval(breakCountdownIntervalRef.current)
            breakCountdownIntervalRef.current = null
          }
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      if (breakCountdownIntervalRef.current) {
        window.clearInterval(breakCountdownIntervalRef.current)
        breakCountdownIntervalRef.current = null
      }
    }
  }, [showBreakReminder])
  useEffect(() => {
    if (!showCelebration) {
      return
    }

    celebrationTimeoutRef.current = window.setTimeout(() => {
      setShowCelebration(false)
    }, 2600)

    return () => {
      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [showCelebration])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraReady(false)
  }

  const startCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("이 기기에서는 카메라를 사용할 수 없습니다.")
      return
    }

    setIsCameraStarting(true)
    setCameraError(null)
    setCapturedImage(null)

    try {
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsCameraReady(true)
    } catch {
      setCameraError("카메라 권한을 허용한 뒤 다시 시도해주세요.")
      stopCamera()
    } finally {
      setIsCameraStarting(false)
    }
  }

  const handleCapturePhoto = () => {
    const videoElement = videoRef.current
    const canvasElement = canvasRef.current

    if (!videoElement || !canvasElement) {
      setCameraError("촬영 준비가 끝나지 않았습니다. 잠시 후 다시 시도해주세요.")
      return
    }

    const width = videoElement.videoWidth
    const height = videoElement.videoHeight

    if (width === 0 || height === 0) {
      setCameraError("카메라 화면을 불러오는 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }

    canvasElement.width = width
    canvasElement.height = height

    const context = canvasElement.getContext("2d")

    if (!context) {
      setCameraError("사진을 저장할 수 없습니다.")
      return
    }

    context.drawImage(videoElement, 0, 0, width, height)
    setCapturedImage(canvasElement.toDataURL("image/jpeg", 0.92))
    stopCamera()
  }

  const handleInspect = () => {
    if (!canStart) {
      return
    }

    setIsLoading(true)
    setGoalError(null)

    window.setTimeout(() => {
      void (async () => {
        const inspectedResult = analyzeKnot(selectedKnot)
        let updatedGoal = goal

        if (inspectedResult.result === "PASS" && workerId !== "") {
          try {
            const response = await fetch("/api/goals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ workerId }),
            })
            const payload = (await response.json()) as { error?: string; goal?: DailyGoalProgress }

            if (!response.ok || !payload.goal) {
              throw new Error(payload.error ?? "달성 수 업데이트에 실패했습니다.")
            }

            updatedGoal = payload.goal
            setGoal(payload.goal)

            if (!goal?.reached && payload.goal.reached) {
              setShowCelebration(true)
            }
          } catch (updateError) {
            setGoalError(updateError instanceof Error ? updateError.message : "달성 수 업데이트에 실패했습니다.")
          }
        }

        setResult(inspectedResult)
        setIsLoading(false)

        if (inspectedResult.result === "FAIL" && updatedGoal) {
          setGoal(updatedGoal)
        }
      })()
    }, 1500)
  }

  const handleReset = () => {
    setResult(null)
    setIsLoading(false)
    setShowCelebration(false)
    setShowBreakReminder(false)
    hasSpokenResultRef.current = false
    void startCamera()
  }

  return (
    <main className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
      {showBreakReminder ? (
        <BreakReminderDialog countdownSeconds={breakCountdownSeconds} onClose={() => setShowBreakReminder(false)} />
      ) : null}
      {showCelebration ? (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center">
          <div className="goal-burst relative overflow-hidden rounded-[1.1rem] border border-pass/20 bg-white px-8 py-5 text-center shadow-card">
            <div className="absolute -left-2 top-3 h-4 w-4 rounded-full bg-amber-300" />
            <div className="absolute right-6 top-2 h-3 w-3 rounded-full bg-sky-300" />
            <div className="absolute bottom-3 left-8 h-3 w-3 rounded-full bg-rose-300" />
            <div className="absolute -right-1 bottom-4 h-4 w-4 rounded-full bg-emerald-300" />
            <p className="text-lg font-bold text-pass">오늘 목표를 달성했습니다</p>
            <p className="mt-1 text-3xl font-black text-knot-ink">축하합니다!</p>
          </div>
        </div>
      ) : null}

      <div className="knot-panel mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] p-3 sm:min-h-[calc(100vh-2rem)] sm:p-5 md:p-8 lg:min-h-[calc(100vh-3rem)] lg:p-10">
        <div className="mb-4 flex justify-end md:hidden">
          <ResponsiveMenu links={quickLinks} title="검사 메뉴" />
        </div>
        {isResultView && result ? (
          <section className="result-appear flex flex-1 flex-col items-center justify-center gap-6 py-3 text-center sm:gap-8">
            <div
              className={`flex h-[210px] w-[210px] items-center justify-center rounded-full border text-center shadow-card sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px] ${
                result.result === "PASS"
                  ? "knot-result-pass border-pass/20 text-pass"
                  : "knot-result-fail border-fail/20 text-fail"
              }`}
            >
              <div>
                <div className="text-[78px] font-black leading-none sm:text-[92px] md:text-[108px]">
                  {result.result === "PASS" ? "✓" : "✕"}
                </div>
                <p className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                  {result.result === "PASS" ? "합격" : "불합격"}
                </p>
              </div>
            </div>
            <div className="w-full max-w-2xl">
              <ResultCard knotType={selectedKnot} result={result} />
            </div>
            {goal ? (
              <div className="w-full max-w-2xl rounded-[1.05rem] border border-knot-sand bg-knot-ivory p-5 text-left shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-knot-red">오늘 목표 진행 현황</p>
                    <p className="mt-1 text-2xl font-black text-knot-ink">
                      {goal.workerName} · {goal.achieved} / {goal.target}개
                    </p>
                  </div>
                  <p className="text-4xl font-black text-knot-ink">{goal.percent}%</p>
                </div>
                <div className="mt-4">
                  <DailyGoalProgressBar percent={goal.percent} />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              className="soft-press min-h-16 w-full max-w-sm rounded-[1rem] bg-knot-ink px-8 py-4 text-xl font-bold text-white hover:bg-knot-brown"
            >
              다시 검사
            </button>
          </section>
        ) : (
          <section className="flex flex-1 flex-col gap-5 md:gap-7">
            <header className="rounded-[1.1rem] border border-knot-sand bg-white/78 p-4 shadow-card sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-knot-red/10 px-4 py-2 text-sm font-bold text-knot-red">
                    전통매듭 검사
                  </div>
                  <h1 className="mt-4 text-[2.35rem] font-black tracking-tight leading-[1.08] text-knot-ink sm:text-4xl md:text-5xl">
                    작업 전 매듭 상태를
                    <br className="hidden sm:block" /> 빠르고 편안하게 확인하세요
                  </h1>
                  <p className="mt-3 text-lg text-knot-brown">
                    전통 공예의 섬세함을 해치지 않으면서도, 큰 글씨와 단계 안내로 누구나 쉽게 검사할 수 있도록 구성했습니다.
                  </p>
                </div>
                <div className="rounded-[1rem] bg-knot-ivory px-4 py-4 text-left shadow-sm md:min-w-[220px]">
                  <p className="text-base font-semibold text-knot-brown">오늘 날짜</p>
                  <p className="mt-2 text-xl font-black text-knot-ink sm:hidden">{todayLabelCompact}</p>
                  <p className="mt-2 hidden text-2xl font-black text-knot-ink sm:block">{todayLabel}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-knot-ink px-4 py-2 text-sm font-bold text-white">
                  현재 단계 · {currentStepTitle}
                </div>
                {visibleSteps.map((step) => (
                  <article
                    key={step.number}
                    className={`min-w-[150px] rounded-[1rem] border px-4 py-3.5 sm:py-4 ${
                      step.complete
                        ? "border-knot-red/20 bg-knot-red/10"
                        : "border-knot-sand bg-knot-paper/55"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-knot-brown">{step.number}단계</p>
                        <p className="mt-1 text-lg font-black text-knot-ink sm:text-xl">{step.title}</p>
                      </div>
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                          step.complete ? "bg-knot-red text-white" : "bg-white text-knot-brown"
                        }`}
                      >
                        {step.complete ? "✓" : step.number}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </header>

            <section className="rounded-[1.1rem] border border-knot-sand bg-knot-ivory/90 p-4 shadow-card md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-knot-red">오늘 목표 현황</p>
                  <h2 className="mt-1 text-[1.8rem] font-black leading-[1.18] text-knot-ink sm:text-2xl">오늘 목표 / 현재 달성 수 / 달성률</h2>
                  <p className="mt-2 text-lg text-knot-brown">
                    {workerId === ""
                      ? "작업자를 선택하면 오늘 목표와 달성 현황이 표시됩니다."
                      : `${selectedWorker?.name ?? workerId} 작업자의 오늘 생산 진행 현황입니다.`}
                  </p>
                </div>
                <p className="text-3xl font-black text-knot-ink sm:text-4xl">{goal?.percent ?? 0}%</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <article className="rounded-[1rem] border border-knot-sand bg-white/92 px-4 py-4">
                  <p className="text-base font-semibold text-knot-brown">오늘 목표</p>
                  <p className="mt-2 text-2xl font-black text-knot-ink">{goal?.target ?? 0}개</p>
                </article>
                <article className="rounded-[1rem] border border-knot-sand bg-white/92 px-4 py-4">
                  <p className="text-base font-semibold text-knot-brown">현재 달성 수</p>
                  <p className="mt-2 text-2xl font-black text-pass">{goal?.achieved ?? 0}개</p>
                </article>
                <article className="rounded-[1rem] border border-knot-sand bg-white/92 px-4 py-4">
                  <p className="text-base font-semibold text-knot-brown">상태</p>
                  <p className="mt-2 text-2xl font-black text-knot-ink">{goal?.reached ? "달성 완료" : "진행 중"}</p>
                </article>
              </div>

              <div className="mt-4">
                <DailyGoalProgressBar percent={goal?.percent ?? 0} />
              </div>

              {isGoalLoading ? <p className="mt-3 text-lg font-semibold text-knot-brown">목표 정보를 불러오는 중입니다...</p> : null}
              {goalError ? <p className="mt-3 text-lg font-semibold text-fail">{goalError}</p> : null}
            </section>

            <section className="space-y-5">
              <label className="block rounded-[1.1rem] border border-knot-sand bg-white/90 p-4 shadow-card sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-sm font-semibold text-knot-brown">1단계</span>
                    <span className="mt-1 block text-xl font-black text-knot-ink sm:text-2xl">작업자 이름</span>
                  </div>
                  {workerId !== "" ? (
                    <span className="inline-flex rounded-full bg-knot-red px-3 py-1 text-sm font-bold text-white">
                      완료
                    </span>
                  ) : null}
                </div>
                <select
                  value={workerId}
                  onChange={(event) => setWorkerId(event.target.value)}
                  className="min-h-16 w-full rounded-[0.95rem] border border-knot-sand bg-knot-ivory px-5 py-4 text-lg text-knot-ink outline-none transition focus:border-knot-red sm:text-xl"
                >
                  <option value="">작업자를 선택하세요</option>
                  {WORKERS.map((workerOption) => (
                    <option key={workerOption.id} value={workerOption.id}>
                      {workerOption.name}
                    </option>
                  ))}
                </select>
                <p className="mt-3 text-base text-knot-brown">
                  {selectedWorker
                    ? `${selectedWorker.id} · ${selectedWorker.scoreReference}`
                    : "선택한 작업자의 참고 정보가 여기에 표시됩니다."}
                </p>
              </label>

              {showKnotStep ? (
                <div className="rounded-[1.1rem] border border-knot-sand bg-white/90 p-4 shadow-card sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-knot-brown">2단계</p>
                      <h2 className="mt-1 text-xl font-black text-knot-ink sm:text-2xl">매듭 종류 선택</h2>
                    </div>
                    {selectedKnot !== "" ? (
                      <span className="inline-flex rounded-full bg-knot-red px-3 py-1 text-sm font-bold text-white">
                        완료
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-base text-knot-brown">현재 검사할 매듭 종류를 선택해 주세요.</p>
                  <div className="mt-4">
                    <KnotSelector selectedKnot={selectedKnot} onSelect={setSelectedKnot} />
                  </div>
                </div>
              ) : null}

              {showCameraStep ? (
                <div className="space-y-4 rounded-[1.1rem] border border-knot-sand bg-white/90 p-4 shadow-card md:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-knot-brown">3단계</p>
                      <h2 className="mt-1 text-xl font-black text-knot-ink sm:text-2xl">촬영 및 확인</h2>
                    </div>
                    <span className="inline-flex rounded-full bg-knot-paper px-3 py-1 text-sm font-semibold text-knot-brown">
                      {capturedImage ? "촬영 완료" : "촬영 대기"}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-[1rem] bg-knot-ink">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="촬영된 매듭 사진"
                        className="h-[260px] w-full object-cover sm:h-[320px] md:h-[420px]"
                      />
                    ) : (
                      <div className="relative h-[260px] sm:h-[320px] md:h-[420px]">
                        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                        {!isCameraReady ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-knot-ink/80 px-6 text-center text-white">
                            {isCameraStarting ? (
                              <>
                                <span className="knot-spinner" aria-hidden="true">
                                  <svg viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="18" />
                                  </svg>
                                </span>
                                <p className="text-xl font-bold">카메라를 준비하고 있습니다...</p>
                              </>
                            ) : (
                              <>
                                <p className="text-2xl font-bold">카메라 연결이 필요합니다</p>
                                <p className="text-lg text-white/80">
                                  카메라 권한을 허용하면 실시간 촬영 화면이 표시됩니다.
                                </p>
                              </>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="grid gap-3 lg:grid-cols-2">
                    {capturedImage ? (
                      <button
                        type="button"
                        onClick={() => void startCamera()}
                        className="soft-press min-h-16 flex-1 rounded-[0.95rem] border border-knot-sand bg-knot-ivory px-6 py-4 text-xl font-bold text-knot-ink hover:border-knot-red/40"
                      >
                        재촬영
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        disabled={!isCameraReady || isCameraStarting}
                        className="soft-press min-h-16 flex-1 rounded-[0.95rem] bg-knot-red px-6 py-4 text-xl font-bold text-white hover:bg-[#b34134] disabled:cursor-not-allowed disabled:bg-knot-sand disabled:text-knot-brown"
                      >
                        사진 촬영
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      disabled={isCameraStarting}
                      className="soft-press min-h-16 flex-1 rounded-[0.95rem] border border-knot-sand bg-white px-6 py-4 text-xl font-bold text-knot-ink hover:border-knot-red/40 disabled:cursor-not-allowed disabled:bg-knot-mist disabled:text-knot-brown/60"
                    >
                      카메라 다시 연결
                    </button>
                  </div>

                  <div className="rounded-[1rem] bg-knot-ivory px-4 py-4 text-lg text-knot-brown">
                    <p className="font-semibold text-knot-ink">
                      {capturedImage ? "촬영이 완료되었습니다. 검사 시작 버튼을 눌러주세요." : "실시간 카메라 화면에서 매듭을 중앙에 맞춰주세요."}
                    </p>
                    {cameraError ? <p className="font-semibold text-fail">{cameraError}</p> : null}
                  </div>
                </div>
              ) : null}
            </section>

            <div className="sticky bottom-0 -mx-4 mt-auto border-t border-knot-sand/70 bg-knot-ivory/95 px-4 pb-1 pt-4 backdrop-blur sm:-mx-5 sm:px-5 md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
              <button
                type="button"
                onClick={handleInspect}
                disabled={!canStart}
                className="soft-press flex min-h-16 w-full items-center justify-center gap-3 rounded-[1rem] bg-knot-ink px-8 py-4 text-xl font-bold text-white hover:bg-knot-brown disabled:cursor-not-allowed disabled:bg-knot-sand disabled:text-knot-brown"
              >
                {isLoading ? (
                  <>
                    <span className="knot-spinner" aria-hidden="true">
                      <svg viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="18" />
                      </svg>
                    </span>
                    검사 중...
                  </>
                ) : (
                  "검사 시작"
                )}
              </button>
            </div>
          </section>
        )}

        <div className="mt-4 hidden flex-wrap justify-end gap-4 md:flex md:mt-6">
          <Link href="/attendance" className="text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline">
            출퇴근 기록
          </Link>
          <Link href="/guides" className="text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline">
            가이드
          </Link>
          <Link href="/reports" className="text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline">
            신고
          </Link>
          <Link
            href={workerId ? `/notices?workerId=${workerId}` : "/notices"}
            className="inline-flex items-center gap-2 text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline"
          >
            공지
            {workerId !== "" && unreadNoticeCount > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-fail px-2 py-1 text-sm font-bold text-white">
                {unreadNoticeCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline"
          >
            {voiceSettings.enabled ? <SpeakerIcon className="h-5 w-5" /> : null}
            설정
          </Link>
          <Link
            href={isAdminAuthenticated ? "/admin" : "/admin/login"}
            className="text-base font-semibold text-knot-brown underline-offset-4 hover:text-knot-red hover:underline"
          >
            {isAdminAuthenticated ? "관리자" : "관리자 로그인"}
          </Link>
        </div>
      </div>
    </main>
  )
}
