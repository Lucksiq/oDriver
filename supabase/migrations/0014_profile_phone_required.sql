-- Phone (with DDD/area code) becomes part of every profile. The DB column is
-- NOT NULL with a '' default so legacy rows and edge cases (e.g. a future
-- OAuth provider that doesn't collect it) never break, but the app enforces
-- a real value at signup/onboarding time (see lib/schemas.ts phoneSchema) --
-- the true "obrigatoriedade" lives at the application boundary, same as
-- onboarding_complete already does for city/state/platforms.

alter table public.profiles add column phone text not null default '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, phone)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;
