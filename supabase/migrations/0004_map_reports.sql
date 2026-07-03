-- Map occurrence reports (accident/block/radar/risk_zone/hotspot).
-- Unlike rides/expenses/goals, these are intentionally PUBLIC community data
-- (like Waze) — any authenticated user can see everyone's active reports.

create table public.map_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  type text not null check (type in ('accident', 'block', 'radar', 'risk_zone', 'hotspot')),
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  description text,
  city text,
  confirmations int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index map_reports_active_idx on public.map_reports (active);

alter table public.map_reports enable row level security;

create policy "Active reports are viewable by authenticated users" on public.map_reports
  for select using (active);

create policy "Users can create their own reports" on public.map_reports
  for insert with check (auth.uid() = user_id);

-- No general UPDATE/DELETE policy: confirming a report only happens through
-- the SECURITY DEFINER function below (owned by a role that bypasses RLS on
-- this table), so no client can rewrite type/description/location directly.
create function public.confirm_map_report(report_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.map_reports
  set confirmations = confirmations + 1
  where id = report_id and active = true;
$$;

revoke execute on function public.confirm_map_report(uuid) from public;
revoke execute on function public.confirm_map_report(uuid) from anon;
grant execute on function public.confirm_map_report(uuid) to authenticated;

alter publication supabase_realtime add table public.map_reports;
