"use client";

import { useFormStatus } from "react-dom";

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete recipe"}
    </button>
  );
}

export default function DeleteRecipeButton({
  action,
  title,
}: {
  action: () => void | Promise<void>;
  title: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This can't be undone from the site.`)) e.preventDefault();
      }}
    >
      <Button />
    </form>
  );
}
