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
