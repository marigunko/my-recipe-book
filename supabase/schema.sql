create extension if not exists "pgcrypto";

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  ingredients text not null,
  instructions text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.sections enable row level security;
alter table public.recipes enable row level security;

create policy "sections_select_own"
  on public.sections
  for select
  using (auth.uid() = user_id);

create policy "sections_insert_own"
  on public.sections
  for insert
  with check (auth.uid() = user_id);

create policy "sections_update_own"
  on public.sections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sections_delete_own"
  on public.sections
  for delete
  using (auth.uid() = user_id);

create policy "recipes_select_own"
  on public.recipes
  for select
  using (auth.uid() = user_id);

create policy "recipes_insert_own"
  on public.recipes
  for insert
  with check (auth.uid() = user_id);

create policy "recipes_update_own"
  on public.recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recipes_delete_own"
  on public.recipes
  for delete
  using (auth.uid() = user_id);
