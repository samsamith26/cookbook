import { writesAreDeferred } from "@/lib/repo-writer";

/** Banner shown after a redirect from a save (?saved=1) or delete (?deleted=1). */
export default function SaveNotice({ saved, deleted }: { saved?: string; deleted?: string }) {
  if (!saved && !deleted) return null;
  const verb = deleted ? "Deleted!" : "Saved!";
  const suffix = writesAreDeferred() ? " Changes will appear in about a minute." : "";

  return (
    <p
      role="status"
      className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {verb}
      {suffix}
    </p>
  );
}
