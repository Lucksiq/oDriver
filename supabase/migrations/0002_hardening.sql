-- Follow-ups after the initial schema + advisor pass.

-- The profile-creation trigger function should only ever run as a trigger,
-- not be callable directly via the PostgREST RPC endpoint.
revoke execute on function public.handle_new_user() from anon, authenticated;

-- Lets `useGoals` upsert one row per user/type/day for the achievement streak.
create unique index goals_user_type_period_start_idx on public.goals (user_id, type, period_start);
