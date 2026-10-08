import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cookbook_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

/** Constant-time comparison against OWNER_PASSWORD (hashing equalizes lengths). */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.OWNER_PASSWORD;
  if (!expected) throw new Error("OWNER_PASSWORD is not set.");
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * True if the request carries a valid, unexpired, correctly signed session
 * cookie. Used both for UI (show Edit/Add) and as the server-side gate on
 * every write — see requireOwner().
 */
export async function isOwner(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "owner";
  } catch {
    return false;
  }
}

/** Call at the top of every owner-only page and Server Action. */
export async function requireOwner(next?: string): Promise<void> {
  if (!(await isOwner())) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
}
