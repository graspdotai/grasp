-- Link each generated course (learning_session) to a user (auth.users / profiles.id)
alter table public.learning_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_learning_sessions_user_id
  on public.learning_sessions(user_id, created_at desc);
