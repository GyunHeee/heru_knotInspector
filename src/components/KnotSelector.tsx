const KNOT_TYPES = [
  {
    title: "동심결 매듭",
    description: "좌우 균형과 중심 조임 상태를 빠르게 확인합니다.",
    accent: "고른 둥근 결",
  },
  {
    title: "매화 매듭",
    description: "꽃잎 간격과 전체 크기 기준을 차분히 살핍니다.",
    accent: "섬세한 꽃잎 결",
  },
] as const

type KnotSelectorProps = {
  selectedKnot: string
  onSelect: (knotType: (typeof KNOT_TYPES)[number]["title"]) => void
}

// 검사할 매듭 종류를 카드 형태로 선택하는 컴포넌트입니다.
export default function KnotSelector({ selectedKnot, onSelect }: KnotSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {KNOT_TYPES.map((knot) => {
        const isSelected = selectedKnot === knot.title

        return (
          <button
            key={knot.title}
            type="button"
            onClick={() => onSelect(knot.title)}
            className={`soft-press min-h-24 rounded-[1.05rem] border px-5 py-5 text-left ${
              isSelected
                ? "border-knot-red bg-knot-red/10 shadow-card ring-2 ring-knot-red/15"
                : "border-knot-sand bg-white/90 hover:border-knot-red/50 hover:bg-knot-paper/70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-knot-ink">{knot.title}</p>
                <p className="mt-2 text-base leading-7 text-knot-brown">{knot.description}</p>
              </div>
              <span
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border text-sm font-black ${
                  isSelected
                    ? "border-knot-red bg-knot-red text-white"
                    : "border-knot-sand bg-knot-ivory text-knot-brown"
                }`}
              >
                {isSelected ? "선택" : "2"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex rounded-full bg-knot-mist px-3 py-1 text-sm font-semibold text-knot-brown">
                {knot.accent}
              </span>
              <span className={`text-base font-bold ${isSelected ? "text-knot-red" : "text-knot-brown"}`}>
                {isSelected ? "검사 준비 완료" : "선택하기"}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
