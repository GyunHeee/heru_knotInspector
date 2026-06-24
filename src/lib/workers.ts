export type Worker = {
  id: string
  name: string
  scoreReference: string
}

// 출퇴근과 검사 기능에서 공통으로 사용할 작업자 기준 정보입니다.
export const WORKERS: Worker[] = [
  { id: "K-002", name: "김상희", scoreReference: "26점 / 정상 근접" },
  { id: "K-003", name: "김경희", scoreReference: "21점 / MCI 의심 범위" },
  { id: "K-004", name: "최복술", scoreReference: "13점 / 확인 필요" },
  { id: "K-005", name: "김경애", scoreReference: "28점 / 정상 범위" },
  { id: "K-006", name: "양인애", scoreReference: "25점 / MCI 의심 범위" },
  { id: "K-007", name: "이금자", scoreReference: "19점 / MCI 의심 범위" },
  { id: "K-008", name: "김영숙", scoreReference: "정보 없음" },
]

export function getWorkerById(workerId: string) {
  return WORKERS.find((worker) => worker.id === workerId) ?? null
}

export function getWorkerName(workerId: string) {
  return getWorkerById(workerId)?.name ?? workerId
}
