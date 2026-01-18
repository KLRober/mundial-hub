-- Create table for playoff predictions
create table if not exists playoff_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  match_id text not null, -- e.g., 'R32-1', 'QF-3', 'F-1' (using text ID from our logic, not UUID from matches table)
  winner_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, match_id)
);

-- Enable RLS
alter table playoff_predictions enable row level security;

-- Policies
create policy "Users can view own playoff predictions." on playoff_predictions
  for select using (auth.uid() = user_id);

create policy "Users can insert own playoff predictions." on playoff_predictions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own playoff predictions." on playoff_predictions
  for update using (auth.uid() = user_id);
