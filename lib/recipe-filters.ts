// Pure search/filter helpers. Kept separate from lib/recipes.ts (which reads
// the filesystem) so the client-side browser can import them too.

export function searchRecipes<T extends { title: string }>(recipes: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  return q ? recipes.filter((r) => r.title.toLowerCase().includes(q)) : recipes;
}

export function filterByCategory<T extends { category: string }>(
  recipes: T[],
  category: string | undefined
): T[] {
  return category ? recipes.filter((r) => r.category === category) : recipes;
}
