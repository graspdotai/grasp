alter table public.profiles
  add column if not exists avatar_variant text default 'marble';
