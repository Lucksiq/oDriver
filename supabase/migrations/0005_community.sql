-- Community feed (posts + reactions) and public ranking, real/shared via Supabase.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  content text not null check (char_length(content) <= 280),
  type text not null default 'general' check (type in ('tip', 'alert', 'achievement', 'question', 'general')),
  city text,
  reactions jsonb not null default '{"useful": 0, "alert": 0, "hot": 0}'::jsonb,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Posts are viewable by authenticated users" on public.posts
  for select using (true);

create policy "Users can create their own posts" on public.posts
  for insert with check (auth.uid() = user_id);

-- Tracks which reaction (if any) each user gave a post, so the client can
-- render "myReaction" state. Only the owner can ever read their own rows;
-- the aggregate counts everyone else sees live on posts.reactions instead.
create table public.post_reactions (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  reaction text not null check (reaction in ('useful', 'alert', 'hot')),
  primary key (post_id, user_id)
);

alter table public.post_reactions enable row level security;

create policy "Users can view their own reactions" on public.post_reactions
  for select using (auth.uid() = user_id);

-- No insert/update/delete policies: all writes go through react_to_post(),
-- which is SECURITY DEFINER and keeps posts.reactions in sync atomically
-- (same rationale as confirm_map_report in 0004).
create function public.react_to_post(p_post_id uuid, p_reaction text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_existing text;
begin
  select reaction into v_existing from post_reactions
    where post_id = p_post_id and user_id = auth.uid();

  if v_existing is not null then
    delete from post_reactions where post_id = p_post_id and user_id = auth.uid();
    update posts set reactions = jsonb_set(
      reactions, array[v_existing], to_jsonb(greatest(0, (reactions ->> v_existing)::int - 1))
    ) where id = p_post_id;
  end if;

  if v_existing is distinct from p_reaction then
    insert into post_reactions (post_id, user_id, reaction) values (p_post_id, auth.uid(), p_reaction);
    update posts set reactions = jsonb_set(
      reactions, array[p_reaction], to_jsonb((reactions ->> p_reaction)::int + 1)
    ) where id = p_post_id;
  end if;
end;
$$;

revoke execute on function public.react_to_post(uuid, text) from public;
revoke execute on function public.react_to_post(uuid, text) from anon;
grant execute on function public.react_to_post(uuid, text) to authenticated;

alter publication supabase_realtime add table public.posts;

-- Public ranking: pre-aggregated weekly earnings, opt-in only (profiles.show_earnings_public).
-- Deliberately NOT security_invoker: this must read across every user's rides/extra_earnings
-- (both owner-only RLS) to build the leaderboard, but the WHERE clause below is the only
-- gate — it exposes nothing beyond a per-user sum for people who explicitly opted in, never
-- individual ride rows.
create view public.ranking_stats as
select
  p.id as user_id,
  p.display_name,
  p.city,
  coalesce(rides_week.total, 0) + coalesce(extra_week.total, 0) as weekly_earnings
from public.profiles p
left join (
  select user_id, sum(amount) as total
  from public.rides
  where created_at >= date_trunc('week', now())
  group by user_id
) rides_week on rides_week.user_id = p.id
left join (
  select user_id, sum(amount) as total
  from public.extra_earnings
  where occurred_at >= date_trunc('week', now())
  group by user_id
) extra_week on extra_week.user_id = p.id
where p.show_earnings_public = true;

grant select on public.ranking_stats to authenticated;
