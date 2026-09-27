-- Delta Realty Phase 3
-- Run after the earlier Delta Realty schema, or use the consolidated version below.
-- IMPORTANT: review policies before production deployment.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','owner','broker','builder','admin')),
  created_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.properties
  add column if not exists verified boolean not null default false;
alter table public.properties
  add column if not exists status text not null default 'pending';

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- Keep an audit trail for moderation.
create table if not exists public.property_reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Basic indexes.
create index if not exists properties_owner_id_idx on public.properties(owner_id);
create index if not exists properties_status_idx on public.properties(status);
create index if not exists favorites_property_id_idx on public.favorites(property_id);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.property_reviews enable row level security;

-- Helper: admin check. SECURITY DEFINER avoids recursive profile-policy evaluation.
create or replace function public.is_delta_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_delta_admin() from public;
grant execute on function public.is_delta_admin() to authenticated;

-- Profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_delta_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Public may see approved/verified listings.
drop policy if exists "public approved listings" on public.properties;
create policy "public approved listings" on public.properties
for select to anon, authenticated
using (status = 'approved' and verified = true);

-- Owners can see and manage their own submissions.
drop policy if exists "owners read own listings" on public.properties;
create policy "owners read own listings" on public.properties
for select to authenticated using (owner_id = auth.uid() or public.is_delta_admin());

drop policy if exists "owners insert listings" on public.properties;
create policy "owners insert listings" on public.properties
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "owners update own listings" on public.properties;
create policy "owners update own listings" on public.properties
for update to authenticated
using (owner_id = auth.uid() or public.is_delta_admin())
with check (owner_id = auth.uid() or public.is_delta_admin());

drop policy if exists "admin delete listings" on public.properties;
create policy "admin delete listings" on public.properties
for delete to authenticated using (public.is_delta_admin());

-- Favorites
drop policy if exists "favorites self" on public.favorites;
create policy "favorites self" on public.favorites
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Reviews visible to admins only.
drop policy if exists "admin review access" on public.property_reviews;
create policy "admin review access" on public.property_reviews
for all to authenticated
using (public.is_delta_admin())
with check (public.is_delta_admin());

-- Automatically create a basic profile after signup.
create or replace function public.handle_new_delta_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_delta_auth_user_created on auth.users;
create trigger on_delta_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_delta_user();

-- IMPORTANT:
-- To make an account an admin, set its role from the Supabase SQL editor:
-- update public.profiles set role='admin' where id='AUTH-USER-UUID';
-- Never expose a service-role key in website JavaScript.
