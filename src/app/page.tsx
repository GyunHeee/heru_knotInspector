"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import DailyGoalProgressBar from "@/components/DailyGoalProgressBar"
import SpeakerIcon from "@/components/SpeakerIcon"
import KnotSelector from "@/components/KnotSelector"
import ResultCard from "@/components/ResultCard"
import type { DailyGoalProgress } from "@/lib/dailyGoalsShared"
import type { NoticeListResponse } from "@/lib/noticesShared"
import { analyzeKnot, type KnotResult } from "@/lib/mockAnalyzer"
import { getWorkerById, WORKERS } from "@/lib/workers"
import { DEFAULT_VOICE_SETTINGS, loadVoiceSettings, speakKorean, type VoiceSettings } from "@/lib/voiceSettings"

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
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const celebrationTimeoutRef = useRef<number | null>(null)
  const previousUnreadNoticeCountRef = useRef(0)
  const hasSpokenResultRef = useRef(false)

  const selectedWorker = getWorkerById(workerId)
  const canStart = workerId !== "" && selectedKnot !== "" && capturedImage !== null && !isLoading
  const isResultView = result !== null

  useEffect(() => {
    const nextSettings = loadVoiceSettings()
    setVoiceSettings(nextSettings)

    const handleStorage = (event: StorageEvent) => {
      if (event.key) {
        setVoiceSettings(loadVoiceSettings())
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
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
    hasSpokenResultRef.current = false
    void startCamera()
  }

  return (
    <main className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
      {showCelebration ? (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center">
          <div className="goal-burst relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white px-8 py-5 text-center shadow-2xl">
            <div className="absolute -left-2 top-3 h-4 w-4 rounded-full bg-amber-300" />
            <div className="absolute right-6 top-2 h-3 w-3 rounded-full bg-sky-300" />
            <div className="absolute bottom-3 left-8 h-3 w-3 rounded-full bg-rose-300" />
            <div className="absolute -right-1 bottom-4 h-4 w-4 rounded-full bg-emerald-300" />
            <p className="text-lg font-bold text-emerald-600">오늘 목표를 달성했습니다</p>
            <p className="mt-1 text-3xl font-black text-slate-900">축하합니다!</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col rounded-[1.75rem] bg-white/90 p-4 shadow-xl ring-1 ring-slate-200 sm:min-h-[calc(100vh-2rem)] sm:p-5 md:rounded-[2rem] md:p-8 lg:min-h-[calc(100vh-3rem)] lg:p-10">
        {isResultView && result ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-6 py-3 text-center sm:gap-8">
            <div
              className={`leading-none font-black ${
                result.result === "PASS" ? "text-pass" : "text-fail"
              } text-[140px] sm:text-[180px] md:text-[220px]`}
            >
              {result.result === "PASS" ? "O" : "X"}
            </div>
            <div className="w-full max-w-2xl">
              <ResultCard knotType={selectedKnot} result={result} />
            </div>
            {goal ? (
              <div className="w-full max-w-2xl rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5 text-left">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-emerald-700">오늘 목표 진행 현황</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {goal.workerName} · {goal.achieved} / {goal.target}개
                    </p>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{goal.percent}%</p>
                </div>
                <div className="mt-4">
                  <DailyGoalProgressBar percent={goal.percent} />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              className="min-h-16 w-full max-w-sm rounded-2xl bg-slate-900 px-8 py-4 text-xl font-bold text-white transition hover:bg-slate-700"
            >
              다시 검사
            </button>
          </section>
        ) : (
          <section className="flex flex-1 flex-col gap-5 md:gap-7">
            <header className="space-y-3">
              <p className="text-base font-semibold text-slate-500 sm:text-lg">매듭 품질 검사 데모</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                작업 전 매듭 상태를 빠르게 확인하세요
              </h1>
            </header>

            <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-emerald-700">오늘 목표 현황</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">오늘 목표 / 현재 달성 수 / 달성률</h2>
                  <p className="mt-2 text-lg text-slate-600">
                    {workerId === ""
                      ? "작업자를 선택하면 오늘 목표와 달성 현황이 표시됩니다."
                      : `${selectedWorker?.name ?? workerId} 작업자의 오늘 생산 진행 현황입니다.`}
                  </p>
                </div>
                <p className="text-4xl font-black text-slate-900">{goal?.percent ?? 0}%</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-base font-semibold text-slate-500">오늘 목표</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{goal?.target ?? 0}개</p>
                </article>
                <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-base font-semibold text-slate-500">현재 달성 수</p>
                  <p className="mt-2 text-2xl font-black text-pass">{goal?.achieved ?? 0}개</p>
                </article>
                <article className="rounded-2xl bg-white px-4 py-4 ring-1 ring-emerald-100">
                  <p className="text-base font-semibold text-slate-500">상태</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{goal?.reached ? "달성 완료" : "진행 중"}</p>
                </article>
              </div>

              <div className="mt-4">
                <DailyGoalProgressBar percent={goal?.percent ?? 0} />
              </div>

              {isGoalLoading ? <p className="mt-3 text-lg font-semibold text-slate-500">목표 정보를 불러오는 중입니다...</p> : null}
              {goalError ? <p className="mt-3 text-lg font-semibold text-fail">{goalError}</p> : null}
            </section>

            <label className="space-y-3">
              <span className="block text-lg font-bold text-slate-800 sm:text-xl">작업자 이름</span>
              <select
                value={workerId}
                onChange={(event) => setWorkerId(event.target.value)}
                className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-slate-900 sm:text-xl"
              >
                <option value="">작업자를 선택하세요</option>
                {WORKERS.map((workerOption) => (
                  <option key={workerOption.id} value={workerOption.id}>
                    {workerOption.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">매듭 종류</h2>
              <KnotSelector selectedKnot={selectedKnot} onSelect={setSelectedKnot} />
            </div>

            <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="overflow-hidden rounded-[1.5rem] bg-slate-900">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/75 px-6 text-center text-white">
                        {isCameraStarting ? (
                          <>
                            <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                            <p className="text-xl font-bold">카메라를 준비하고 있습니다...</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold">카메라 연결이 필요합니다</p>
                            <p className="text-lg text-slate-200">
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
                    className="min-h-16 flex-1 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xl font-bold text-slate-800 transition hover:border-slate-900"
                  >
                    재촬영
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!isCameraReady || isCameraStarting}
                    className="min-h-16 flex-1 rounded-2xl bg-slate-900 px-6 py-4 text-xl font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    사진 촬영
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void startCamera()}
                  disabled={isCameraStarting}
                  className="min-h-16 flex-1 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xl font-bold text-slate-800 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  카메라 다시 연결
                </button>
              </div>

              <div className="space-y-1 text-lg text-slate-600">
                <p className="font-semibold text-slate-800">
                  {capturedImage ? "촬영이 완료되었습니다. 검사 시작 버튼을 눌러주세요." : "실시간 카메라 화면에서 매듭을 중앙에 맞춰주세요."}
                </p>
                {cameraError ? <p className="font-semibold text-fail">{cameraError}</p> : null}
              </div>
            </div>

            <div className="sticky bottom-0 -mx-4 mt-auto border-t border-slate-200 bg-white/95 px-4 pb-1 pt-4 backdrop-blur sm:-mx-5 sm:px-5 md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
              <button
                type="button"
                onClick={handleInspect}
                disabled={!canStart}
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xl font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isLoading ? (
                  <>
                    <span className="h-7 w-7 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                    검사 중...
                  </>
                ) : (
                  "검사 시작"
                )}
              </button>
            </div>
          </section>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-4 sm:mt-6">
          <Link href="/attendance" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            출퇴근 기록
          </Link>
          <Link href="/guides" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            가이드
          </Link>
          <Link href="/reports" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            신고
          </Link>
          <Link
            href={workerId ? `/notices?workerId=${workerId}` : "/notices"}
            className="inline-flex items-center gap-2 text-base font-semibold text-slate-500 underline-offset-4 hover:underline"
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
            className="inline-flex items-center gap-2 text-base font-semibold text-slate-500 underline-offset-4 hover:underline"
          >
            {voiceSettings.enabled ? <SpeakerIcon className="h-5 w-5" /> : null}
            음성 설정
          </Link>
          <Link href="/admin" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            관리자
          </Link>
        </div>
      </div>
    </main>
  )
}
