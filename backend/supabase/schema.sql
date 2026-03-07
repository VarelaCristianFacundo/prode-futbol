-- Prode Futbol backend schema for Supabase
-- Execute this script in Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'round_status') then
    create type public.round_status as enum ('pending', 'open', 'locked', 'finished');
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rounds (
  id bigserial primary key,
  round_number integer not null unique check (round_number > 0),
  status public.round_status not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rounds_only_one_open_idx
on public.rounds ((status))
where status = 'open';

create table if not exists public.teams (
  id bigserial primary key,
  name text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id bigserial primary key,
  round_number integer not null references public.rounds(round_number) on delete cascade,
  match_number integer not null check (match_number > 0),
  home_team_id bigint not null references public.teams(id),
  away_team_id bigint not null references public.teams(id),
  match_date timestamptz not null,
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  is_finished boolean not null default false,
  external_provider text,
  external_match_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_teams_different check (home_team_id <> away_team_id),
  constraint matches_round_match_unique unique (round_number, match_number),
  constraint matches_external_unique unique (external_provider, external_match_id)
);

create index if not exists matches_round_number_idx on public.matches(round_number);
create index if not exists matches_match_date_idx on public.matches(match_date);

create table if not exists public.predictions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  home_prediction integer not null check (home_prediction >= 0 and home_prediction <= 20),
  away_prediction integer not null check (away_prediction >= 0 and away_prediction <= 20),
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint predictions_user_match_unique unique (user_id, match_id)
);

create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_match_id_idx on public.predictions(match_id);

