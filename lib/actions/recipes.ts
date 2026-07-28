"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";
import { RECIPE_IMAGES_BUCKET } from "@/lib/storage";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function parseLines(values: FormDataEntryValue[]): string[] {
  return values.map((v) => String(v).trim()).filter((v) => v.length > 0);
}

function validateTitleAndCategory(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!title) {
    throw new Error("Title is required.");
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    throw new Error("Please select a valid category.");
  }

  return { title, category, notes };
}

async function uploadImageIfPresent(
  supabase: SupabaseServerClient,
  recipeId: string,
  formData: FormData
) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${recipeId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  // Only one primary image in v1: demote any existing ones, then add the new one.
  await supabase
    .from("recipe_images")
    .update({ is_primary: false })
    .eq("recipe_id", recipeId);

  const { error: imageRowError } = await supabase
    .from("recipe_images")
    .insert({ recipe_id: recipeId, storage_path: path, is_primary: true });
  if (imageRowError) throw new Error(imageRowError.message);
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { title, category, notes } = validateTitleAndCategory(formData);
  const ingredients = parseLines(formData.getAll("ingredient"));
  const steps = parseLines(formData.getAll("step"));

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({ title, category, notes, created_by: user.id })
    .select("id")
    .single();

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message ?? "Could not create the recipe.");
  }

  if (ingredients.length > 0) {
    const { error } = await supabase
      .from("recipe_ingredients")
      .insert(ingredients.map((text, i) => ({ recipe_id: recipe.id, text, sort_order: i })));
    if (error) throw new Error(error.message);
  }

  if (steps.length > 0) {
    const { error } = await supabase
      .from("recipe_steps")
      .insert(steps.map((text, i) => ({ recipe_id: recipe.id, step_number: i + 1, text })));
    if (error) throw new Error(error.message);
  }

  await uploadImageIfPresent(supabase, recipe.id, formData);

  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.id}`);
  redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { title, category, notes } = validateTitleAndCategory(formData);
  const ingredients = parseLines(formData.getAll("ingredient"));
  const steps = parseLines(formData.getAll("step"));

  const { error: recipeError } = await supabase
    .from("recipes")
    .update({ title, category, notes })
    .eq("id", id);
  if (recipeError) throw new Error(recipeError.message);

  const { error: delIngError } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", id);
  if (delIngError) throw new Error(delIngError.message);

  if (ingredients.length > 0) {
    const { error } = await supabase
      .from("recipe_ingredients")
      .insert(ingredients.map((text, i) => ({ recipe_id: id, text, sort_order: i })));
    if (error) throw new Error(error.message);
  }

  const { error: delStepError } = await supabase
    .from("recipe_steps")
    .delete()
    .eq("recipe_id", id);
  if (delStepError) throw new Error(delStepError.message);

  if (steps.length > 0) {
    const { error } = await supabase
      .from("recipe_steps")
      .insert(steps.map((text, i) => ({ recipe_id: id, step_number: i + 1, text })));
    if (error) throw new Error(error.message);
  }

  await uploadImageIfPresent(supabase, id, formData);

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}
