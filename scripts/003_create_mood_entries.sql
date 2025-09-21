-- Create mood entries table for tracking daily moods
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood_score integer not null check (mood_score >= 1 and mood_score <= 10),
  mood_label text not null check (mood_label in ('very_sad', 'sad', 'neutral', 'happy', 'very_happy')),
  notes text,
  triggers text[], -- Array of trigger factors
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mood_entries enable row level security;

-- RLS policies for mood entries
create policy "mood_entries_select_own"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "mood_entries_insert_own"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "mood_entries_update_own"
  on public.mood_entries for update
  using (auth.uid() = user_id);

create policy "mood_entries_delete_own"
  on public.mood_entries for delete
  using (auth.uid() = user_id);
