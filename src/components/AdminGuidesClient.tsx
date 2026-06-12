"use client"

import { useMemo, useState, type FormEvent } from "react"
import type { GuideItem, KnotGuideType } from "@/lib/guidesShared"
import { GUIDE_KNOT_TYPES } from "@/lib/guidesShared"

type AdminGuidesClientProps = {
  initialGuides: GuideItem[]
  dbConfigured: boolean
}

type EditDraft = {
  knotType: KnotGuideType
  step: string
  description: string
  imagePath: string
  file: File | null
}

// 관리자가 가이드 사진과 설명을 등록하고 수정하는 화면입니다.
export default function AdminGuidesClient({ initialGuides, dbConfigured }: AdminGuidesClientProps) {
  const [guides, setGuides] = useState(initialGuides)
  const [createKnotType, setCreateKnotType] = useState<KnotGuideType>("동심결 매듭")
  const [createStep, setCreateStep] = useState("1")
  const [createDescription, setCreateDescription] = useState("")
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [savingCreate, setSavingCreate] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<number, EditDraft>>(
    Object.fromEntries(
      initialGuides.map((guide) => [
        guide.id,
        {
          knotType: guide.knotType,
          step: String(guide.step),
          description: guide.description,
          imagePath: guide.imagePath,
          file: null,
        },
      ]),
    ),
  )

  const groupedGuides = useMemo(
    () =>
      GUIDE_KNOT_TYPES.map((item) => ({
        ...item,
        guides: guides.filter((guide) => guide.knotType === item.knotType).sort((a, b) => a.step - b.step),
      })),
    [guides],
  )

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingCreate(true)
    setMessage(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("knotType", createKnotType)
      formData.append("step", createStep)
      formData.append("description", createDescription)

      if (createFile) {
        formData.append("image", createFile)
      }

      const response = await fetch("/api/guides", { method: "POST", body: formData })
      const payload = (await response.json()) as { error?: string; guide?: GuideItem }

      if (!response.ok || !payload.guide) {
        throw new Error(payload.error ?? "가이드 등록 중 오류가 발생했습니다.")
      }

      const nextGuide = payload.guide
      setGuides((current) => [...current, nextGuide].sort((a, b) => a.knotType.localeCompare(b.knotType) || a.step - b.step))
      setDrafts((current) => ({
        ...current,
        [nextGuide.id]: {
          knotType: nextGuide.knotType,
          step: String(nextGuide.step),
          description: nextGuide.description,
          imagePath: nextGuide.imagePath,
          file: null,
        },
      }))
      setCreateStep(String(nextGuide.step + 1))
      setCreateDescription("")
      setCreateFile(null)
      setMessage("가이드 단계가 등록되었습니다.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "가이드 등록 중 오류가 발생했습니다.")
    } finally {
      setSavingCreate(false)
    }
  }

  const updateDraft = (guideId: number, patch: Partial<EditDraft>) => {
    setDrafts((current) => ({
      ...current,
      [guideId]: {
        ...current[guideId],
        ...patch,
      },
    }))
  }

  const handleUpdate = async (guideId: number) => {
    const draft = drafts[guideId]

    if (!draft) {
      return
    }

    setUpdatingId(guideId)
    setMessage(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("id", String(guideId))
      formData.append("knotType", draft.knotType)
      formData.append("step", draft.step)
      formData.append("description", draft.description)
      formData.append("existingImagePath", draft.imagePath)

      if (draft.file) {
        formData.append("image", draft.file)
      }

      const response = await fetch("/api/guides", { method: "PUT", body: formData })
      const payload = (await response.json()) as { error?: string; guide?: GuideItem }

      if (!response.ok || !payload.guide) {
        throw new Error(payload.error ?? "가이드 수정 중 오류가 발생했습니다.")
      }

      const nextGuide = payload.guide
      setGuides((current) => current.map((guide) => (guide.id === guideId ? nextGuide : guide)))
      setDrafts((current) => ({
        ...current,
        [guideId]: {
          knotType: nextGuide.knotType,
          step: String(nextGuide.step),
          description: nextGuide.description,
          imagePath: nextGuide.imagePath,
          file: null,
        },
      }))
      setMessage(`가이드 ${nextGuide.step}단계를 수정했습니다.`)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "가이드 수정 중 오류가 발생했습니다.")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">가이드 등록</h2>
          <p className="text-lg text-slate-500">단계 사진과 설명을 등록하면 작업자 가이드 화면에 바로 반영됩니다.</p>
        </div>

        {!dbConfigured ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-700">
            DATABASE_URL 또는 POSTGRES_URL을 설정하면 가이드 저장과 이미지 업로드를 사용할 수 있습니다.
          </div>
        ) : null}

        {message ? <p className="mt-4 text-lg font-semibold text-pass">{message}</p> : null}
        {error ? <p className="mt-4 text-lg font-semibold text-fail">{error}</p> : null}

        <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-lg font-bold text-slate-800">매듭 종류</span>
            <select
              value={createKnotType}
              onChange={(event) => setCreateKnotType(event.target.value as KnotGuideType)}
              className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
            >
              {GUIDE_KNOT_TYPES.map((item) => (
                <option key={item.knotType} value={item.knotType}>
                  {item.knotType}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-lg font-bold text-slate-800">단계 번호</span>
            <input
              type="number"
              min="1"
              value={createStep}
              onChange={(event) => setCreateStep(event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-lg font-bold text-slate-800">가이드 설명</span>
            <textarea
              rows={4}
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[20px] text-slate-900 outline-none transition focus:border-slate-900"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-lg font-bold text-slate-800">가이드 사진</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCreateFile(event.target.files?.[0] ?? null)}
              className="block w-full text-lg text-slate-700"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!dbConfigured || savingCreate}
              className="min-h-14 rounded-2xl bg-slate-900 px-6 py-3 text-lg font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {savingCreate ? "등록 중..." : "가이드 등록"}
            </button>
          </div>
        </form>
      </section>

      {groupedGuides.map((group) => (
        <section key={group.knotType} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{group.knotType}</h2>
            <p className="text-lg text-slate-500">{group.subtitle}</p>
          </div>

          <div className="space-y-4">
            {group.guides.map((guide) => {
              const draft = drafts[guide.id]

              if (!draft) {
                return null
              }

              return (
                <article key={guide.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                  <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                    <img src={draft.imagePath} alt={`${guide.knotType} ${guide.step}단계`} className="w-full rounded-2xl border border-slate-200 bg-white object-cover" />
                    <div className="grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="block text-base font-bold text-slate-700">매듭 종류</span>
                          <select
                            value={draft.knotType}
                            onChange={(event) => updateDraft(guide.id, { knotType: event.target.value as KnotGuideType })}
                            className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-900"
                          >
                            {GUIDE_KNOT_TYPES.map((item) => (
                              <option key={item.knotType} value={item.knotType}>
                                {item.knotType}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="block text-base font-bold text-slate-700">단계 번호</span>
                          <input
                            type="number"
                            min="1"
                            value={draft.step}
                            onChange={(event) => updateDraft(guide.id, { step: event.target.value })}
                            className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-900"
                          />
                        </label>
                      </div>

                      <label className="space-y-2">
                        <span className="block text-base font-bold text-slate-700">설명</span>
                        <textarea
                          rows={4}
                          value={draft.description}
                          onChange={(event) => updateDraft(guide.id, { description: event.target.value })}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[18px] text-slate-900 outline-none transition focus:border-slate-900"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="block text-base font-bold text-slate-700">새 이미지 업로드</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => updateDraft(guide.id, { file: event.target.files?.[0] ?? null })}
                          className="block w-full text-base text-slate-700"
                        />
                      </label>

                      <div>
                        <button
                          type="button"
                          onClick={() => void handleUpdate(guide.id)}
                          disabled={!dbConfigured || updatingId === guide.id}
                          className="min-h-12 rounded-2xl bg-slate-900 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                          {updatingId === guide.id ? "수정 중..." : "가이드 수정"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
