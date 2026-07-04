-- Private/public ranking groups (PRD section "Sistema de Ranking" — grupos).

create table public.ranking_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 60),
  description text,
  owner_id uuid not null references public.profiles on delete cascade,
  is_private boolean not null default false,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  max_members int not null default 50 check (max_members between 2 and 200),
  metric text not null default 'earnings' check (metric in ('earnings', 'rides', 'profit', 'km')),
  period text not null default 'weekly' check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  created_at timestamptz not null default now()
);

create table public.ranking_group_members (
  group_id uuid not null references public.ranking_groups on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.ranking_groups enable row level security;

-- Public groups are discoverable by anyone signed in; private groups are only
-- visible to their own members (so a non-member can't browse their way in —
-- joining a private group requires the invite_code, handled out-of-band).
create policy "Public groups and own memberships are visible" on public.ranking_groups
  for select using (
    not is_private
    or exists (
      select 1 from public.ranking_group_members m
      where m.group_id = id and m.user_id = auth.uid()
    )
  );

-- No insert/update/delete policies: creation and joining both go through the
-- SECURITY DEFINER functions below, which keep group + membership rows and
-- the max_members cap consistent.

alter table public.ranking_group_members enable row level security;

create policy "Group members can see who else is in their groups" on public.ranking_group_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.ranking_group_members m2
      where m2.group_id = ranking_group_members.group_id and m2.user_id = auth.uid()
    )
  );

create policy "Members can leave a group" on public.ranking_group_members
  for delete using (user_id = auth.uid());

create function public.create_ranking_group(
  p_name text,
  p_description text,
  p_is_private boolean,
  p_metric text,
  p_period text
)
returns public.ranking_groups
language plpgsql
security definer set search_path = public
as $$
declare
  v_group ranking_groups;
begin
  insert into ranking_groups (name, description, owner_id, is_private, metric, period)
  values (p_name, p_description, auth.uid(), p_is_private, p_metric, p_period)
  returning * into v_group;

  insert into ranking_group_members (group_id, user_id) values (v_group.id, auth.uid());

  return v_group;
end;
$$;

revoke execute on function public.create_ranking_group(text, text, boolean, text, text) from public;
revoke execute on function public.create_ranking_group(text, text, boolean, text, text) from anon;
grant execute on function public.create_ranking_group(text, text, boolean, text, text) to authenticated;

create function public.join_ranking_group(p_invite_code text)
returns public.ranking_groups
language plpgsql
security definer set search_path = public
as $$
declare
  v_group ranking_groups;
  v_member_count int;
begin
  select * into v_group from ranking_groups where invite_code = p_invite_code;
  if v_group.id is null then
    raise exception 'Grupo não encontrado';
  end if;

  select count(*) into v_member_count from ranking_group_members where group_id = v_group.id;
  if v_member_count >= v_group.max_members then
    raise exception 'Grupo lotado';
  end if;

  insert into ranking_group_members (group_id, user_id)
  values (v_group.id, auth.uid())
  on conflict (group_id, user_id) do nothing;

  return v_group;
end;
$$;

revoke execute on function public.join_ranking_group(text) from public;
revoke execute on function public.join_ranking_group(text) from anon;
grant execute on function public.join_ranking_group(text) to authenticated;

-- Per-group ranking, computed on demand for the group's configured metric/period.
-- Being a member of a private group is itself the user's consent to share this
-- data with that specific group (separate from the global show_earnings_public
-- opt-in used by public.ranking_stats).
create function public.get_group_ranking(p_group_id uuid)
returns table (
  user_id uuid,
  display_name text,
  city text,
  value numeric
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_group ranking_groups;
  v_period_start timestamptz;
begin
  select * into v_group from ranking_groups where id = p_group_id;
  if v_group.id is null then
    raise exception 'Grupo não encontrado';
  end if;
  if not exists (
    select 1 from ranking_group_members where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'Você não é membro deste grupo';
  end if;

  v_period_start := case v_group.period
    when 'daily' then date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
    when 'weekly' then date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
    when 'monthly' then date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
    else '-infinity'::timestamptz
  end;

  return query
  select
    p.id,
    p.display_name,
    p.city,
    case v_group.metric
      when 'rides' then coalesce(r.rides_count, 0)::numeric
      when 'km' then coalesce(r.km_total, 0)
      when 'profit' then coalesce(r.earnings, 0) + coalesce(e.extra, 0) - coalesce(x.expenses, 0)
      else coalesce(r.earnings, 0) + coalesce(e.extra, 0)
    end as value
  from ranking_group_members m
  join profiles p on p.id = m.user_id
  left join (
    select
      rides.user_id,
      sum(rides.amount) as earnings,
      count(*) as rides_count,
      sum(coalesce(rides.distance_km, 0)) as km_total
    from rides
    where rides.created_at >= v_period_start
    group by rides.user_id
  ) r on r.user_id = p.id
  left join (
    select extra_earnings.user_id, sum(extra_earnings.amount) as extra
    from extra_earnings
    where extra_earnings.occurred_at >= v_period_start
    group by extra_earnings.user_id
  ) e on e.user_id = p.id
  left join (
    select expenses.user_id, sum(expenses.amount) as expenses
    from expenses
    where expenses.occurred_at >= v_period_start
    group by expenses.user_id
  ) x on x.user_id = p.id
  where m.group_id = p_group_id
  order by value desc;
end;
$$;

revoke execute on function public.get_group_ranking(uuid) from public;
revoke execute on function public.get_group_ranking(uuid) from anon;
grant execute on function public.get_group_ranking(uuid) to authenticated;
