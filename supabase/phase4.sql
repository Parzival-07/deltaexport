-- Delta Realty Phase 4 additions
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_idx on public.property_images(property_id);

create table if not exists public.property_leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check(status in ('new','contacted','closed','spam')),
  created_at timestamptz not null default now()
);

create index if not exists property_leads_owner_idx on public.property_leads(owner_id);
create index if not exists property_leads_property_idx on public.property_leads(property_id);

alter table public.property_images enable row level security;
alter table public.property_leads enable row level security;

drop policy if exists "public approved images" on public.property_images;
create policy "public approved images" on public.property_images
for select to anon, authenticated
using (exists (
  select 1 from public.properties p
  where p.id = property_id and p.status='approved' and p.verified=true
));

drop policy if exists "owner manage images" on public.property_images;
create policy "owner manage images" on public.property_images
for all to authenticated
using (exists(select 1 from public.properties p where p.id=property_id and (p.owner_id=auth.uid() or public.is_delta_admin())))
with check (exists(select 1 from public.properties p where p.id=property_id and (p.owner_id=auth.uid() or public.is_delta_admin())));

-- Anyone may create an enquiry. Limit what can be read.
drop policy if exists "create property lead" on public.property_leads;
create policy "create property lead" on public.property_leads
for insert to anon, authenticated with check (true);

drop policy if exists "owner read leads" on public.property_leads;
create policy "owner read leads" on public.property_leads
for select to authenticated
using (owner_id=auth.uid() or public.is_delta_admin());

drop policy if exists "owner update leads" on public.property_leads;
create policy "owner update leads" on public.property_leads
for update to authenticated
using (owner_id=auth.uid() or public.is_delta_admin())
with check (owner_id=auth.uid() or public.is_delta_admin());

-- Storage policies for the existing property-images bucket.
-- These assume the bucket is named property-images.
drop policy if exists "authenticated upload property images" on storage.objects;
create policy "authenticated upload property images" on storage.objects
for insert to authenticated
with check (bucket_id='property-images');

drop policy if exists "public read property images" on storage.objects;
create policy "public read property images" on storage.objects
for select to anon, authenticated
using (bucket_id='property-images');

drop policy if exists "owners delete property images" on storage.objects;
create policy "owners delete property images" on storage.objects
for delete to authenticated
using (bucket_id='property-images' and (owner_id = auth.uid() or public.is_delta_admin()));
