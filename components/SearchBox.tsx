export default function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search recipes by title..."
      className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none sm:w-64"
      aria-label="Search recipes by title"
    />
  );
}