create table if not exists public.round_scores (
  id bigserial primary key,
  round_number integer not null references public.rounds(round_number) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_points integer not null default 0 check (total_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint round_scores_round_user_unique unique (round_number, user_id)
);

create index if not exists round_scores_round_number_idx on public.round_scores(round_number);
create index if not exists round_scores_user_id_idx on public.round_scores(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists rounds_set_updated_at on public.rounds;
create trigger rounds_set_updated_at
before update on public.rounds
for each row execute procedure public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute procedure public.set_updated_at();

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at
before update on public.predictions
for each row execute procedure public.set_updated_at();

drop trigger if exists round_scores_set_updated_at on public.round_scores;
create trigger round_scores_set_updated_at
before update on public.round_scores
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_username text;
  fallback_name text;
begin
  fallback_username := split_part(new.email, '@', 1);
  fallback_name := coalesce(new.raw_user_meta_data ->> 'full_name', fallback_username);

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', fallback_username || '_' || substr(new.id::text, 1, 6)),
    fallback_name
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.match_outcome(home_goals integer, away_goals integer)
returns integer
language sql
immutable
as $$
  select case
    when home_goals > away_goals then 1
    when home_goals < away_goals then -1
    else 0
  end;
$$;

create or replace function public.calculate_prediction_points(
  pred_home integer,
  pred_away integer,
  real_home integer,
  real_away integer
)
returns integer
language plpgsql
immutable
as $$
declare
  total_goals integer;
  points_result integer := 0;
begin
  if pred_home is null or pred_away is null or real_home is null or real_away is null then
    return 0;
  end if;

  if pred_home = real_home and pred_away = real_away then
    total_goals := real_home + real_away;
    if total_goals > 2 then
      return total_goals;
    end if;
    return 2;
  end if;

  -- Regla 1 punto: partidos de hasta 2 goles, acertando ganador/empate.
  if (real_home + real_away) <= 2
     and public.match_outcome(pred_home, pred_away) = public.match_outcome(real_home, real_away) then
    points_result := points_result + 1;
  end if;

  -- Regla 1 punto: prediccion de mas de 3 goles y acierto en total de goles.
  if (pred_home + pred_away) > 3
     and (pred_home + pred_away) = (real_home + real_away) then
    points_result := points_result + 1;
  end if;

  return points_result;
end;
$$;

create or replace function public.recalculate_match_predictions(p_match_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.predictions p
  set points = public.calculate_prediction_points(
    p.home_prediction,
    p.away_prediction,
    m.home_score,
    m.away_score
  )
  from public.matches m
  where p.match_id = m.id
    and m.id = p_match_id
    and m.is_finished = true;

  update public.predictions p
  set points = 0
  where p.match_id = p_match_id
    and exists (
      select 1
      from public.matches m
      where m.id = p_match_id
        and (m.is_finished = false or m.home_score is null or m.away_score is null)
    );
end;
$$;

create or replace function public.recalculate_round_scores(p_round_number integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.round_scores (round_number, user_id, total_points)
  select
    m.round_number,
    p.user_id,
    coalesce(sum(p.points), 0) as total_points
  from public.predictions p
  join public.matches m on m.id = p.match_id
  where m.round_number = p_round_number
    and m.is_finished = true
  group by m.round_number, p.user_id
  on conflict (round_number, user_id)
  do update set
    total_points = excluded.total_points,
    updated_at = now();

  delete from public.round_scores rs
  where rs.round_number = p_round_number
    and not exists (
      select 1
      from public.predictions p
      join public.matches m on m.id = p.match_id
      where m.round_number = p_round_number
        and m.is_finished = true
        and p.user_id = rs.user_id
    );
end;
$$;

create or replace function public.handle_match_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.is_finished is distinct from old.is_finished
    or new.home_score is distinct from old.home_score
    or new.away_score is distinct from old.away_score
  ) then
    perform public.recalculate_match_predictions(new.id);
    perform public.recalculate_round_scores(new.round_number);
  end if;

  return new;
end;
$$;

drop trigger if exists matches_recalculate_points on public.matches;
create trigger matches_recalculate_points
after update of home_score, away_score, is_finished on public.matches
for each row execute procedure public.handle_match_updates();

create or replace function public.handle_round_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'finished' and old.status is distinct from 'finished' then
    perform public.recalculate_round_scores(new.round_number);
  end if;
  return new;
end;
$$;

drop trigger if exists rounds_recalculate_points on public.rounds;
create trigger rounds_recalculate_points
after update of status on public.rounds
for each row execute procedure public.handle_round_status_change();

create or replace view public.general_leaderboard as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  coalesce(sum(rs.total_points), 0) as total_points,
  dense_rank() over (order by coalesce(sum(rs.total_points), 0) desc, p.username asc) as position
from public.profiles p
left join public.round_scores rs on rs.user_id = p.id
group by p.id, p.username, p.full_name, p.avatar_url
order by total_points desc, username asc;

create or replace function public.get_round_predictions_summary()
returns table (
  user_id uuid,
  user_name text,
  total_matches integer,
  predicted_count integer,
  missing_matches integer,
  progress numeric,
  round_number integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_open_round integer;
  round_match_count integer;
begin
  select r.round_number
  into current_open_round
  from public.rounds r
  where r.status = 'open'
  order by r.round_number asc
  limit 1;

  if current_open_round is null then
    return;
  end if;

  select count(*)::integer
  into round_match_count
  from public.matches m
  where m.round_number = current_open_round;

  return query
  with per_user as (
    select
      pr.id as profile_id,
      coalesce(pr.full_name, pr.username) as display_name,
      count(pred.id) filter (where m.round_number = current_open_round)::integer as predictions_count
    from public.profiles pr
    left join public.predictions pred on pred.user_id = pr.id
    left join public.matches m on m.id = pred.match_id
    group by pr.id, display_name
  )
  select
    pu.profile_id,
    pu.display_name,
    round_match_count,
    pu.predictions_count,
    greatest(round_match_count - pu.predictions_count, 0) as missing_matches,
    case
      when round_match_count = 0 then 0
      else round((pu.predictions_count::numeric / round_match_count::numeric) * 100, 2)
    end as progress,
    current_open_round
  from per_user pu
  order by pu.predictions_count desc, pu.display_name asc;
end;
$$;

create or replace function public.get_personal_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total_points integer := 0;
  v_finished_matches integer := 0;
  v_hit_count integer := 0;
  v_avg_per_round numeric := 0;
  v_exact_scores integer := 0;
  v_winner_hits integer := 0;
  v_bonus_goals integer := 0;
  v_errors integer := 0;
  v_evolution jsonb := '[]'::jsonb;
  v_best_round_number integer;
  v_best_round_points integer := 0;
  v_worst_round_number integer;
  v_worst_round_points integer := 0;
  v_total_predictions integer := 0;
  v_avg_points_per_match numeric := 0;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'metrics', jsonb_build_object('totalPoints', 0, 'hitPercentage', 0, 'avgPerRound', 0),
      'evolutionByRound', '[]'::jsonb,
      'bestRound', jsonb_build_object('roundNumber', null, 'points', 0),
      'worstRound', jsonb_build_object('roundNumber', null, 'points', 0),
      'accuracyBreakdown', jsonb_build_object(
        'exactScores', 0,
        'winnerHits', 0,
        'bonusGoals', 0,
        'totalAnalyzed', 0,
        'goalDiffCorrect', 0,
        'winnerOnly', 0,
        'errors', 0
      ),
      'additionalStats', jsonb_build_object(
        'totalPredictions', 0,
        'avgPointsPerMatch', 0,
        'finishedMatches', 0
      )
    );
  end if;

  with finished_predictions as (
    select
      p.points,
      p.home_prediction,
      p.away_prediction,
      m.home_score,
      m.away_score,
      m.round_number,
      (p.home_prediction = m.home_score and p.away_prediction = m.away_score) as is_exact,
      ((m.home_score + m.away_score) <= 2
        and public.match_outcome(p.home_prediction, p.away_prediction) = public.match_outcome(m.home_score, m.away_score)
        and not (p.home_prediction = m.home_score and p.away_prediction = m.away_score)
      ) as is_winner_hit,
      ((p.home_prediction + p.away_prediction) > 3
        and (p.home_prediction + p.away_prediction) = (m.home_score + m.away_score)
        and not (p.home_prediction = m.home_score and p.away_prediction = m.away_score)
      ) as is_bonus_goal
    from public.predictions p
    join public.matches m on m.id = p.match_id
    where p.user_id = v_user_id
      and m.is_finished = true
      and m.home_score is not null
      and m.away_score is not null
  )
  select
    coalesce(sum(points), 0)::integer,
    count(*)::integer,
    count(*) filter (where points > 0)::integer,
    count(*) filter (where is_exact)::integer,
    count(*) filter (where is_winner_hit)::integer,
    count(*) filter (where is_bonus_goal)::integer,
    count(*)::integer - count(*) filter (where is_exact or is_winner_hit or is_bonus_goal)::integer,
    coalesce(avg(points), 0)
  into
    v_total_points,
    v_finished_matches,
    v_hit_count,
    v_exact_scores,
    v_winner_hits,
    v_bonus_goals,
    v_errors,
    v_avg_points_per_match
  from finished_predictions;

  select count(*)::integer
  into v_total_predictions
  from public.predictions p
  where p.user_id = v_user_id;

  with by_round as (
    select rs.round_number, rs.total_points
    from public.round_scores rs
    where rs.user_id = v_user_id
    order by rs.round_number asc
  )
  select coalesce(jsonb_agg(jsonb_build_object('roundNumber', round_number, 'points', total_points)), '[]'::jsonb)
  into v_evolution
  from by_round;

  select br.round_number, br.total_points
  into v_best_round_number, v_best_round_points
  from public.round_scores br
  where br.user_id = v_user_id
  order by br.total_points desc, br.round_number asc
  limit 1;

  select wr.round_number, wr.total_points
  into v_worst_round_number, v_worst_round_points
  from public.round_scores wr
  where wr.user_id = v_user_id
  order by wr.total_points asc, wr.round_number asc
  limit 1;

  select coalesce(avg(rs.total_points), 0)
  into v_avg_per_round
  from public.round_scores rs
  where rs.user_id = v_user_id;

  return jsonb_build_object(
    'metrics', jsonb_build_object(
      'totalPoints', v_total_points,
      'hitPercentage', case when v_finished_matches = 0 then 0 else round((v_hit_count::numeric / v_finished_matches::numeric) * 100, 2) end,
      'avgPerRound', round(v_avg_per_round, 2)
    ),
    'evolutionByRound', v_evolution,
    'bestRound', jsonb_build_object(
      'roundNumber', v_best_round_number,
      'points', coalesce(v_best_round_points, 0)
    ),
    'worstRound', jsonb_build_object(
      'roundNumber', v_worst_round_number,
      'points', coalesce(v_worst_round_points, 0)
    ),
    'accuracyBreakdown', jsonb_build_object(
      'exactScores', v_exact_scores,
      'winnerHits', v_winner_hits,
      'bonusGoals', v_bonus_goals,
      'totalAnalyzed', v_finished_matches,
      'goalDiffCorrect', v_winner_hits,
      'winnerOnly', v_winner_hits,
      'errors', greatest(v_errors, 0)
    ),
    'additionalStats', jsonb_build_object(
      'totalPredictions', v_total_predictions,
      'avgPointsPerMatch', round(v_avg_points_per_match, 2),
      'finishedMatches', v_finished_matches
    )
  );
end;
$$;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.rounds enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.round_scores enable row level security;

-- Drop policies for re-runnable script.
drop policy if exists "Profiles are visible to authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;
drop policy if exists "Rounds readable" on public.rounds;
drop policy if exists "Rounds writable by admins" on public.rounds;
drop policy if exists "Teams readable" on public.teams;
drop policy if exists "Teams writable by admins" on public.teams;
drop policy if exists "Matches readable" on public.matches;
drop policy if exists "Matches writable by admins" on public.matches;
drop policy if exists "Users can read own predictions" on public.predictions;
drop policy if exists "Predictions visible once round is locked or finished" on public.predictions;
drop policy if exists "Users can insert own predictions before cutoff" on public.predictions;
drop policy if exists "Users can update own predictions before cutoff" on public.predictions;
drop policy if exists "Users can delete own predictions before cutoff" on public.predictions;
drop policy if exists "Round scores readable" on public.round_scores;

-- Profiles
create policy "Profiles are visible to authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update any profile"
on public.profiles for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (true);

-- Rounds
create policy "Rounds readable"
on public.rounds for select
to authenticated
using (true);

create policy "Rounds writable by admins"
on public.rounds for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Teams
create policy "Teams readable"
on public.teams for select
to authenticated
using (true);

create policy "Teams writable by admins"
on public.teams for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Matches
create policy "Matches readable"
on public.matches for select
to authenticated
using (true);

create policy "Matches writable by admins"
on public.matches for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create or replace function public.can_submit_prediction(p_match_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    join public.rounds r on r.round_number = m.round_number
    where m.id = p_match_id
      and r.status in ('pending', 'open')
      and now() < (m.match_date - interval '20 minutes')
  );
$$;

-- Predictions
create policy "Users can read own predictions"
on public.predictions for select
to authenticated
using (user_id = auth.uid());

create policy "Predictions visible once round is locked or finished"
on public.predictions for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    join public.rounds r on r.round_number = m.round_number
    where m.id = predictions.match_id
      and r.status in ('locked', 'finished')
  )
);

create policy "Users can insert own predictions before cutoff"
on public.predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.can_submit_prediction(match_id)
);

create policy "Users can update own predictions before cutoff"
on public.predictions for update
to authenticated
using (
  user_id = auth.uid()
  and public.can_submit_prediction(match_id)
)
with check (
  user_id = auth.uid()
  and public.can_submit_prediction(match_id)
);

create policy "Users can delete own predictions before cutoff"
on public.predictions for delete
to authenticated
using (
  user_id = auth.uid()
  and public.can_submit_prediction(match_id)
);

-- Round scores
create policy "Round scores readable"
on public.round_scores for select
to authenticated
using (true);

-- Explicit grants
grant usage on schema public to anon, authenticated, service_role;
grant select on public.general_leaderboard to authenticated;
grant execute on function public.get_round_predictions_summary() to authenticated;
grant execute on function public.get_personal_stats() to authenticated;
grant execute on function public.calculate_prediction_points(integer, integer, integer, integer) to authenticated;
grant execute on function public.can_submit_prediction(bigint) to authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
