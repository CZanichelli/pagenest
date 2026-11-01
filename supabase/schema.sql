-- PageNest schema. Paste into the Supabase SQL editor and run.

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text unique not null,
  headline text,
  subheadline text,
  button_label text,
  button_url text,
  accent text default '#4f46e5',
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Who the page is for; shared as `audience` with CZ's Headline rewriter widget.
alter table public.pages add column if not exists audience text;

create index if not exists pages_user_id_idx on public.pages (user_id);

alter table public.pages enable row level security;

drop policy if exists "owners select own pages" on public.pages;
drop policy if exists "owners insert own pages" on public.pages;
drop policy if exists "owners update own pages" on public.pages;
drop policy if exists "owners delete own pages" on public.pages;
drop policy if exists "anyone reads published pages" on public.pages;

create policy "owners select own pages" on public.pages
  for select to authenticated using (auth.uid() = user_id);

create policy "owners insert own pages" on public.pages
  for insert to authenticated with check (auth.uid() = user_id);

create policy "owners update own pages" on public.pages
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owners delete own pages" on public.pages
  for delete to authenticated using (auth.uid() = user_id);

create policy "anyone reads published pages" on public.pages
  for select to anon, authenticated using (published = true);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- Results handed back by CZ's Headline rewriter widget (see ORDANA_INTEGRATION.md).
create table if not exists public.headline_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  page_id uuid not null references public.pages (id) on delete cascade,
  chosen_headline text not null check (char_length(chosen_headline) <= 300),
  chosen_style text check (chosen_style in ('benefit', 'question', 'punchy')),
  created_at timestamptz default now()
);

create index if not exists headline_results_user_id_idx on public.headline_results (user_id);
create index if not exists headline_results_page_created_idx
  on public.headline_results (page_id, created_at desc);

alter table public.headline_results enable row level security;

drop policy if exists "owners select own headline results" on public.headline_results;
drop policy if exists "owners insert own headline results" on public.headline_results;
drop policy if exists "owners delete own headline results" on public.headline_results;

create policy "owners select own headline results" on public.headline_results
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "owners insert own headline results" on public.headline_results
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.pages p where p.id = page_id and p.user_id = (select auth.uid()))
  );

create policy "owners delete own headline results" on public.headline_results
  for delete to authenticated using ((select auth.uid()) = user_id);
