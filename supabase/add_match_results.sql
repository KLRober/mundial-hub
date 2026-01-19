-- Match Results Table
-- Stores official match results entered by admin

create table if not exists match_results (
  id uuid primary key default uuid_generate_v4(),
  match_id text unique not null,
  match_type text check (match_type in ('group', 'playoff')) not null,
  home_goals integer,
  away_goals integer,
  winner_code text,
  processed boolean default false,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table match_results enable row level security;

-- Public read access (everyone can see results)
create policy "Match results are viewable by everyone"
  on match_results for select using (true);

-- Only authenticated users can insert/update (admin check done in app layer)
create policy "Authenticated users can insert match results"
  on match_results for insert with check (auth.uid() is not null);

create policy "Authenticated users can update match results"
  on match_results for update using (auth.uid() is not null);

-- Function to process points for a group match
create or replace function process_group_match_points(
  p_match_id text,
  p_home_goals integer,
  p_away_goals integer
) returns void as $$
declare
  v_result_type text;
begin
  -- Determine result type
  if p_home_goals > p_away_goals then
    v_result_type := 'home_win';
  elsif p_home_goals < p_away_goals then
    v_result_type := 'away_win';
  else
    v_result_type := 'draw';
  end if;

  -- Exact score: 3 points
  update predictions
  set puntos_ganados = 3
  where match_id = p_match_id
    and pred_local = p_home_goals
    and pred_visitante = p_away_goals;

  -- Correct result but not exact: 1 point
  update predictions
  set puntos_ganados = 1
  where match_id = p_match_id
    and puntos_ganados is null
    and (
      (v_result_type = 'home_win' and pred_local > pred_visitante)
      or (v_result_type = 'away_win' and pred_local < pred_visitante)
      or (v_result_type = 'draw' and pred_local = pred_visitante)
    );

  -- Incorrect: 0 points
  update predictions
  set puntos_ganados = 0
  where match_id = p_match_id
    and puntos_ganados is null;

  -- Update user total points
  update profiles p
  set puntos_totales = (
    select coalesce(sum(puntos_ganados), 0)
    from predictions
    where user_id = p.id
  ) + (
    select coalesce(sum(
      case when pp.winner_code = mr.winner_code then 3 else 0 end
    ), 0)
    from playoff_predictions pp
    join match_results mr on mr.match_id = pp.match_id
    where pp.user_id = p.id and mr.processed = true
  )
  where id in (
    select distinct user_id from predictions where match_id = p_match_id
  );
end;
$$ language plpgsql security definer;

-- Function to process points for a playoff match
create or replace function process_playoff_match_points(
  p_match_id text,
  p_winner_code text
) returns void as $$
begin
  -- Update user total points for users who predicted this match correctly
  update profiles p
  set puntos_totales = (
    select coalesce(sum(puntos_ganados), 0)
    from predictions
    where user_id = p.id
  ) + (
    select coalesce(sum(
      case when pp.winner_code = mr.winner_code then 3 else 0 end
    ), 0)
    from playoff_predictions pp
    join match_results mr on mr.match_id = pp.match_id
    where pp.user_id = p.id and mr.processed = true
  )
  where id in (
    select distinct user_id from playoff_predictions where match_id = p_match_id
  );
end;
$$ language plpgsql security definer;
