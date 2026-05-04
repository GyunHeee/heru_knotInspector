"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import KnotSelector from "@/components/KnotSelector"
import ResultCard from "@/components/ResultCard"
import { analyzeKnot, type KnotResult } from "@/lib/mockAnalyzer"

const WORKERS = [
  "오세철",
  "김상희",
  "김경희",
  "최복술",
  "김경애",
  "양인애",
  "이금자",
  "김영숙",
] as const

// 작업자가 실제 카메라로 사진을 촬영하고 검사 결과를 확인하는 메인 화면입니다.
export default function HomePage() {
  const [worker, setWorker] = useState("")
  const [selectedKnot, setSelectedKnot] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<KnotResult | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCameraStarting, setIsCameraStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const canStart = worker !== "" && selectedKnot !== "" && capturedImage !== null && !isLoading
  const isResultView = result !== null

  useEffect(() => {
    void startCamera()

    return () => {
      stopCamera()
    }
  }, [])

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

    window.setTimeout(() => {
      setResult(analyzeKnot(selectedKnot))
      setIsLoading(false)
    }, 1500)
  }

  const handleReset = () => {
    setResult(null)
    setIsLoading(false)
    void startCamera()
  }

  return (
    <main className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
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

            <label className="space-y-3">
              <span className="block text-lg font-bold text-slate-800 sm:text-xl">작업자 이름</span>
              <select
                value={worker}
                onChange={(event) => setWorker(event.target.value)}
                className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-slate-900 sm:text-xl"
              >
                <option value="">작업자를 선택하세요</option>
                {WORKERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
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

        <div className="mt-4 flex justify-end sm:mt-6">
          <Link href="/admin" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            관리자
          </Link>
        </div>
      </div>
    </main>
  )
}
