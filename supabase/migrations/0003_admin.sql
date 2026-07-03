-- Admin role: a flag on profiles + read-only cross-user visibility for stats.
-- Admins get broader SELECT access, never additional INSERT/UPDATE/DELETE
-- rights over other users' rows — the existing owner-only write policies
-- are untouched.

alter table public.profiles add column is_admin boolean not null default false;

create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Supabase's default privileges grant EXECUTE to anon/authenticated directly
-- (not via PUBLIC) on new functions, so both must be revoked explicitly.
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Additive SELECT-only policies (existing policies are unaffected; Postgres
-- OR's all permissive policies that apply to a given command).
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Admins can view all rides" on public.rides
  for select using (public.is_admin());
create policy "Admins can view all expenses" on public.expenses
  for select using (public.is_admin());
create policy "Admins can view all extra earnings" on public.extra_earnings
  for select using (public.is_admin());
create policy "Admins can view all goals" on public.goals
  for select using (public.is_admin());

-- Per-user aggregate stats for the admin panel. security_invoker means this
-- view runs with the querying user's own RLS: a regular user still only
-- gets their own row back; an admin (via the policies above) gets everyone.
create view public.admin_user_stats
with (security_invoker = true) as
select
  p.id,
  p.username,
  p.display_name,
  p.city,
  p.state,
  p.platforms,
  p.is_premium,
  p.is_admin,
  p.onboarding_complete,
  p.created_at,
  coalesce(r.ride_count, 0) as ride_count,
  coalesce(r.ride_total, 0) + coalesce(e.extra_total, 0) as gross_earnings
from public.profiles p
left join (
  select user_id, count(*) as ride_count, sum(amount) as ride_total
  from public.rides
  group by user_id
) r on r.user_id = p.id
left join (
  select user_id, sum(amount) as extra_total
  from public.extra_earnings
  group by user_id
) e on e.user_id = p.id;

grant select on public.admin_user_stats to authenticated;
