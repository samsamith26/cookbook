import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRecipe } from "@/lib/recipes";
import { isOwner } from "@/lib/session";
import SaveNotice from "@/components/SaveNotice";

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const owner = await isOwner();

  return (
    <article className="mx-auto max-w-3xl">
      <SaveNotice saved={saved} />

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
        {owner && (
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="shrink-0 rounded-md border border-amber-700 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
          >
            Edit
          </Link>
        )}
      </div>

      {recipe.images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {recipe.images.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden rounded-md bg-amber-100"
            >
              <Image src={img.src} alt={recipe.title} fill className="object-cover" />
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
          {recipe.ingredients.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold text-stone-900">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-stone-800">
          {recipe.steps.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
