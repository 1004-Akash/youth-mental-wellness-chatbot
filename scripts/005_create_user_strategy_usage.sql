-- Create table to track which strategies users have tried and their effectiveness
create table if not exists public.user_strategy_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_id uuid not null references public.coping_strategies(id) on delete cascade,
  effectiveness_rating integer check (effectiveness_rating >= 1 and effectiveness_rating <= 5),
  notes text,
  used_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, strategy_id, used_at)
);

alter table public.user_strategy_usage enable row level security;

-- RLS policies for user strategy usage
create policy "user_strategy_usage_select_own"
  on public.user_strategy_usage for select
  using (auth.uid() = user_id);

create policy "user_strategy_usage_insert_own"
  on public.user_strategy_usage for insert
  with check (auth.uid() = user_id);

create policy "user_strategy_usage_update_own"
  on public.user_strategy_usage for update
  using (auth.uid() = user_id);

create policy "user_strategy_usage_delete_own"
  on public.user_strategy_usage for delete
  using (auth.uid() = user_id);
