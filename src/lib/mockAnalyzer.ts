export type KnotResult = {
  result: "PASS" | "FAIL";
  accuracy: number;
  reason: string | null;
};

const KNOT_RESULTS: Record<string, KnotResult[]> = {
  "동심결 매듭": [
    { result: "PASS", accuracy: 94, reason: null },
    { result: "PASS", accuracy: 89, reason: null },
    { result: "PASS", accuracy: 92, reason: null },
    { result: "FAIL", accuracy: 91, reason: "좌우 루프 대칭 불량" },
    { result: "FAIL", accuracy: 86, reason: "꼬리 길이 기준 미달 (짧음)" },
    { result: "FAIL", accuracy: 88, reason: "중심 매듭 조임 불량" },
  ],
  "매화 매듭": [
    { result: "PASS", accuracy: 96, reason: null },
    { result: "PASS", accuracy: 92, reason: null },
    { result: "FAIL", accuracy: 84, reason: "꽃잎 간격 불균형" },
    { result: "FAIL", accuracy: 87, reason: "전체 크기 기준 초과" },
    { result: "FAIL", accuracy: 83, reason: "꽃잎 수 부족 (4개 → 필요 5개)" },
  ],
};

export function analyzeKnot(knotType: string): KnotResult {
  const pool = KNOT_RESULTS[knotType];

  if (!pool || pool.length === 0) {
    return {
      result: "FAIL",
      accuracy: 0,
      reason: "알 수 없는 매듭 종류",
    };
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
