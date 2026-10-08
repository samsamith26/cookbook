import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Recipe, RecipeCardData } from "@/lib/types";

export { searchRecipes, filterByCategory } from "@/lib/recipe-filters";

export const RECIPES_FILE = "data/recipes.json";

let cache: Recipe[] | null = null;

/**
 * All recipes, sorted by title. In production the file only changes via a
 * commit + redeploy, so it's read once per server instance. In dev it's
 * re-read every call so local edits (lib/repo-writer) show up immediately.
 */
export async function listRecipes(): Promise<Recipe[]> {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const raw = await readFile(path.join(process.cwd(), RECIPES_FILE), "utf-8");
  const recipes = (JSON.parse(raw) as Recipe[]).sort((a, b) => a.title.localeCompare(b.title));
  cache = recipes;
  return recipes;
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  return (await listRecipes()).find((r) => r.id === id) ?? null;
}

export function primaryImage(recipe: Recipe): string | null {
  return (recipe.images.find((img) => img.is_primary) ?? recipe.images[0])?.src ?? null;
}

export function toCardData(recipe: Recipe): RecipeCardData {
  return { id: recipe.id, title: recipe.title, category: recipe.category, image: primaryImage(recipe) };
}
