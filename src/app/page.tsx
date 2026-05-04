"use client";

import Link from "next/link";
import { useState } from "react";
import KnotSelector from "@/components/KnotSelector";
import ResultCard from "@/components/ResultCard";
import { analyzeKnot, type KnotResult } from "@/lib/mockAnalyzer";

const WORKERS = ["홍길동", "김순자", "박영희", "이철수"] as const;

// 작업자가 매듭을 검사하고 결과를 확인하는 메인 화면입니다.
export default function HomePage() {
  const [worker, setWorker] = useState("");
  const [selectedKnot, setSelectedKnot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KnotResult | null>(null);

  const canStart = worker !== "" && selectedKnot !== "" && !isLoading;

  const handleAnalyze = () => {
    if (!canStart) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    window.setTimeout(() => {
      setResult(analyzeKnot(selectedKnot));
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setResult(null);
    setIsLoading(false);
  };

  const isPass = result?.result === "PASS";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col rounded-[2rem] bg-white/80 p-5 shadow-panel backdrop-blur sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-sky-700">매듭 품질 검사 데모</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              작업자 검사 화면
            </h1>
          </div>
          <Link
            href="/admin"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          >
            관리자
          </Link>
        </div>

        {result ? (
          <section className="flex flex-1 flex-col items-center justify-center gap-8 py-6">
            <div
              className={`text-center text-[180px] font-black leading-none sm:text-[220px] ${
                isPass ? "text-success" : "text-danger"
              }`}
              aria-label={isPass ? "합격" : "불합격"}
            >
              {isPass ? "O" : "X"}
            </div>
            <div className="w-full max-w-2xl">
              <ResultCard knotType={selectedKnot} resultData={result} />
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
          <section className="flex flex-1 flex-col gap-6">
            <div className="rounded-3xl bg-slate-50 p-5 sm:p-6">
              <label htmlFor="worker" className="mb-3 block text-lg font-bold text-slate-800">
                작업자 이름 선택
              </label>
              <select
                id="worker"
                value={worker}
                onChange={(event) => setWorker(event.target.value)}
                className="min-h-16 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none transition focus:border-sky-500"
              >
                <option value="">작업자를 선택하세요</option>
                {WORKERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">매듭 종류 선택</h2>
              <KnotSelector selectedKnot={selectedKnot} onSelect={setSelectedKnot} />
            </div>

            <div className="flex flex-1 flex-col rounded-3xl border-2 border-dashed border-slate-300 bg-slate-100 p-6">
              <div className="flex flex-1 items-center justify-center rounded-2xl bg-slate-200/70 px-6 py-16 text-center text-xl font-semibold text-slate-500 sm:py-24">
                사진 촬영 영역 - 데모용
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canStart}
              className="flex min-h-16 items-center justify-center rounded-2xl bg-sky-600 px-8 py-4 text-xl font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <span className="h-7 w-7 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                  검사 중...
                </span>
              ) : (
                "검사 시작"
              )}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
