-- Seed data for Apertura (Jornadas 7, 8 y 9) based on provided fixture/results.
-- Optional: run after schema.sql

insert into public.rounds (round_number, status)
values
  (7, 'finished'),
  (8, 'finished'),
  (9, 'pending')
on conflict (round_number)
do update set
  status = excluded.status,
  updated_at = now();

insert into public.teams (name, slug, logo_url)
values
  ('Aldosivi', 'aldosivi', null),
  ('Argentinos Jrs.', 'argentinos-jrs', null),
  ('Atlético Tucumán', 'atletico-tucuman', null),
  ('Banfield', 'banfield', null),
  ('Barracas Central', 'barracas-central', null),
  ('Belgrano', 'belgrano', null),
  ('Boca Juniors', 'boca-juniors', null),
  ('Central Córdoba', 'central-cordoba', null),
  ('Defensa y Justicia', 'defensa-y-justicia', null),
  ('Deportivo Riestra', 'deportivo-riestra', null),
  ('Estudiantes', 'estudiantes', null),
  ('Estudiantes de Río Cuarto', 'estudiantes-rio-cuarto', null),
  ('Gimnasia', 'gimnasia', null),
  ('Gimnasia y Esgrima', 'gimnasia-y-esgrima', null),
  ('Huracán', 'huracan', null),
  ('Independiente', 'independiente', null),
  ('Independiente Rivadavia', 'independiente-rivadavia', null),
  ('Instituto', 'instituto', null),
  ('Lanús', 'lanus', null),
  ("Newell's", 'newells', null),
  ('Platense', 'platense', null),
  ('Racing', 'racing', null),
  ('River Plate', 'river-plate', null),
  ('Rosario Central', 'rosario-central', null),
  ('San Lorenzo', 'san-lorenzo', null),
  ('Sarmiento', 'sarmiento', null),
  ('Talleres', 'talleres', null),
  ('Tigre', 'tigre', null),
  ('Unión', 'union', null),
  ('Vélez', 'velez', null)
on conflict (slug) do nothing;

with fixtures as (
  select *
  from (
    values
      -- Jornada 7
      (7, 1, 'lanus', 'boca-juniors', '2026-03-04 20:00:00-03'::timestamptz, 0, 3, true),

      -- Jornada 8 (finalizada)
      (8, 1, 'boca-juniors', 'gimnasia-y-esgrima', '2026-02-28 19:00:00-03'::timestamptz, 1, 1, true),
      (8, 2, 'independiente', 'central-cordoba', '2026-02-28 21:30:00-03'::timestamptz, 2, 0, true),
      (8, 3, 'talleres', 'san-lorenzo', '2026-02-28 22:00:00-03'::timestamptz, 0, 0, true),
      (8, 4, 'newells', 'rosario-central', '2026-03-01 17:00:00-03'::timestamptz, 0, 2, true),
      (8, 5, 'instituto', 'union', '2026-03-01 18:00:00-03'::timestamptz, 1, 2, true),
      (8, 6, 'argentinos-jrs', 'barracas-central', '2026-03-01 18:30:00-03'::timestamptz, 1, 1, true),
      (8, 7, 'tigre', 'gimnasia', '2026-03-01 21:00:00-03'::timestamptz, 2, 2, true),
      (8, 8, 'defensa-y-justicia', 'lanus', '2026-03-01 21:30:00-03'::timestamptz, 1, 1, true),
      (8, 9, 'deportivo-riestra', 'platense', '2026-03-02 19:00:00-03'::timestamptz, 0, 0, true),
      (8, 10, 'estudiantes', 'velez', '2026-03-02 20:30:00-03'::timestamptz, 0, 1, true),
      (8, 11, 'banfield', 'aldosivi', '2026-03-02 21:00:00-03'::timestamptz, 2, 0, true),
      (8, 12, 'independiente-rivadavia', 'river-plate', '2026-03-02 21:45:00-03'::timestamptz, 1, 1, true),
      (8, 13, 'sarmiento', 'estudiantes-rio-cuarto', '2026-03-03 19:00:00-03'::timestamptz, 1, 0, true),
      (8, 14, 'huracan', 'belgrano', '2026-03-03 20:00:00-03'::timestamptz, 3, 1, true),
      (8, 15, 'atletico-tucuman', 'racing', '2026-03-03 21:30:00-03'::timestamptz, 0, 3, true),

      -- Jornada 9 (postergada, pendiente)
      (9, 1, 'gimnasia-y-esgrima', 'defensa-y-justicia', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 2, 'barracas-central', 'banfield', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 3, 'platense', 'estudiantes', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 4, 'velez', 'newells', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 5, 'union', 'talleres', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 6, 'rosario-central', 'tigre', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 7, 'aldosivi', 'independiente-rivadavia', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 8, 'estudiantes-rio-cuarto', 'instituto', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 9, 'san-lorenzo', 'independiente', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 10, 'racing', 'huracan', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 11, 'belgrano', 'sarmiento', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 12, 'gimnasia', 'argentinos-jrs', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 13, 'lanus', 'deportivo-riestra', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 14, 'central-cordoba', 'boca-juniors', '2026-03-10 17:00:00-03'::timestamptz, null, null, false),
      (9, 15, 'river-plate', 'atletico-tucuman', '2026-03-10 17:00:00-03'::timestamptz, null, null, false)
  ) as v(round_number, match_number, home_slug, away_slug, match_date, home_score, away_score, is_finished)
)
insert into public.matches (
  round_number,
  match_number,
  home_team_id,
  away_team_id,
  match_date,
  home_score,
  away_score,
  is_finished,
  external_provider,
  external_match_id
)
select
  f.round_number,
  f.match_number,
  ht.id as home_team_id,
  at.id as away_team_id,
  f.match_date,
  f.home_score,
  f.away_score,
  f.is_finished,
  null,
  null
from fixtures f
join public.teams ht on ht.slug = f.home_slug
join public.teams at on at.slug = f.away_slug
on conflict (round_number, match_number)
do update set
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  match_date = excluded.match_date,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  is_finished = excluded.is_finished,
  updated_at = now();
