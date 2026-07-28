import Link from "next/link";

export default function Header({ isOwner }: { isOwner: boolean }) {
  return (
    <header className="border-b border-amber-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-amber-900">
          Rebec's Cookbook
        </Link>
        {isOwner && (
          <Link
            href="/recipes/new"
            className="shrink-0 rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            + Add Recipe
          </Link>
        )}
      </div>
    </header>
  );
}
