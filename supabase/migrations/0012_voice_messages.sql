-- Pivot voice channels from live LiveKit rooms to async voice notes
-- (WhatsApp-style): record, listen later, auto-expire after 12h. Drivers
-- shouldn't be holding a live call while driving; a quick recording they
-- play back when stopped fits the actual use case much better.

-- Private channels now need persistent membership (unlike the live-voice
-- model, where "being in" a room was transient) since the whole point of
-- async messages is checking back later, possibly in a different session.
create table public.voice_channel_members (
  channel_id uuid not null references public.voice_channels on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

alter table public.voice_channel_members enable row level security;

create function public.is_voice_channel_member(p_channel_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from voice_channel_members
    where channel_id = p_channel_id and user_id = auth.uid()
  );
$$;

revoke execute on function public.is_voice_channel_member(uuid) from public;
revoke execute on function public.is_voice_channel_member(uuid) from anon;
grant execute on function public.is_voice_channel_member(uuid) to authenticated;

create policy "Members can see who else is in their channels" on public.voice_channel_members
  for select using (user_id = auth.uid() or public.is_voice_channel_member(channel_id));

create policy "Members can leave a channel" on public.voice_channel_members
  for delete using (user_id = auth.uid());

-- Visibility now follows membership instead of ownership only.
drop policy "Public channels are visible to everyone, private only to their owner" on public.voice_channels;
create policy "Public channels are visible to everyone, private only to members" on public.voice_channels
  for select using (not is_private or public.is_voice_channel_member(id));

-- Direct insert is replaced by create_voice_channel(), which also adds the
-- creator as a member atomically.
drop policy "Users can create channels they own" on public.voice_channels;

create function public.create_voice_channel(
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
  insert into voice_channels (name, topic, city, owner_id, is_private)
  values (p_name, p_topic, p_city, auth.uid(), p_is_private)
  returning * into v_channel;

  insert into voice_channel_members (channel_id, user_id) values (v_channel.id, auth.uid());

  return v_channel;
end;
$$;

revoke execute on function public.create_voice_channel(text, text, text, boolean) from public;
revoke execute on function public.create_voice_channel(text, text, text, boolean) from anon;
grant execute on function public.create_voice_channel(text, text, text, boolean) to authenticated;

-- Replaces get_voice_channel_by_code: looking up a channel by code now also
-- persists membership, since re-finding a private channel every session
-- (as the old live-voice model allowed) defeats the point of async replay.
drop function public.get_voice_channel_by_code(text);

create function public.join_voice_channel(p_invite_code text)
returns public.voice_channels
language plpgsql
security definer set search_path = public
as $$
declare
  v_channel voice_channels;
begin
  select * into v_channel from voice_channels where invite_code = p_invite_code;
  if v_channel.id is null then
    return null;
  end if;

  insert into voice_channel_members (channel_id, user_id)
  values (v_channel.id, auth.uid())
  on conflict (channel_id, user_id) do nothing;

  return v_channel;
end;
$$;

revoke execute on function public.join_voice_channel(text) from public;
revoke execute on function public.join_voice_channel(text) from anon;
grant execute on function public.join_voice_channel(text) to authenticated;

-- No longer needed now that LiveKit tokens are gone.
drop function public.voice_channel_exists(uuid);

-- Backfill: existing channels (created via direct insert before this
-- migration) need a membership row for their owner too.
insert into voice_channel_members (channel_id, user_id)
select id, owner_id from voice_channels
on conflict (channel_id, user_id) do nothing;

-- Async voice notes. Short audio clips stored as base64 text (not Supabase
-- Storage) — they're small and short-lived, so this avoids needing a second
-- cleanup path (deleting the DB row is enough, no orphaned storage objects).
create table public.voice_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.voice_channels on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  audio_data text not null,
  mime_type text not null default 'audio/webm',
  duration_seconds numeric,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours')
);

create index voice_messages_channel_created_idx on public.voice_messages (channel_id, created_at desc);

alter table public.voice_messages enable row level security;

create policy "Users can read active messages in channels they can access" on public.voice_messages
  for select using (
    expires_at > now()
    and exists (
      select 1 from voice_channels vc
      where vc.id = channel_id and (not vc.is_private or public.is_voice_channel_member(vc.id))
    )
  );

create policy "Users can post messages to channels they can access" on public.voice_messages
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from voice_channels vc
      where vc.id = channel_id and (not vc.is_private or public.is_voice_channel_member(vc.id))
    )
  );

create policy "Users can delete their own messages" on public.voice_messages
  for delete using (auth.uid() = user_id);

-- Opportunistic cleanup: called on every channel visit (see
-- hooks/useVoiceMessages.ts) rather than a cron job, since expired messages
-- are already unreadable via the policy above — this just reclaims space.
create function public.cleanup_expired_voice_messages()
returns void
language sql
security definer set search_path = public
as $$
  delete from voice_messages where expires_at <= now();
$$;

revoke execute on function public.cleanup_expired_voice_messages() from public;
revoke execute on function public.cleanup_expired_voice_messages() from anon;
grant execute on function public.cleanup_expired_voice_messages() to authenticated;
