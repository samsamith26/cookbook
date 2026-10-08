import RecipeBrowser from "@/components/RecipeBrowser";
import SaveNotice from "@/components/SaveNotice";
import { listRecipes, toCardData } from "@/lib/recipes";
import { CATEGORIES } from "@/lib/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; saved?: string; deleted?: string }>;
}) {
  const { q, category, saved, deleted } = await searchParams;

  // Loaded once per page load, then searched/filtered entirely client-side
  // (see RecipeBrowser) — nothing re-runs per keystroke or per category click.
  const recipes = (await listRecipes()).map(toCardData);

  const initialCategory =
    category && (CATEGORIES as readonly string[]).includes(category) ? category : undefined;

  return (
    <>
      <SaveNotice saved={saved} deleted={deleted} />
      <RecipeBrowser recipes={recipes} initialQuery={q ?? ""} initialCategory={initialCategory} />
    </>
  );
}
