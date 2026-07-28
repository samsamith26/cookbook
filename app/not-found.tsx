import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="mb-2 font-serif text-2xl font-semibold text-stone-900">
        Recipe not found
      </h1>
      <p className="mb-4 text-sm text-stone-600">
        It may have been removed, or the link is incorrect.
      </p>
      <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
        Back to all recipes
      </Link>
    </div>
  );
}
