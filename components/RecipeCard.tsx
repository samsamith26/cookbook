import Link from "next/link";
import Image from "next/image";
import type { RecipeCardData } from "@/lib/types";

export default function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-4/3 bg-amber-100">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
        )}
      </div>
      <div className="p-3">
        <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
          {recipe.category}
        </span>
        <h3 className="mt-1 font-serif text-lg font-medium text-stone-900 group-hover:text-amber-800">
          {recipe.title}
        </h3>
      </div>
    </Link>
  );
}
