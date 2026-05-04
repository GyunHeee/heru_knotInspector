export type HistoryItem = {
  id: number;
  worker: string;
  knotType: "동심결 매듭" | "매화 매듭";
  result: "PASS" | "FAIL";
  reason: string | null;
  accuracy: number;
  time: string;
};

export const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, worker: "홍길동", knotType: "동심결 매듭", result: "PASS", reason: null, accuracy: 94, time: "08:15" },
  { id: 2, worker: "김순자", knotType: "매화 매듭", result: "FAIL", reason: "꽃잎 간격 불균형", accuracy: 84, time: "08:42" },
  { id: 3, worker: "박영희", knotType: "동심결 매듭", result: "PASS", reason: null, accuracy: 92, time: "09:03" },
  { id: 4, worker: "이철수", knotType: "매화 매듭", result: "FAIL", reason: "전체 크기 기준 초과", accuracy: 87, time: "09:24" },
  { id: 5, worker: "홍길동", knotType: "동심결 매듭", result: "FAIL", reason: "중심 매듭 조임 불량", accuracy: 88, time: "10:10" },
  { id: 6, worker: "김순자", knotType: "매화 매듭", result: "PASS", reason: null, accuracy: 96, time: "10:37" },
  { id: 7, worker: "박영희", knotType: "동심결 매듭", result: "FAIL", reason: "좌우 루프 대칭 불량", accuracy: 91, time: "11:05" },
  { id: 8, worker: "이철수", knotType: "매화 매듭", result: "PASS", reason: null, accuracy: 92, time: "11:48" },
  { id: 9, worker: "홍길동", knotType: "동심결 매듭", result: "PASS", reason: null, accuracy: 89, time: "13:16" },
  { id: 10, worker: "김순자", knotType: "매화 매듭", result: "FAIL", reason: "꽃잎 수 부족 (4개 → 필요 5개)", accuracy: 83, time: "14:02" },
];
