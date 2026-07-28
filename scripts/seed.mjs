// One-time seed script: imports recipes.json into recipes / recipe_ingredients
// / recipe_steps using the service-role key (bypasses RLS, since no owners
// exist yet at this point). Not needed again after the first successful run
// — new recipes go through the app's Add form from here on.
//
// Usage: npm run seed   (loads .env.local via `node --env-file`)

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Run this script with: npm run seed");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const raw = await readFile(new URL("../recipes.json", import.meta.url), "utf-8");
  const recipes = JSON.parse(raw);

  const { count, error: countError } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Could not check existing recipes:", countError.message);
    process.exit(1);
  }

  if (count && count > 0) {
    console.log(`recipes table already has ${count} row(s). Skipping seed to avoid duplicates.`);
    console.log("Delete existing rows first if you want to re-seed.");
    return;
  }

  console.log(`Seeding ${recipes.length} recipes...`);
  let failures = 0;

  for (const recipe of recipes) {
    const { data: inserted, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: recipe.title,
        category: recipe.category,
        notes: recipe.notes || null,
        source_page: recipe.source_page ?? null,
      })
      .select("id")
      .single();

    if (recipeError || !inserted) {
      console.error(`Failed to insert "${recipe.title}":`, recipeError?.message);
      failures++;
      continue;
    }

    const recipeId = inserted.id;

    if (recipe.ingredients?.length) {
      const { error } = await supabase
        .from("recipe_ingredients")
        .insert(
          recipe.ingredients.map((text, i) => ({ recipe_id: recipeId, text, sort_order: i }))
        );
      if (error) console.error(`  ingredients error for "${recipe.title}":`, error.message);
    }

    if (recipe.steps?.length) {
      const { error } = await supabase
        .from("recipe_steps")
        .insert(recipe.steps.map((text, i) => ({ recipe_id: recipeId, step_number: i + 1, text })));
      if (error) console.error(`  steps error for "${recipe.title}":`, error.message);
    }

    console.log(`  ✓ ${recipe.title} (page ${recipe.source_page})`);
  }

  console.log(`Done. ${recipes.length - failures}/${recipes.length} recipes seeded.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
