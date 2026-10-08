"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { CATEGORIES } from "@/lib/types";
import type { Recipe } from "@/lib/types";
import { requireOwner } from "@/lib/session";
import { compressImage } from "@/lib/images";
import { commitRecipes, writesAreDeferred, type FileChange } from "@/lib/repo-writer";

function parseLines(values: FormDataEntryValue[]): string[] {
  return values.map((v) => String(v).trim()).filter((v) => v.length > 0);
}

function parseForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!title) {
    throw new Error("Title is required.");
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    throw new Error("Please select a valid category.");
  }

  return {
    title,
    category,
    notes,
    ingredients: parseLines(formData.getAll("ingredient")),
    steps: parseLines(formData.getAll("step")),
  };
}

/** Compresses the uploaded photo (if any) and returns the file to commit + its public src. */
async function prepareImage(recipeId: string, formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;

  const src = `/images/recipes/${recipeId}/${randomUUID()}.jpg`;
  const change: FileChange = { path: `public${src}`, content: await compressImage(file) };
  return { src, change };
}

// Only one primary image: demote any existing ones, then add the new one.
function withNewPrimaryImage(recipe: Recipe, src: string): Recipe["images"] {
  return [...recipe.images.map((img) => ({ ...img, is_primary: false })), { src, is_primary: true }];
}

function afterSave(path: string) {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}saved=1`);
}

export async function createRecipe(formData: FormData) {
  await requireOwner("/recipes/new");

  const fields = parseForm(formData);
  const id = randomUUID();
  const image = await prepareImage(id, formData);
  const now = new Date().toISOString();

  await commitRecipes(`Add recipe: ${fields.title}`, (recipes) => {
    const recipe: Recipe = {
      id,
      ...fields,
      description: null,
      source_page: null,
      created_at: now,
      updated_at: now,
      images: [],
    };
    if (image) recipe.images = withNewPrimaryImage(recipe, image.src);
    return { recipes: [...recipes, recipe], files: image ? [image.change] : [] };
  });

  // In production the new page doesn't exist until the redeploy finishes.
  afterSave(writesAreDeferred() ? "/" : `/recipes/${id}`);
}

export async function updateRecipe(id: string, formData: FormData) {
  await requireOwner(`/recipes/${id}/edit`);

  const fields = parseForm(formData);
  const image = await prepareImage(id, formData);

  await commitRecipes(`Update recipe: ${fields.title}`, (recipes) => {
    const existing = recipes.find((r) => r.id === id);
    if (!existing) throw new Error("That recipe no longer exists.");
    const updated: Recipe = {
      ...existing,
      ...fields,
      images: image ? withNewPrimaryImage(existing, image.src) : existing.images,
      updated_at: new Date().toISOString(),
    };
    return {
      recipes: recipes.map((r) => (r.id === id ? updated : r)),
      files: image ? [image.change] : [],
    };
  });

  afterSave(`/recipes/${id}`);
}

export async function deleteRecipe(id: string) {
  await requireOwner(`/recipes/${id}/edit`);

  await commitRecipes(`Delete recipe ${id}`, (recipes) => {
    const existing = recipes.find((r) => r.id === id);
    if (!existing) throw new Error("That recipe no longer exists.");
    const files: FileChange[] = existing.images
      .filter((img) => img.src.startsWith("/images/recipes/"))
      .map((img) => ({ path: `public${img.src}`, delete: true }));
    return { recipes: recipes.filter((r) => r.id !== id), files };
  });

  revalidatePath("/", "layout");
  redirect("/?deleted=1");
}
