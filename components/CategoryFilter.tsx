import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export default function CategoryFilter({
  selected,
  q,
}: {
  selected?: string;
  q?: string;
}) {
  const qParam = q ? `q=${encodeURIComponent(q)}` : "";

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/${qParam ? `?${qParam}` : ""}`}
        className={`rounded-full px-3 py-1 text-sm ${
          !selected ? "bg-amber-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/?category=${encodeURIComponent(cat)}${qParam ? `&${qParam}` : ""}`}
          className={`rounded-full px-3 py-1 text-sm ${
            selected === cat
              ? "bg-amber-700 text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}
