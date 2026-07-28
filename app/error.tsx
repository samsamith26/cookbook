"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="mb-2 font-serif text-2xl font-semibold text-stone-900">
        Something went wrong
      </h1>
      <p className="mb-4 text-sm text-stone-600">{error.message || "Please try again."}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        Try again
      </button>
    </div>
  );
}
