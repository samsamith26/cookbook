import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/owners";
import { createClient } from "@/lib/supabase/server";
import { updateRecipe } from "@/lib/actions/recipes";
import RecipeForm from "@/components/RecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user?.isOwner) redirect("/login");

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

  const updateWithId = updateRecipe.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-3xl font-semibold text-amber-900">Edit recipe</h1>
      <RecipeForm action={updateWithId} recipe={recipe} submitLabel="Save changes" />
    </div>
  );
}
