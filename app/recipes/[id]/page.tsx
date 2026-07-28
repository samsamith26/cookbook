import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/owners";
import { recipeImageUrl } from "@/lib/storage";
import type { RecipeIngredient, RecipeStep, RecipeImage } from "@/lib/types";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      `*,
      recipe_ingredients(id, text, sort_order),
      recipe_steps(id, step_number, text),
      recipe_images(id, storage_path, is_primary)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();

  const user = await getCurrentUser();

  const ingredients = [...(recipe.recipe_ingredients as RecipeIngredient[])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const steps = [...(recipe.recipe_steps as RecipeStep[])].sort(
    (a, b) => a.step_number - b.step_number
  );
  const images = recipe.recipe_images as RecipeImage[];

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
            {recipe.category}
          </span>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-amber-900">
            {recipe.title}
          </h1>
          {recipe.source_page && (
            <p className="mt-1 text-xs text-stone-400">Cookbook page {recipe.source_page}</p>
          )}
        </div>
        {user?.isOwner && (
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="shrink-0 rounded-md border border-amber-700 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
          >
            Edit
          </Link>
        )}
      </div>

      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-md bg-amber-100"
            >
              <Image
                src={recipeImageUrl(img.storage_path)}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {recipe.notes && (
        <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm italic text-stone-700">
          {recipe.notes}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-2 font-serif text-xl font-semibold text-stone-900">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5 text-stone-800">
          {ingredients.map((ing) => (
            <li key={ing.id}>{ing.text}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold text-stone-900">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-stone-800">
          {steps.map((step) => (
            <li key={step.id}>{step.text}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
