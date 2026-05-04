"use client";

type KnotSelectorProps = {
  selectedKnot: string;
  onSelect: (knot: "동심결 매듭" | "매화 매듭") => void;
};

// 작업자가 큰 버튼으로 매듭 종류를 고를 수 있는 선택 컴포넌트입니다.
export default function KnotSelector({
  selectedKnot,
  onSelect,
}: KnotSelectorProps) {
  const knotTypes = ["동심결 매듭", "매화 매듭"] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {knotTypes.map((knotType) => {
        const isSelected = selectedKnot === knotType;

        return (
          <button
            key={knotType}
            type="button"
            onClick={() => onSelect(knotType)}
            className={`min-h-16 rounded-2xl border-2 px-6 py-5 text-xl font-bold transition ${
              isSelected
                ? "border-sky-600 bg-sky-600 text-white shadow-panel"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-400"
            }`}
          >
            {knotType}
          </button>
        );
      })}
    </div>
  );
}
