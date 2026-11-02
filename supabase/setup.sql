-- Run once in Supabase Dashboard → SQL Editor → New query.
create table if not exists public.trips (
  id text primary key,
  category text not null check (category in ('domestic', 'international', 'pilgrimage')),
  name_en text not null,
  name_mr text not null default '',
  thumbnail_path text not null,
  itinerary_en_path text,
  itinerary_mr_path text,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;

-- Add the administrator email here after creating that user under
-- Authentication → Users in the Supabase Dashboard.
create table if not exists public.admin_users (
  email text primary key,
  added_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_arth_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

drop policy if exists "Anyone can read published trips" on public.trips;
drop policy if exists "Anyone can read destination entries" on public.trips;
create policy "Anyone can read destination entries" on public.trips
  for select using (true);

drop policy if exists "Signed-in admins can manage trips" on public.trips;
create policy "Allowlisted admins can manage trips" on public.trips
  for all to authenticated using (public.is_arth_admin()) with check (public.is_arth_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-media', 'trip-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','application/pdf'];

drop policy if exists "Public can view trip media" on storage.objects;
create policy "Public can view trip media" on storage.objects for select
  using (bucket_id = 'trip-media');

drop policy if exists "Signed-in admins can upload trip media" on storage.objects;
create policy "Allowlisted admins can upload trip media" on storage.objects for insert to authenticated
  with check (bucket_id = 'trip-media' and public.is_arth_admin());

drop policy if exists "Signed-in admins can update trip media" on storage.objects;
create policy "Allowlisted admins can update trip media" on storage.objects for update to authenticated
  using (bucket_id = 'trip-media' and public.is_arth_admin()) with check (bucket_id = 'trip-media' and public.is_arth_admin());

drop policy if exists "Signed-in admins can delete trip media" on storage.objects;
create policy "Allowlisted admins can delete trip media" on storage.objects for delete to authenticated
  using (bucket_id = 'trip-media' and public.is_arth_admin());
