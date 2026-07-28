import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the PKCE code exchange after a magic-link click. Works with
 * Supabase's default email templates unmodified (they route through
 * GoTrue's own /verify endpoint, which redirects here with `?code=`).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) next = "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const message = encodeURIComponent("That sign-in link is invalid or has expired.");
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
