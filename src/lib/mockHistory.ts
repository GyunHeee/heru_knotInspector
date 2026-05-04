// 관리자 화면에 표시할 검사 이력 mock 데이터입니다.
export type HistoryItem = {
  id: number
  worker: string
  knotType: "동심결 매듭" | "매화 매듭"
  result: "PASS" | "FAIL"
  reason: string | null
  accuracy: number
  inspectedAt: string
}

export const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, worker: "오세철", knotType: "동심결 매듭", result: "PASS", reason: null, accuracy: 94, inspectedAt: "08:30" },
  { id: 2, worker: "김상희", knotType: "매화 매듭", result: "FAIL", reason: "꽃잎 간격 불균형", accuracy: 84, inspectedAt: "08:42" },
  { id: 3, worker: "김경희", knotType: "동심결 매듭", result: "FAIL", reason: "좌우 루프 대칭 불량", accuracy: 91, inspectedAt: "09:05" },
  { id: 4, worker: "최복술", knotType: "매화 매듭", result: "PASS", reason: null, accuracy: 96, inspectedAt: "09:18" },
  { id: 5, worker: "김경애", knotType: "동심결 매듭", result: "PASS", reason: null, accuracy: 89, inspectedAt: "09:47" },
  { id: 6, worker: "양인애", knotType: "매화 매듭", result: "FAIL", reason: "전체 크기 기준 초과", accuracy: 87, inspectedAt: "10:02" },
  { id: 7, worker: "이금자", knotType: "동심결 매듭", result: "FAIL", reason: "중심 매듭 조임 불량", accuracy: 88, inspectedAt: "10:25" },
  { id: 8, worker: "김영숙", knotType: "매화 매듭", result: "PASS", reason: null, accuracy: 92, inspectedAt: "10:46" },
  { id: 9, worker: "오세철", knotType: "동심결 매듭", result: "FAIL", reason: "꼬리 길이 기준 미달 (짧음)", accuracy: 86, inspectedAt: "11:10" },
  { id: 10, worker: "김상희", knotType: "매화 매듭", result: "PASS", reason: null, accuracy: 95, inspectedAt: "11:38" },
]

export function getHistorySummary(history: HistoryItem[]) {
  const totalCount = history.length
  const passCount = history.filter((item) => item.result === "PASS").length
  const averageAccuracy = Math.round(
    history.reduce((sum, item) => sum + item.accuracy, 0) / totalCount,
  )

  return {
    totalCount,
    passRate: Math.round((passCount / totalCount) * 100),
    averageAccuracy,
  }
}
