import type { InspectionRecord } from "@/lib/inspectionRecordsShared"

// 관리자 화면에 표시할 촬영 등록 이력 mock 데이터입니다.
export type HistoryItem = InspectionRecord

export const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, workerId: "K-001", workerName: "오세철", knotType: "동심결 매듭", imageData: null, createdAt: "2026-06-23T08:30:00+09:00" },
  { id: 2, workerId: "K-002", workerName: "김상희", knotType: "매화 매듭", imageData: null, createdAt: "2026-06-23T08:42:00+09:00" },
  { id: 3, workerId: "K-003", workerName: "김경희", knotType: "동심결 매듭", imageData: null, createdAt: "2026-06-23T09:05:00+09:00" },
  { id: 4, workerId: "K-004", workerName: "최복술", knotType: "매화 매듭", imageData: null, createdAt: "2026-06-23T09:18:00+09:00" },
  { id: 5, workerId: "K-005", workerName: "김경애", knotType: "동심결 매듭", imageData: null, createdAt: "2026-06-23T09:47:00+09:00" },
  { id: 6, workerId: "K-006", workerName: "양인애", knotType: "매화 매듭", imageData: null, createdAt: "2026-06-23T10:02:00+09:00" },
  { id: 7, workerId: "K-007", workerName: "이금자", knotType: "동심결 매듭", imageData: null, createdAt: "2026-06-23T10:25:00+09:00" },
  { id: 8, workerId: "K-008", workerName: "김영숙", knotType: "매화 매듭", imageData: null, createdAt: "2026-06-23T10:46:00+09:00" },
  { id: 9, workerId: "K-001", workerName: "오세철", knotType: "동심결 매듭", imageData: null, createdAt: "2026-06-23T11:10:00+09:00" },
  { id: 10, workerId: "K-002", workerName: "김상희", knotType: "매화 매듭", imageData: null, createdAt: "2026-06-23T11:38:00+09:00" },
]

export function getHistorySummary(history: HistoryItem[]) {
  return {
    totalCount: history.length,
    dongsimCount: history.filter((item) => item.knotType === "동심결 매듭").length,
    maehwaCount: history.filter((item) => item.knotType === "매화 매듭").length,
  }
}
