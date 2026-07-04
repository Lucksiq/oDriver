-- Both ranking_groups and ranking_group_members SELECT policies referenced
-- ranking_group_members from within their own USING clause. For
-- ranking_group_members that's a direct self-reference, and Postgres re-applies
-- RLS to the subquery's table access, causing "infinite recursion detected in
-- policy" (42P17). Same root cause as public.is_admin() in 0003_admin.sql:
-- membership checks must go through a SECURITY DEFINER function that bypasses
-- RLS internally, instead of an exists(...) subquery on the RLS-protected table.

create function public.is_ranking_group_member(p_group_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from ranking_group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

revoke execute on function public.is_ranking_group_member(uuid) from public;
revoke execute on function public.is_ranking_group_member(uuid) from anon;
grant execute on function public.is_ranking_group_member(uuid) to authenticated;

drop policy "Public groups and own memberships are visible" on public.ranking_groups;
create policy "Public groups and own memberships are visible" on public.ranking_groups
  for select using (not is_private or public.is_ranking_group_member(id));

drop policy "Group members can see who else is in their groups" on public.ranking_group_members;
create policy "Group members can see who else is in their groups" on public.ranking_group_members
  for select using (user_id = auth.uid() or public.is_ranking_group_member(group_id));
