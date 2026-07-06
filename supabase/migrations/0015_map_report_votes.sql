-- Confirm / not-confirm voting for map occurrences, with a Waze-style
-- dynamic threshold that removes a report once "not confirmed" votes
-- outweigh "confirmed" votes by enough to be confident it's gone.
--
-- Design notes (there is no public spec for Waze's actual algorithm, this is
-- a reasonable approximation of the same idea): a report with few
-- confirmations is fragile — it needs a relatively large share of denials
-- (50%) before we trust it's gone, since a couple of bad-faith or mistaken
-- clicks could otherwise kill a fresh, real report. A report with lots of
-- confirmations is well-established — a smaller share of denials (30%) is
-- already a strong signal that conditions changed, because that fraction
-- represents a much larger absolute number of people. The threshold slides
-- linearly between those two points (10 and 100 confirmations). Below any
-- confirmations at all, a small absolute floor (3 denials) prevents a single
-- troll from insta-killing a brand new report. Removal is one-way: a report
-- never reactivates once deactivated, same as the rest of this feature.

alter table public.map_reports add column denials int not null default 0;
-- Confirmations used to start at 1 (the reporter's implicit vote), but now
-- that every confirmation is backed by a row in map_report_votes, a phantom
-- un-voted confirmation would throw off the denial ratio from the start.
alter table public.map_reports alter column confirmations set default 0;

create table public.map_report_votes (
  report_id uuid not null references public.map_reports on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  vote text not null check (vote in ('confirm', 'deny')),
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

alter table public.map_report_votes enable row level security;

create policy "Users can view their own votes" on public.map_report_votes
  for select using (auth.uid() = user_id);

-- No insert/update/delete policies: all writes go through vote_map_report(),
-- which is SECURITY DEFINER and keeps map_reports.confirmations/denials in
-- sync atomically (same pattern as react_to_post in 0005).

create function public.should_deactivate_report(p_confirmations int, p_denials int)
returns boolean
language sql
immutable
as $$
  select case
    when p_confirmations = 0 then p_denials >= 3
    else p_denials::numeric / p_confirmations::numeric >= (
      case
        when p_confirmations <= 10 then 0.5
        when p_confirmations >= 100 then 0.3
        else 0.5 - (p_confirmations - 10) * (0.2 / 90.0)
      end
    )
  end;
$$;

create function public.vote_map_report(p_report_id uuid, p_vote text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_existing text;
  v_report map_reports;
begin
  if p_vote not in ('confirm', 'deny') then
    raise exception 'Voto inválido';
  end if;

  select vote into v_existing from map_report_votes
    where report_id = p_report_id and user_id = auth.uid();

  if v_existing is not null then
    delete from map_report_votes where report_id = p_report_id and user_id = auth.uid();
    update map_reports set
      confirmations = confirmations - case when v_existing = 'confirm' then 1 else 0 end,
      denials = denials - case when v_existing = 'deny' then 1 else 0 end
    where id = p_report_id;
  end if;

  if v_existing is distinct from p_vote then
    insert into map_report_votes (report_id, user_id, vote) values (p_report_id, auth.uid(), p_vote);
    update map_reports set
      confirmations = confirmations + case when p_vote = 'confirm' then 1 else 0 end,
      denials = denials + case when p_vote = 'deny' then 1 else 0 end
    where id = p_report_id;
  end if;

  select * into v_report from map_reports where id = p_report_id;
  if v_report.active and public.should_deactivate_report(v_report.confirmations, v_report.denials) then
    update map_reports set active = false where id = p_report_id;
  end if;
end;
$$;

revoke execute on function public.vote_map_report(uuid, text) from public;
revoke execute on function public.vote_map_report(uuid, text) from anon;
grant execute on function public.vote_map_report(uuid, text) to authenticated;

-- Superseded by vote_map_report(), which handles both directions.
drop function public.confirm_map_report(uuid);

alter function public.should_deactivate_report(int, int) set search_path = public;
