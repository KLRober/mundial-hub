-- Fix UUID Error: Change match_id to TEXT to support IDs like "A-M1-1"

-- 1. Drop foreign key constraint on predictions (which forces UUID from matches table)
alter table predictions drop constraint if exists predictions_match_id_fkey;

-- 2. Change predictions.match_id to text
alter table predictions alter column match_id type text using match_id::text;

-- 3. Ensure playoff_predictions exists and uses text for match_id
create table if not exists playoff_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  match_id text not null,
  winner_code text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, match_id)
);

-- If playoff_predictions already existed with UUID, fix it:
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'playoff_predictions' and column_name = 'match_id' and data_type = 'uuid') then
    alter table playoff_predictions alter column match_id type text using match_id::text;
  end if;
end $$;

-- 4. Update process_group_match_points function to accept TEXT match_id
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
