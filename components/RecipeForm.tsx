"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/types";
import type { Recipe, RecipeIngredient, RecipeStep, RecipeImage } from "@/lib/types";

type FormRecipe = Recipe & {
  recipe_ingredients: RecipeIngredient[];
  recipe_steps: RecipeStep[];
  recipe_images: RecipeImage[];
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  recipe?: FormRecipe;
  submitLabel: string;
};

export default function RecipeForm({ action, recipe, submitLabel }: Props) {
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.recipe_ingredients?.length
      ? [...recipe.recipe_ingredients]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => i.text)
      : [""]
  );
  const [steps, setSteps] = useState<string[]>(
    recipe?.recipe_steps?.length
      ? [...recipe.recipe_steps].sort((a, b) => a.step_number - b.step_number).map((s) => s.text)
      : [""]
  );

  const hasExistingImage = recipe?.recipe_images?.some((img) => img.is_primary);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Title</label>
        <input
          name="title"
          required
          defaultValue={recipe?.title}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Category</label>
        <select
          name="category"
          required
          defaultValue={recipe?.category ?? ""}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Ingredients</label>
        <div className="space-y-2">
          {ingredients.map((value, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="ingredient"
                defaultValue={value}
                placeholder="e.g. 2 cups flour"
                className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIngredients((cur) => cur.filter((_, idx) => idx !== i))}
                className="rounded-md px-2 text-stone-400 hover:text-red-600"
                aria-label="Remove ingredient"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIngredients((cur) => [...cur, ""])}
          className="mt-2 text-sm font-medium text-amber-800 hover:underline"
        >
          + Add ingredient line
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Steps</label>
        <div className="space-y-2">
          {steps.map((value, i) => (
            <div key={i} className="flex gap-2">
              <span className="pt-2 text-sm text-stone-400">{i + 1}.</span>
              <textarea
                name="step"
                defaultValue={value}
                rows={2}
                placeholder="Describe this step"
                className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSteps((cur) => cur.filter((_, idx) => idx !== i))}
                className="rounded-md px-2 text-stone-400 hover:text-red-600"
                aria-label="Remove step"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSteps((cur) => [...cur, ""])}
          className="mt-2 text-sm font-medium text-amber-800 hover:underline"
        >
          + Add step
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={recipe?.notes ?? ""}
          placeholder="Family story, attribution, etc."
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Photo</label>
        <input type="file" name="image" accept="image/*" className="block text-sm" />
        {hasExistingImage && (
          <p className="mt-1 text-xs text-stone-500">
            Uploading a new photo will replace the current one.
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
