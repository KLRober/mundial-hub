-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  puntos_totales integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Matches table
create table matches (
  id uuid default uuid_generate_v4() primary key,
  equipo_local text not null,
  equipo_visitante text not null,
  fecha timestamp with time zone not null,
  goles_local integer,
  goles_visitante integer,
  estado text check (estado in ('scheduled', 'live', 'finished')) default 'scheduled',
  venue text,
  city text,
  group_name text
);

-- Predictions table
create table predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  match_id uuid references matches(id) on delete cascade not null,
  pred_local integer not null,
  pred_visitante integer not null,
  puntos_ganados integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, match_id)
);

-- Players table (for minigames)
create table players (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  equipo text not null,
  posicion text,
  foto_url text,
  datos_curiosos jsonb
);

-- RLS Policies
alter table profiles enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table players enable row level security;

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Matches: Public read, only admins update (simplified for now to public read)
create policy "Matches are viewable by everyone." on matches
  for select using (true);

-- Predictions: Users read own, insert own, update own (before match starts - logic to be added in app layer or triggers)
create policy "Users can view own predictions." on predictions
  for select using (auth.uid() = user_id);

create policy "Users can insert own predictions." on predictions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own predictions." on predictions
  for update using (auth.uid() = user_id);

-- Players: Public read
create policy "Players are viewable by everyone." on players
  for select using (true);

-- Functions
-- Calculate points for a finished match
create or replace function calculate_points(
  match_id_input uuid,
  actual_local integer,
  actual_visitante integer
) returns void as $$
begin
  -- Exact score: 3 points
  update predictions
  set puntos_ganados = 3
  where match_id = match_id_input
    and pred_local = actual_local
    and pred_visitante = actual_visitante;

  -- Correct result (Winner or Draw) but not exact score: 1 point
  update predictions
  set puntos_ganados = 1
  where match_id = match_id_input
    and puntos_ganados is null
    and (
      -- Home Win
      (actual_local > actual_visitante and pred_local > pred_visitante)
      or
      -- Away Win
      (actual_local < actual_visitante and pred_local < pred_visitante)
      or
      -- Draw
      (actual_local = actual_visitante and pred_local = pred_visitante)
    );
    
  -- Incorrect: 0 points
  update predictions
  set puntos_ganados = 0
  where match_id = match_id_input
    and puntos_ganados is null;

  -- Update total points for users
  update profiles p
  set puntos_totales = (
    select coalesce(sum(puntos_ganados), 0)
    from predictions
    where user_id = p.id
  )
  where id in (
    select user_id from predictions where match_id = match_id_input
  );
end;
$$ language plpgsql security definer;
