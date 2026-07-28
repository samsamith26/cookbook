import { CATEGORIES } from "@/lib/types";

export default function CategoryFilter({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (category?: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-3 py-1 text-sm ${
          !selected ? "bg-amber-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`rounded-full px-3 py-1 text-sm ${
            selected === cat
              ? "bg-amber-700 text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
