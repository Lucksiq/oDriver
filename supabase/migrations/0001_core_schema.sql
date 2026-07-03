-- oDriver core schema: profiles, rides, expenses, extra_earnings, goals.
-- Community feed/ranking/badges data, map reports and voice channels stay
-- mocked client-side for now (see PRD.md §8 for their eventual schema).

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  city text,
  state text,
  avatar_url text,
  platforms text[] not null default '{}',
  daily_goal numeric(10,2) not null default 150,
  weekly_goal numeric(10,2) not null default 900,
  monthly_goal numeric(10,2) not null default 3800,
  is_premium boolean not null default false,
  premium_until timestamptz,
  show_earnings_public boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  platform text not null check (platform in ('uber', '99', 'ifood', 'other')),
  amount numeric(10,2) not null,
  distance_km numeric(8,2),
  duration_minutes int,
  started_at timestamptz,
  ended_at timestamptz,
  ride_type text not null default 'passenger' check (ride_type in ('passenger', 'delivery', 'pet')),
  rating numeric(2,1),
  notes text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  category text not null check (category in ('fuel', 'maintenance', 'tax', 'food', 'platform_fee', 'other')),
  subcategory text,
  amount numeric(10,2) not null,
  liters numeric(8,3),
  price_per_liter numeric(6,3),
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.extra_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  category text not null check (category in ('bonus', 'tip', 'other')),
  amount numeric(10,2) not null,
  description text,
  occurred_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  type text not null check (type in ('daily', 'weekly', 'monthly')),
  amount numeric(10,2) not null,
  period_start date not null,
  period_end date not null,
  achieved boolean not null default false,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

create index rides_user_id_idx on public.rides (user_id);
create index expenses_user_id_idx on public.expenses (user_id);
create index extra_earnings_user_id_idx on public.extra_earnings (user_id);
create index goals_user_id_idx on public.goals (user_id);

-- RLS: every table is owner-only (PRD §11 — financial data is never public).
alter table public.profiles enable row level security;
alter table public.rides enable row level security;
alter table public.expenses enable row level security;
alter table public.extra_earnings enable row level security;
alter table public.goals enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Rides are manageable by owner" on public.rides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Expenses are manageable by owner" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Extra earnings are manageable by owner" on public.extra_earnings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Goals are manageable by owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
