-- 6-Weken Plan App Supabase schema
-- Run this in Supabase SQL Editor for a fresh project.

drop table if exists public.workout_import_events;
drop table if exists public.health_import_tokens;
alter table if exists public.workout_logs drop column if exists source;
alter table if exists public.workout_logs drop column if exists external_id;

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

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) not null,
  kcal_target int default 2400,
  protein_target int default 130,
  water_target numeric default 2,
  resting_hr_baseline int default 56,
  reminder_enabled boolean default true,
  reminder_time text default '20:00',
  timezone text default 'Europe/Amsterdam',
  heart_zones jsonb default '[{"zone":"Z1","min":121,"max":134},{"zone":"Z2","min":134,"max":147},{"zone":"Z3","min":147,"max":160},{"zone":"Z4","min":160,"max":173},{"zone":"Z5","min":173,"max":186}]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.daily_habits (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  protein_done boolean default false,
  water_done boolean default false,
  kcal_done boolean default false,
  post_workout_protein_done boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists public.push_subscriptions (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  endpoint text not null,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.completions enable row level security;
alter table public.workout_logs enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.user_settings enable row level security;
alter table public.daily_habits enable row level security;
alter table public.push_subscriptions enable row level security;

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

drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings"
on public.user_settings
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own habits" on public.daily_habits;
create policy "Users manage own habits"
on public.daily_habits
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions"
on public.push_subscriptions
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

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_settings'
  ) then
    alter publication supabase_realtime add table public.user_settings;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'daily_habits'
  ) then
    alter publication supabase_realtime add table public.daily_habits;
  end if;
end $$;
