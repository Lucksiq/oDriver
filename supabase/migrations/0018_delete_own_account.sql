-- LGPD: self-service account deletion (Art. 18, VI — direito à eliminação).
-- Deleting the auth.users row cascades through every table that references
-- profiles/auth.users with "on delete cascade" (rides, expenses, extra_earnings,
-- goals, map_reports, posts, post_reactions, map_report_votes, ranking_groups,
-- ranking_group_members, voice_channels, voice_channel_members, voice_messages,
-- push_subscriptions) -- no manual cleanup needed across all those tables.
--
-- This function is owned by the migration role (effectively postgres), which
-- has write access to auth.users -- SECURITY DEFINER lets an authenticated
-- user trigger the deletion of their own row without needing the
-- service-role key anywhere in application code.

create function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_own_account() from public;
revoke execute on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
