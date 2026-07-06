-- Premium gating for ranking groups, voice channels and voice messages.
--
-- Rules (from product decision):
-- - Creating AND deleting ranking groups / voice channels requires Premium.
-- - Deleting is further restricted to the creator or an admin — admins are
--   exempt from the Premium requirement themselves, since moderation is a
--   staff privilege, not a paid feature.
-- - Voice notes over 30s require Premium (hard cap 90s either way).
-- - Deleting a voice message is allowed for its author or an admin (no
--   Premium requirement — this one is just about who, not a paid feature).

create or replace function public.create_ranking_group(
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
  if not exists (select 1 from profiles where id = auth.uid() and is_premium) then
    raise exception 'Criar grupos de ranking é um recurso exclusivo do oDriver Premium';
  end if;

  insert into ranking_groups (name, description, owner_id, is_private, metric, period)
  values (p_name, p_description, auth.uid(), p_is_private, p_metric, p_period)
  returning * into v_group;

  insert into ranking_group_members (group_id, user_id) values (v_group.id, auth.uid());

  return v_group;
end;
$$;

-- ranking_groups never had a delete policy before (no one could delete a
-- group at all, only leave one).
create policy "Owners with Premium (or admins) can delete groups" on public.ranking_groups
  for delete using (
    public.is_admin()
    or (owner_id = auth.uid() and exists (
      select 1 from profiles where id = auth.uid() and is_premium
    ))
  );

create or replace function public.create_voice_channel(
  p_name text,
  p_topic text,
  p_city text,
  p_is_private boolean
)
returns public.voice_channels
language plpgsql
security definer set search_path = public
as $$
declare
  v_channel voice_channels;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_premium) then
    raise exception 'Criar canais de voz é um recurso exclusivo do oDriver Premium';
  end if;

  insert into voice_channels (name, topic, city, owner_id, is_private)
  values (p_name, p_topic, p_city, auth.uid(), p_is_private)
  returning * into v_channel;

  insert into voice_channel_members (channel_id, user_id) values (v_channel.id, auth.uid());

  return v_channel;
end;
$$;

drop policy "Owners can delete their channels" on public.voice_channels;
create policy "Owners with Premium (or admins) can delete channels" on public.voice_channels
  for delete using (
    public.is_admin()
    or (owner_id = auth.uid() and exists (
      select 1 from profiles where id = auth.uid() and is_premium
    ))
  );

drop policy "Users can delete their own messages" on public.voice_messages;
create policy "Authors or admins can delete voice messages" on public.voice_messages
  for delete using (auth.uid() = user_id or public.is_admin());

drop policy "Users can post messages to channels they can access" on public.voice_messages;
create policy "Users can post messages within their plan's duration limit" on public.voice_messages
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from voice_channels vc
      where vc.id = channel_id and (not vc.is_private or public.is_voice_channel_member(vc.id))
    )
    and coalesce(duration_seconds, 0) <= (
      select case when p.is_premium then 90 else 30 end from profiles p where p.id = auth.uid()
    )
  );
