"use client"

import Link from "next/link"
import { useState } from "react"
import KnotSelector from "@/components/KnotSelector"
import ResultCard from "@/components/ResultCard"
import { analyzeKnot, type KnotResult } from "@/lib/mockAnalyzer"

const WORKERS = ["홍길동", "김순자", "박영희", "이철수"] as const

export default function HomePage() {
  const [worker, setWorker] = useState("")
  const [selectedKnot, setSelectedKnot] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<KnotResult | null>(null)

  const canStart = worker !== "" && selectedKnot !== "" && !isLoading
  const isResultView = result !== null

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
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col rounded-[2rem] bg-white/90 p-6 shadow-xl ring-1 ring-slate-200 md:p-10">
        {isResultView && result ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
            <div
              className={`leading-none font-black ${
                result.result === "PASS" ? "text-pass" : "text-fail"
              } text-[180px] md:text-[220px]`}
            >
              {result.result === "PASS" ? "O" : "X"}
            </div>
            <div className="w-full max-w-2xl">
              <ResultCard knotType={selectedKnot} result={result} />
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-16 rounded-2xl bg-slate-900 px-8 py-4 text-xl font-bold text-white transition hover:bg-slate-700"
            >
              다시 검사
            </button>
          </section>
        ) : (
          <section className="flex flex-1 flex-col gap-8">
            <header className="space-y-3">
              <p className="text-lg font-semibold text-slate-500">매듭 품질 검사 데모</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                작업 전 매듭 상태를 빠르게 확인하세요
              </h1>
            </header>

            <label className="space-y-3">
              <span className="block text-xl font-bold text-slate-800">작업자 이름</span>
              <select
                value={worker}
                onChange={(event) => setWorker(event.target.value)}
                className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-xl text-slate-900 outline-none transition focus:border-slate-900"
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
              <h2 className="text-xl font-bold text-slate-800">매듭 종류</h2>
              <KnotSelector selectedKnot={selectedKnot} onSelect={setSelectedKnot} />
            </div>

            <div className="flex flex-1 items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-100 px-6 py-16 text-center">
              <div className="space-y-3">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-600">
                  촬영
                </div>
                <p className="text-2xl font-bold text-slate-700">사진 촬영 영역 - 데모용</p>
                <p className="text-lg text-slate-500">실제 카메라 연결 없이 동작하는 시연 화면입니다.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInspect}
              disabled={!canStart}
              className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xl font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
          </section>
        )}

        <div className="mt-6 flex justify-end">
          <Link href="/admin" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            관리자
          </Link>
        </div>
      </div>
    </main>
  )
}
