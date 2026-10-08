"use client";

import { useEffect, useMemo, useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import { filterByCategory, searchRecipes } from "@/lib/recipe-filters";
import type { RecipeCardData } from "@/lib/types";

const DEBOUNCE_MS = 150;

export default function RecipeBrowser({
  recipes,
  initialQuery,
  initialCategory,
}: {
  recipes: RecipeCardData[];
  initialQuery: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string | undefined>(initialCategory);

  // Debounce typing so we don't re-filter on every single keystroke, but
  // clearing the box resolves instantly — no reason to make that wait.
  useEffect(() => {
    if (query === "") {
      setDebouncedQuery("");
      return;
    }
    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  // `recipes` was fetched once on page load. Everything below filters that
  // in-memory list — no network request per keystroke or per category click.
  const filtered = useMemo(
    () => searchRecipes(filterByCategory(recipes, category), debouncedQuery),
    [recipes, category, debouncedQuery]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold text-amber-900">Recipes</h1>
        <SearchBox value={query} onChange={setQuery} />
      </div>

      <CategoryFilter selected={category} onSelect={setCategory} />

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-stone-500">No recipes found.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
