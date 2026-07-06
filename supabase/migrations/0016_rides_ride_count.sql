-- Lets a user log a whole day of rides as one aggregated entry ("corridas
-- agrupadas") instead of one row per ride ("avulsas"). ride_count says how
-- many real rides a single rides row represents; existing/individual rows
-- default to 1, unaffected.

alter table public.rides add column ride_count int not null default 1 check (ride_count >= 1);

-- The 'rides' ranking metric counted rows (count(*)), which undercounts
-- anyone using grouped entries. Sum ride_count instead so a batch of 12
-- rides logged as one row still contributes 12, not 1.
create or replace function public.get_group_ranking(p_group_id uuid)
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
    select 1 from ranking_group_members
    where ranking_group_members.group_id = p_group_id
      and ranking_group_members.user_id = auth.uid()
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
      sum(rides.ride_count) as rides_count,
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

-- Default of new profiles: earnings visible on the public ranking unless the
-- user opts out (was opt-in). Existing profiles keep whatever they already
-- chose -- this only changes what a brand-new signup starts with.
alter table public.profiles alter column show_earnings_public set default true;
