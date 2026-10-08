import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Footer({ isOwner }: { isOwner: boolean }) {
  return (
    <footer className="border-t border-amber-200 py-4 text-center text-xs text-stone-500">
      {isOwner ? (
        <span>
          Signed in · <SignOutButton />
        </span>
      ) : (
        <Link href="/login" className="hover:underline">
          Owner sign in
        </Link>
      )}
    </footer>
  );
}
