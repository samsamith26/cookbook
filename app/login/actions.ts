"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession } from "@/lib/session";

// Only allow same-site relative paths, so ?next= can't redirect off-site.
function safeNext(value: FormDataEntryValue | null): string {
  const next = String(value || "/");
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export async function signIn(formData: FormData) {
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));

  if (!password || !checkPassword(password)) {
    // Small fixed delay to slow down guessing.
    await new Promise((r) => setTimeout(r, 1000));
    redirect(
      `/login?error=${encodeURIComponent("Incorrect password.")}&next=${encodeURIComponent(next)}`
    );
  }

  await createSession();
  redirect(next);
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
