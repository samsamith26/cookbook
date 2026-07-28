import { headers } from "next/headers";

/**
 * Derives the current origin from request headers instead of a hardcoded
 * env var, so magic-link redirects work in dev, previews, and prod without
 * extra config.
 */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
