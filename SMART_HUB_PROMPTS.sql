-- =========================================================
-- SMART HUB - SENARAI PROMPT (Zon Guru)
-- Jalankan sekali dalam Supabase > SQL Editor.
-- Guru berdaftar (teacher_allowlist aktif) boleh baca & kongsi prompt.
-- Hanya pemilik prompt atau admin boleh edit/hapus.
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'lain',
  subject text,
  year text check (year is null or year in ('1','2','3','4','5','6')),
  prompt_text text not null,
  author_email text,
  author_name text,
  copy_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_created_at_idx on public.prompts (created_at desc);

-- Guru aktif dalam allowlist
create or replace function public.is_smart_hub_teacher()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teacher_allowlist
    where lower(email) = lower(auth.jwt() ->> 'email')
      and is_active = true
  );
$$;
revoke all on function public.is_smart_hub_teacher() from public;
grant execute on function public.is_smart_hub_teacher() to authenticated;

alter table public.prompts enable row level security;

drop policy if exists "teacher read prompts" on public.prompts;
drop policy if exists "teacher insert prompts" on public.prompts;
drop policy if exists "owner or admin update prompts" on public.prompts;
drop policy if exists "owner or admin delete prompts" on public.prompts;

create policy "teacher read prompts" on public.prompts
for select to authenticated
using (public.is_smart_hub_teacher());

create policy "teacher insert prompts" on public.prompts
for insert to authenticated
with check (
  public.is_smart_hub_teacher()
  and lower(author_email) = lower(auth.jwt() ->> 'email')
);

create policy "owner or admin update prompts" on public.prompts
for update to authenticated
using (lower(author_email) = lower(auth.jwt() ->> 'email') or public.is_smart_hub_admin())
with check (lower(author_email) = lower(auth.jwt() ->> 'email') or public.is_smart_hub_admin());

create policy "owner or admin delete prompts" on public.prompts
for delete to authenticated
using (lower(author_email) = lower(auth.jwt() ->> 'email') or public.is_smart_hub_admin());

-- Kiraan "kali disalin" (guru lain boleh tambah kiraan tanpa boleh edit prompt)
create or replace function public.increment_prompt_copy(prompt_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.prompts set copy_count = copy_count + 1
  where id = prompt_id and public.is_smart_hub_teacher();
$$;
revoke all on function public.increment_prompt_copy(uuid) from public;
grant execute on function public.increment_prompt_copy(uuid) to authenticated;
