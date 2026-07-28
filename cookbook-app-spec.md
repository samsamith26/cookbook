# Family Cookbook App — Build Spec

**Stack:** Next.js (App Router, TypeScript) + Tailwind + Supabase (Postgres/Auth/Storage) + Vercel
**Access model:** Public read (no login required to browse/search/view). Owner-only write (two accounts: me + Mom), via Supabase magic-link auth.
**Data:** Already transcribed and reviewed — `recipes.json` (53 pages, ~40+ recipes across 5 categories). This is real seed data, not placeholders.

---

## 1. Schema

Already written — run `schema.sql` as-is in the Supabase SQL editor first. It creates:
- `recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_images`, `owners`
- RLS: public `select` on everything, `owners`-only `insert`/`update`/`delete`
- A public-read/owner-write `recipe-images` storage bucket

After running it: sign up the two owner emails via magic link, then insert their `auth.users` ids into `owners`.

## 2. Seed data

`recipes.json` is ready to import. Write a one-time seed script that:
1. Reads `recipes.json`
2. Inserts each recipe into `recipes` (title, category, notes, source_page)
3. Inserts its ingredient lines into `recipe_ingredients` with `sort_order`
4. Inserts its steps into `recipe_steps` with `step_number`
5. Run once against Supabase, then this script isn't needed again (new recipes go through the app's Add form from here on)

No scaling/serving-adjustment feature in v1 — ingredients are plain text lines as transcribed, not parsed into amount/unit/name.

## 3. Core pages

- **`/` — Browse**: grid of recipe cards (title, category, primary image if present). Search by title, filter by category. No login required.
- **`/recipes/[id]` — Detail**: full recipe — image(s), ingredients list, numbered steps, notes/attribution if present. No login required. Edit button visible only if logged in as an owner.
- **`/recipes/new` — Add**: owner-only. Form for title, category (select from the 5), ingredients (dynamic list of lines), steps (dynamic ordered list), notes, image upload. Redirect to login if not an owner.
- **`/recipes/[id]/edit` — Edit**: owner-only, same form pre-filled. Same redirect behavior.
- **`/login` — Magic link sign-in**: minimal, not prominently linked from the public UI (small footer link is enough — this isn't a consumer app needing a visible auth funnel).

## 4. Auth logic

- Supabase Auth, magic link only (no password flow to build)
- On the client, check `auth.uid()` against the `owners` table to decide whether to render Edit/Add controls and to gate the `/new` and `/edit` routes
- RLS is the real enforcement layer (already in schema.sql) — client-side checks are just for UI/UX, not treated as the security boundary

## 5. Nice-to-haves (include if time allows, not blocking)

- Print-friendly view for a single recipe (a lot of family cookbook use is "pull this up while cooking")
- Category badge colors for quick visual scanning on the browse grid
- Simple image lightbox on the detail page if a recipe has multiple photos

## 6. Explicitly out of scope for v1

- Serving-size scaling / ingredient quantity math
- Public sign-up flow (only the two pre-set owners can ever get write access)
- Comments, ratings, or any multi-user social features

---

## Suggested first prompt to Claude Code

> "Do your research first (Next.js App Router + Supabase auth/RLS patterns, Supabase Storage for images), then build the full cookbook-app-spec.md in one pass: scaffold the Next.js + Tailwind + Supabase project, run schema.sql, write and run the seed script against recipes.json, and build all the pages in section 3 with the auth logic in section 4. Public read, owner-only write, magic-link auth. Ask me before deploying to Vercel."

Attach `cookbook-app-spec.md`, `schema.sql`, and `recipes.json` when you kick this off.
