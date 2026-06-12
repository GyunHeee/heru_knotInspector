export type KnotGuideType = "동심결 매듭" | "매화 매듭"

export type GuideItem = {
  id: number
  knotType: KnotGuideType
  step: number
  imagePath: string
  description: string
}

export type GuideInput = {
  knotType: KnotGuideType
  step: number
  description: string
  imagePath?: string
}

export const GUIDE_KNOT_TYPES: Array<{
  knotType: KnotGuideType
  slug: string
  subtitle: string
}> = [
  {
    knotType: "동심결 매듭",
    slug: "dongsim",
    subtitle: "대칭과 중심 조임이 중요한 기본 매듭입니다.",
  },
  {
    knotType: "매화 매듭",
    slug: "maehwa",
    subtitle: "꽃잎 간격과 다섯 단계 균형을 맞추는 매듭입니다.",
  },
]

export function getGuideSlug(knotType: KnotGuideType) {
  return GUIDE_KNOT_TYPES.find((item) => item.knotType === knotType)?.slug ?? "guide"
}

export function isGuideKnotType(value: string): value is KnotGuideType {
  return GUIDE_KNOT_TYPES.some((item) => item.knotType === value)
}
