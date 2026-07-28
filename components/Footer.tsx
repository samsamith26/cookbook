import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import type { CurrentUser } from "@/lib/owners";

export default function Footer({ user }: { user: CurrentUser | null }) {
  return (
    <footer className="border-t border-amber-200 py-4 text-center text-xs text-stone-500">
      {user ? (
        <span>
          Signed in{user.email ? ` as ${user.email}` : ""} · <SignOutButton />
        </span>
      ) : (
        <Link href="/login" className="hover:underline">
          Owner sign in
        </Link>
      )}
    </footer>
  );
}
