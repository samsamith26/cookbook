import { createClient } from "@/lib/supabase/server";
import RecipeCard from "@/components/RecipeCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBox from "@/components/SearchBox";
import { CATEGORIES } from "@/lib/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("recipes")
    .select("id, title, category, recipe_images(storage_path, is_primary)")
    .order("title");

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }

  const { data: recipes, error } = await query;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold text-amber-900">Recipes</h1>
        <SearchBox defaultValue={q ?? ""} category={category} />
      </div>

      <CategoryFilter selected={category} q={q} />

      {error && (
        <p className="mt-6 text-red-700">Could not load recipes: {error.message}</p>
      )}

      {recipes && recipes.length === 0 && (
        <p className="mt-12 text-center text-stone-500">No recipes found.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {recipes?.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
