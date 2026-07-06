-- Two follow-up fixes for 0015_map_report_votes.sql found in code review:
--
-- 1. vote_map_report() never checked whether the report was still active
--    before recording a vote. A client that already knew a report's id (e.g.
--    captured from a Realtime payload right before it was deactivated) could
--    keep inserting/deleting rows in map_report_votes and mutating counters
--    on a dead report indefinitely. Harmless to other users (deactivated
--    reports stay hidden and never reactivate) but it's an unguarded write
--    path -- now it raises instead.
--
-- 2. map_report_votes only had the composite PK (report_id, user_id), which
--    doesn't serve a user_id-only lookup (the "my votes" query every map
--    refresh runs). Add a dedicated index.

create index map_report_votes_user_id_idx on public.map_report_votes (user_id);

create or replace function public.vote_map_report(p_report_id uuid, p_vote text)
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

  select * into v_report from map_reports where id = p_report_id;
  if v_report.id is null or not v_report.active then
    raise exception 'Ocorrência não encontrada ou já removida';
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
