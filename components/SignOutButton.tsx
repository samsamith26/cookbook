"use client";

import { signOutAction } from "@/app/login/actions";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOutAction()}
      className="underline hover:text-stone-700"
    >
      Sign out
    </button>
  );
}
