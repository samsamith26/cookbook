import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { getRecipe } from "@/lib/recipes";
import { deleteRecipe, updateRecipe } from "@/lib/actions/recipes";
import RecipeForm from "@/components/RecipeForm";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requireOwner(`/recipes/${id}/edit`);

  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const updateWithId = updateRecipe.bind(null, id);
  const deleteWithId = deleteRecipe.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-3xl font-semibold text-amber-900">Edit recipe</h1>
      <RecipeForm action={updateWithId} recipe={recipe} submitLabel="Save changes" />
      <div className="mt-10 border-t border-stone-200 pt-6">
        <DeleteRecipeButton action={deleteWithId} title={recipe.title} />
      </div>
    </div>
  );
}
