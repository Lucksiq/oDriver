-- Real voice channels, replacing the previous fixed list in
-- lib/voice-channels.ts. Unlike ranking_groups, there's no membership table:
-- "being in" a channel is inherently transient (LiveKit's own live
-- participant list already tracks that), so a channel row only needs an
-- owner and a public/private flag.

create table public.voice_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 60),
  topic text,
  city text,
  owner_id uuid not null references public.profiles on delete cascade,
  is_private boolean not null default false,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now()
);

alter table public.voice_channels enable row level security;

create policy "Public channels are visible to everyone, private only to their owner" on public.voice_channels
  for select using (not is_private or owner_id = auth.uid());

create policy "Users can create channels they own" on public.voice_channels
  for insert with check (auth.uid() = owner_id);

create policy "Owners can delete their channels" on public.voice_channels
  for delete using (auth.uid() = owner_id);

-- Lets someone with an invite code (but not the owner) look up a private
-- channel without it being exposed via the general SELECT policy above.
create function public.get_voice_channel_by_code(p_invite_code text)
returns public.voice_channels
language sql
security definer set search_path = public
stable
as $$
  select * from voice_channels where invite_code = p_invite_code;
$$;

revoke execute on function public.get_voice_channel_by_code(text) from public;
revoke execute on function public.get_voice_channel_by_code(text) from anon;
grant execute on function public.get_voice_channel_by_code(text) to authenticated;

-- Lets app/api/voice-token validate a channel id (public or private) exists
-- before minting a LiveKit token for it, without needing ownership.
create function public.voice_channel_exists(p_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists(select 1 from voice_channels where id = p_id);
$$;

revoke execute on function public.voice_channel_exists(uuid) from public;
revoke execute on function public.voice_channel_exists(uuid) from anon;
grant execute on function public.voice_channel_exists(uuid) to authenticated;
