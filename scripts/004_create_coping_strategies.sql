-- Create coping strategies table for personalized recommendations
create table if not exists public.coping_strategies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('breathing', 'mindfulness', 'physical', 'social', 'creative', 'academic')),
  difficulty_level text not null check (difficulty_level in ('easy', 'medium', 'hard')),
  duration_minutes integer,
  instructions text[],
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- This table doesn't need RLS as it contains general strategies for all users
-- But we'll add a policy to allow all authenticated users to read
alter table public.coping_strategies enable row level security;

create policy "coping_strategies_select_all"
  on public.coping_strategies for select
  using (auth.role() = 'authenticated');
