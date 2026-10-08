# Family Cookbook App — Build Spec

**Stack:** Next.js (App Router, TypeScript) + Tailwind + Vercel. No database — data lives as files in this repo.
**Access model:** Public read (no login required to browse/search/view). Owner-only write via a single shared password (`OWNER_PASSWORD`) and a signed HTTP-only session cookie.
**Data:** `data/recipes.json` (51 recipes across 5 categories) and photos in `public/images/recipes/<recipe-id>/`.

---

## 1. Data

Each entry in `data/recipes.json` holds the recipe's fields plus its `ingredients` (plain text lines), `steps` (in order) and `images` (`{ src, is_primary }`, with `src` pointing at `/images/recipes/...`). `lib/recipes.ts` reads it.

## 2. Writes

Add/edit/delete in production commit `data/recipes.json` (and any photo, compressed with sharp) to the GitHub repo in one commit via the GitHub API, which triggers a Vercel redeploy — changes appear about a minute later. In local dev, saves write the files directly. See `lib/repo-writer.ts` and `.env.example`.

No scaling/serving-adjustment feature in v1 — ingredients are plain text lines as transcribed, not parsed into amount/unit/name.

## 3. Core pages

- **`/` — Browse**: grid of recipe cards (title, category, primary image if present). Search by title, filter by category. No login required.
- **`/recipes/[id]` — Detail**: full recipe — image(s), ingredients list, numbered steps, notes/attribution if present. No login required. Edit button visible only if logged in as an owner.
- **`/recipes/new` — Add**: owner-only. Form for title, category (select from the 5), ingredients (dynamic list of lines), steps (dynamic ordered list), notes, image upload. Redirect to login if not an owner.
- **`/recipes/[id]/edit` — Edit**: owner-only, same form pre-filled. Same redirect behavior.
- **`/login` — Password sign-in**: minimal, not prominently linked from the public UI (small footer link is enough — this isn't a consumer app needing a visible auth funnel).

## 4. Auth logic

- One shared owner password (`OWNER_PASSWORD`); `/login` sets a session cookie signed with `SESSION_SECRET` (`lib/session.ts`)
- The session decides whether to render Edit/Add controls, and `/recipes/new` and `/recipes/[id]/edit` redirect to `/login` without it
- Every Server Action that writes calls `requireOwner()` server-side — that is the security boundary, not the hidden buttons

## 5. Nice-to-haves (include if time allows, not blocking)

- Print-friendly view for a single recipe (a lot of family cookbook use is "pull this up while cooking")
- Category badge colors for quick visual scanning on the browse grid
- Simple image lightbox on the detail page if a recipe has multiple photos

## 6. Explicitly out of scope for v1

- Serving-size scaling / ingredient quantity math
- Public sign-up flow (only the owners who know the password get write access)
- Comments, ratings, or any multi-user social features
