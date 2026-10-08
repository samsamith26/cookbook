"use client";

import { useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { CATEGORIES } from "@/lib/types";
import type { Recipe } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  recipe?: Recipe;
  submitLabel: string;
};

const UPLOAD_MAX_DIMENSION = 2400;

/**
 * Shrinks a picked photo in the browser before upload so full-size phone
 * photos stay under the server's request size limit. The server re-compresses
 * it again (lib/images.ts) before committing. Falls back to the original file
 * if the browser can't decode it.
 */
async function downscale(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, UPLOAD_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
  const input = e.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  const smaller = await downscale(file);
  if (smaller === file) return;
  const transfer = new DataTransfer();
  transfer.items.add(smaller);
  input.files = transfer.files;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function RecipeForm({ action, recipe, submitLabel }: Props) {
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients.length ? recipe.ingredients : [""]
  );
  const [steps, setSteps] = useState<string[]>(recipe?.steps.length ? recipe.steps : [""]);

  const hasExistingImage = !!recipe?.images.length;

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
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="block text-sm"
        />
        {hasExistingImage && (
          <p className="mt-1 text-xs text-stone-500">
            Uploading a new photo will make it the main photo for this recipe.
          </p>
        )}
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
