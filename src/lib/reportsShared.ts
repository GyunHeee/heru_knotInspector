export type ReportType = "HEALTH" | "MATERIAL" | "EQUIPMENT" | "OTHER"
export type ReportStatus = "PENDING" | "DONE"

export type ReportItem = {
  id: number
  workerId: string
  workerName: string
  type: ReportType
  typeLabel: string
  status: ReportStatus
  statusLabel: string
  createdAt: string
}

export type ReportCreateInput = {
  workerId: string
  type: ReportType
}

export const REPORT_TYPE_OPTIONS: Array<{
  type: ReportType
  label: string
  iconText: string
  accentClass: string
}> = [
  { type: "HEALTH", label: "몸 불편", iconText: "몸", accentClass: "bg-rose-100 text-rose-600" },
  { type: "MATERIAL", label: "재료 부족", iconText: "재", accentClass: "bg-amber-100 text-amber-700" },
  { type: "EQUIPMENT", label: "장비 이상", iconText: "장", accentClass: "bg-sky-100 text-sky-700" },
  { type: "OTHER", label: "기타", iconText: "기", accentClass: "bg-slate-200 text-slate-700" },
]

export function getReportTypeLabel(type: ReportType) {
  return REPORT_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? type
}

export function getReportStatusLabel(status: ReportStatus) {
  return status === "DONE" ? "처리완료" : "미처리"
}
