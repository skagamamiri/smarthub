-- =========================================================
-- SMART HUB - ADMIN DASHBOARD SECURITY V1
-- Admin: sekolah-8965@moe-dl.edu.my
-- =========================================================

create or replace function public.is_smart_hub_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_allowlist
    where lower(email) = lower(auth.jwt() ->> 'email')
      and lower(role) = 'admin'
      and is_active = true
  );
$$;

revoke all on function public.is_smart_hub_admin() from public;
grant execute on function public.is_smart_hub_admin() to authenticated;

alter table public.teacher_allowlist enable row level security;

drop policy if exists "admin read teacher allowlist" on public.teacher_allowlist;
drop policy if exists "admin insert teacher allowlist" on public.teacher_allowlist;
drop policy if exists "admin update teacher allowlist" on public.teacher_allowlist;
drop policy if exists "admin delete teacher allowlist" on public.teacher_allowlist;

create policy "admin read teacher allowlist"
on public.teacher_allowlist for select to authenticated
using (public.is_smart_hub_admin());

create policy "admin insert teacher allowlist"
on public.teacher_allowlist for insert to authenticated
with check (public.is_smart_hub_admin());

create policy "admin update teacher allowlist"
on public.teacher_allowlist for update to authenticated
using (public.is_smart_hub_admin())
with check (public.is_smart_hub_admin());

create policy "admin delete teacher allowlist"
on public.teacher_allowlist for delete to authenticated
using (public.is_smart_hub_admin());

-- Admin boleh mengurus kandungan sama seperti guru berdaftar.
-- Polisi kandungan sedia ada daripada SECURITY PATCH dikekalkan.
