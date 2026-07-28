import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/owners";
import { createRecipe } from "@/lib/actions/recipes";
import RecipeForm from "@/components/RecipeForm";

export default async function NewRecipePage() {
  const user = await getCurrentUser();
  if (!user?.isOwner) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-3xl font-semibold text-amber-900">Add a recipe</h1>
      <RecipeForm action={createRecipe} submitLabel="Save recipe" />
    </div>
  );
}
