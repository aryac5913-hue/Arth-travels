-- Run this update in Supabase SQL Editor after the earlier setup.sql.
-- It adds the MICE tour category and Travel Memories uploads/deletion.
alter table public.trips drop constraint if exists trips_category_check;
alter table public.trips add constraint trips_category_check
  check (category in ('domestic', 'international', 'mice', 'pilgrimage'));

create table if not exists public.travel_memories (
  id text primary key,
  title_en text not null,
  title_mr text not null default '',
  video_path text not null,
  published boolean not null default true,
  sort_order integer not null default 999,
  created_at timestamptz not null default now()
);
alter table public.travel_memories enable row level security;

drop policy if exists "Anyone can read travel memories" on public.travel_memories;
create policy "Anyone can read travel memories" on public.travel_memories
  for select using (true);
drop policy if exists "Allowlisted admins can manage travel memories" on public.travel_memories;
create policy "Allowlisted admins can manage travel memories" on public.travel_memories
  for all to authenticated using (public.is_arth_admin()) with check (public.is_arth_admin());

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','video/mp4']
where id = 'trip-media';
