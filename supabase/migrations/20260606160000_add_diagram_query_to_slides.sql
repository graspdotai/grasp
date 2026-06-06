alter table public.session_slides
  add column if not exists diagram_query text;
