export type WorkerKnotType = "동심결 매듭" | "매화 매듭" | "공통"

export type WorkerProfile = {
  id: string
  name: string
  phone: string
  knotType: WorkerKnotType
  note: string
  active: boolean
  createdAt: string
}

export type WorkerProfileStats = {
  totalProduction: number
  passRate: number
  passCount: number
  failCount: number
}

export type WorkerProfileWithStats = WorkerProfile & {
  stats: WorkerProfileStats
}

export type WorkerProfileCreateInput = {
  name: string
  phone: string
  knotType: WorkerKnotType
  note: string
}

export type WorkerProfileUpdateInput = Partial<WorkerProfileCreateInput> & {
  active?: boolean
}

// 이름 기준 이니셜을 원형 아바타에 표시하기 위한 문자열을 만듭니다.
export function getWorkerInitials(name: string) {
  return name.slice(0, 2)
}
