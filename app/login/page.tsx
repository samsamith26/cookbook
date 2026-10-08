import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <h1 className="mb-2 font-serif text-2xl font-semibold text-amber-900">Owner sign in</h1>
      <p className="mb-6 text-sm text-stone-600">Enter the cookbook password to add or edit recipes.</p>

      {params.error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {params.error}
        </p>
      )}

      <form action={signIn} className="space-y-3">
        <input type="hidden" name="next" value={params.next ?? "/"} />
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
