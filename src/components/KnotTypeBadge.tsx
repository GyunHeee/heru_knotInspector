import type { WorkerKnotType } from "@/lib/workerProfilesShared"

type KnotTypeBadgeProps = {
  knotType: WorkerKnotType
}

const KNOT_TYPE_STYLES: Record<WorkerKnotType, string> = {
  "동심결 매듭": "bg-emerald-100 text-emerald-800",
  "매화 매듭": "bg-rose-100 text-rose-800",
  "공통": "bg-slate-200 text-slate-800",
}

// 담당 매듭 종류를 배지 형태로 강조해 보여주는 컴포넌트입니다.
export default function KnotTypeBadge({ knotType }: KnotTypeBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${KNOT_TYPE_STYLES[knotType]}`}>
      {knotType}
    </span>
  )
}
