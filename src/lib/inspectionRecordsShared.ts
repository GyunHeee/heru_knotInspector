export type InspectionRecord = {
  id: number
  workerId: string
  workerName: string
  knotType: "동심결 매듭" | "매화 매듭"
  imageData: string | null
  createdAt: string
}

export type InspectionRecordCreateInput = {
  workerId: string
  workerName: string
  knotType: "동심결 매듭" | "매화 매듭"
  imageData: string | null
}

export function formatInspectionDateTime(createdAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(createdAt))
}
