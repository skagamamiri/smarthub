-- SMART HUB database baseline
create extension if not exists pgcrypto;
create table if not exists games (id uuid primary key default gen_random_uuid(), title text not null, subject text not null, year text not null, emoji text default '🎮', description text, html_code text not null, created_at timestamptz default now());
create table if not exists resources (id uuid primary key default gen_random_uuid(), title text not null, type text not null check (type in ('textbook','activity','video','worksheet','reference')), subject text not null, year text not null, icon text default '📚', file_url text, created_at timestamptz default now());
create table if not exists smartboards (id uuid primary key default gen_random_uuid(), board_code text unique not null, classroom text, name text, last_active timestamptz, created_at timestamptz default now());
create table if not exists teacher_profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, role text default 'teacher', created_at timestamptz default now());
alter table games enable row level security; alter table resources enable row level security; alter table smartboards enable row level security;
create policy "public read games" on games for select using (true);
create policy "public read resources" on resources for select using (true);
create policy "public read smartboards" on smartboards for select using (true);
-- For production, restrict insert/update/delete to authenticated teacher/admin users.
