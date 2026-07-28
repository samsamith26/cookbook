export default function SearchBox({
  defaultValue,
  category,
}: {
  defaultValue: string;
  category?: string;
}) {
  return (
    <form action="/" method="GET" className="flex gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search recipes by title..."
        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none sm:w-64"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        Search
      </button>
    </form>
  );
}
