const KNOT_TYPES = ["동심결 매듭", "매화 매듭"] as const

type KnotSelectorProps = {
  selectedKnot: string
  onSelect: (knotType: (typeof KNOT_TYPES)[number]) => void
}

// 검사할 매듭 종류를 큰 버튼으로 선택하는 컴포넌트입니다.
export default function KnotSelector({ selectedKnot, onSelect }: KnotSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {KNOT_TYPES.map((knotType) => {
        const isSelected = selectedKnot === knotType

        return (
          <button
            key={knotType}
            type="button"
            onClick={() => onSelect(knotType)}
            className={`min-h-16 rounded-2xl border-2 px-6 py-5 text-xl font-bold transition ${
              isSelected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-900 hover:border-slate-500"
            }`}
          >
            {knotType}
          </button>
        )
      })}
    </div>
  )
}
