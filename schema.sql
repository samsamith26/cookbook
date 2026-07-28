-- ============================================================
-- Cookbook App — Supabase Schema
-- Public read access, owner-only write access
-- ============================================================

-- ------------------------------------------------------------
-- OWNERS TABLE
-- Manually add your two user_id values after creating accounts
-- via Supabase Auth (magic link sign-in).
-- ------------------------------------------------------------
create table owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- RECIPES
-- ------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null, -- 'Breakfast' | 'Appetizer' | 'Main Dish' | 'Side Dish' | 'Dessert'
  description text,
  notes text,             -- family story / attribution, e.g. "Grandma Zippay's recipe"
  source_page int,        -- original cookbook page number, for reference
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index recipes_category_idx on recipes (category);
create index recipes_title_idx on recipes using gin (to_tsvector('english', title));

-- ------------------------------------------------------------
-- INGREDIENTS
-- Stored as plain text lines, exactly as written (no scaling in v1)
-- ------------------------------------------------------------
create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  text text not null,     -- e.g. "3 Ten count tubes buttermilk biscuits"
  sort_order int not null default 0
);

create index recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id);

-- ------------------------------------------------------------
-- STEPS
-- ------------------------------------------------------------
create table recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  step_number int not null,
  text text not null
);

create index recipe_steps_recipe_idx on recipe_steps (recipe_id);

-- ------------------------------------------------------------
-- IMAGES
-- ------------------------------------------------------------
create table recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  storage_path text not null,  -- path within the 'recipe-images' storage bucket
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index recipe_images_recipe_idx on recipe_images (recipe_id);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_set_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Everyone (including logged-out/anon) can read.
-- Only rows in `owners` can write.
-- ============================================================

alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table recipe_images enable row level security;
alter table owners enable row level security;

-- Public read policies
create policy "public read recipes" on recipes for select using (true);
create policy "public read ingredients" on recipe_ingredients for select using (true);
create policy "public read steps" on recipe_steps for select using (true);
create policy "public read images" on recipe_images for select using (true);

-- Owners can read the owners table (needed to check "am I an owner" client-side)
create policy "owners read owners" on owners for select using (true);

-- Owner-only write policies
create policy "owner write recipes" on recipes
  for all
  using (auth.uid() in (select user_id from owners))
  with check (auth.uid() in (select user_id from owners));

create policy "owner write ingredients" on recipe_ingredients
  for all
  using (auth.uid() in (select user_id from owners))
  with check (auth.uid() in (select user_id from owners));

create policy "owner write steps" on recipe_steps
  for all
  using (auth.uid() in (select user_id from owners))
  with check (auth.uid() in (select user_id from owners));

create policy "owner write images" on recipe_images
  for all
  using (auth.uid() in (select user_id from owners))
  with check (auth.uid() in (select user_id from owners));

-- ============================================================
-- STORAGE BUCKET
-- Run this in the Supabase SQL editor too, or via dashboard.
-- Public read, owner-only write.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "public read recipe images bucket"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "owner write recipe images bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.uid() in (select user_id from owners)
  );

create policy "owner update recipe images bucket"
  on storage.objects for update
  using (
    bucket_id = 'recipe-images'
    and auth.uid() in (select user_id from owners)
  );

create policy "owner delete recipe images bucket"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-images'
    and auth.uid() in (select user_id from owners)
  );

-- ============================================================
-- SETUP CHECKLIST (manual steps, do these after running this file)
-- ============================================================
-- 1. In Supabase Auth, invite/sign up your two emails via magic link.
-- 2. Copy each user's id (Authentication > Users) and insert into `owners`:
--      insert into owners (user_id, name) values ('<uuid-here>', 'Mom');
--      insert into owners (user_id, name) values ('<uuid-here>', 'You');
