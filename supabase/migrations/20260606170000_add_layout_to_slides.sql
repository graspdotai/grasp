alter table public.session_slides
  add column if not exists layout text default 'bullets';
