alter table public.session_slides
  add column if not exists audio_url text;
