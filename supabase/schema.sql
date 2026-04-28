-- 6-Weken Plan App Supabase schema
-- Run this in Supabase SQL Editor for a fresh project.

create table if not exists public.completions (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  day_id int not null,
  completed_at timestamptz default now(),
  unique(user_id, day_id)
);

create table if not exists public.workout_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  type text not null,
  duration numeric,
  distance numeric,
  avg_hr int,
  max_hr int,
  kcal int,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.daily_checkins (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight_kg numeric,
  waist_cm numeric,
  sleep_hours numeric,
  resting_hr int,
  hrv numeric,
  energy_level int,
  mood_level int,
  soreness_hours int,
  hunger_level int,
  hrv_low_signal boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.completions enable row level security;
alter table public.workout_logs enable row level security;
alter table public.daily_checkins enable row level security;

drop policy if exists "Users manage own completions" on public.completions;
create policy "Users manage own completions"
on public.completions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own logs" on public.workout_logs;
create policy "Users manage own logs"
on public.workout_logs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own checkins" on public.daily_checkins;
create policy "Users manage own checkins"
on public.daily_checkins
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'completions'
  ) then
    alter publication supabase_realtime add table public.completions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'workout_logs'
  ) then
    alter publication supabase_realtime add table public.workout_logs;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'daily_checkins'
  ) then
    alter publication supabase_realtime add table public.daily_checkins;
  end if;
end $$;
