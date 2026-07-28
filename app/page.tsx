import { createClient } from "@/lib/supabase/server";
import RecipeBrowser from "@/components/RecipeBrowser";
import { CATEGORIES } from "@/lib/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  // Fetched once per page load, then searched/filtered entirely client-side
  // (see RecipeBrowser) — no query re-run per keystroke or per category click.
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, category, recipe_images(storage_path, is_primary)")
    .order("title");

  if (error) {
    return <p className="text-red-700">Could not load recipes: {error.message}</p>;
  }

  const initialCategory =
    category && (CATEGORIES as readonly string[]).includes(category) ? category : undefined;

  return (
    <RecipeBrowser
      recipes={recipes ?? []}
      initialQuery={q ?? ""}
      initialCategory={initialCategory}
    />
  );
}
