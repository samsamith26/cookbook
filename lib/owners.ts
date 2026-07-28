import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  isOwner: boolean;
};

/**
 * UI-only convenience check ("should I show the Edit button?"). This is
 * NOT the security boundary — Postgres RLS policies (see schema.sql) are
 * what actually stop a non-owner from writing, even if this check were
 * somehow bypassed.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    isOwner: !!ownerRow,
  };
}
