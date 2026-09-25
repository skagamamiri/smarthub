-- SMART HUB V1.1
create extension if not exists pgcrypto;

create table if not exists games (
 id uuid primary key default gen_random_uuid(), title text not null, subject text not null,
 year text not null check (year in ('1','2','3','4','5','6')), emoji text default '🎮',
 description text, html_code text not null, created_at timestamptz default now()
);

create table if not exists resources (
 id uuid primary key default gen_random_uuid(), title text not null,
 type text not null check (type in ('textbook','activity','video','worksheet','reference')),
 subject text not null, year text not null check (year in ('1','2','3','4','5','6')),
 icon text default '📚', file_url text, created_at timestamptz default now()
);

create table if not exists smartboards (
 id uuid primary key default gen_random_uuid(), board_code text unique not null,
 classroom text, name text, last_active timestamptz, created_at timestamptz default now()
);

create table if not exists teacher_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text, role text default 'teacher', created_at timestamptz default now()
);

alter table games enable row level security;
alter table resources enable row level security;
alter table smartboards enable row level security;
alter table teacher_profiles enable row level security;

drop policy if exists "public read games" on games;
drop policy if exists "public read resources" on resources;
drop policy if exists "public read smartboards" on smartboards;
drop policy if exists "teacher manage games" on games;
drop policy if exists "teacher manage resources" on resources;

create policy "public read games" on games for select using (true);
create policy "public read resources" on resources for select using (true);
create policy "public read smartboards" on smartboards for select using (true);

create policy "teacher manage games" on games for all to authenticated using (true) with check (true);
create policy "teacher manage resources" on resources for all to authenticated using (true) with check (true);

-- Storage bucket for PDF, images, video and other learning files.
insert into storage.buckets (id,name,public) values ('smart-hub-files','smart-hub-files',true)
on conflict (id) do update set public=true;

drop policy if exists "public read smart hub files" on storage.objects;
drop policy if exists "authenticated upload smart hub files" on storage.objects;
drop policy if exists "authenticated delete smart hub files" on storage.objects;

create policy "public read smart hub files" on storage.objects for select using (bucket_id='smart-hub-files');
create policy "authenticated upload smart hub files" on storage.objects for insert to authenticated with check (bucket_id='smart-hub-files');
create policy "authenticated delete smart hub files" on storage.objects for delete to authenticated using (bucket_id='smart-hub-files');
