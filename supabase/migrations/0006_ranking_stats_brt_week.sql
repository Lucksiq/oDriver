-- Align weekly bucketing to Brazil's timezone (all users are Brazilian drivers),
-- instead of the database session's UTC default, so the ranking week matches
-- what the client-side dashboard (date-fns, local browser time) shows.
create or replace view public.ranking_stats as
select
  p.id as user_id,
  p.display_name,
  p.city,
  coalesce(rides_week.total, 0) + coalesce(extra_week.total, 0) as weekly_earnings
from public.profiles p
left join (
  select user_id, sum(amount) as total
  from public.rides
  where created_at >= date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
  group by user_id
) rides_week on rides_week.user_id = p.id
left join (
  select user_id, sum(amount) as total
  from public.extra_earnings
  where occurred_at >= date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
  group by user_id
) extra_week on extra_week.user_id = p.id
where p.show_earnings_public = true;

grant select on public.ranking_stats to authenticated;
