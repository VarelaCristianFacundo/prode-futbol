# Backend Prode (Supabase + Jobs)

Esta carpeta contiene todo lo necesario para datos y automatizacion:

- Esquema SQL y politicas RLS
- Triggers/RPC para puntajes y estadisticas
- Importador de fixture
- Sincronizacion de resultados
- Recomputo de estados de rondas

## Setup

1. Crear proyecto en Supabase.
2. Ejecutar en SQL Editor:
    - backend/supabase/schema.sql
    - opcional: backend/supabase/seed.sql
3. Opcional para habilitar pronosticos en pending:
    - backend/supabase/migrations/20260307_allow_pending_predictions.sql

## Variables (backend/.env)

Copiar desde backend/.env.example.

Minimas:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- IMPORT_PROVIDER
- IMPORT_SEASON

TheSportsDB (free):
- THESPORTSDB_FREE_KEY=123
- THESPORTSDB_BASE_URL
- THESPORTSDB_LEAGUE_ID
- THESPORTSDB_MAX_ROUNDS
- THESPORTSDB_EMPTY_ROUNDS_STOP
- THESPORTSDB_REQUEST_DELAY_MS
- THESPORTSDB_MAX_RETRIES
- THESPORTSDB_RETRY_BASE_MS
- THESPORTSDB_SECOND_STAGE_MONTH
- THESPORTSDB_SYNC_DELAY_MS

Control de estados de ronda:
- ROUND_OPEN_LOOKAHEAD_HOURS
- ROUND_FORCE_FINISHED_AFTER_HOURS

Ventana de sync:
- SYNC_LOOKBACK_HOURS
- SYNC_LOOKAHEAD_HOURS

## Scripts

Desde backend:

- npm run import:fixtures
   Importa/actualiza equipos, rondas y partidos.

- npm run sync:results
   Trae resultados de partidos y recalcula puntajes por triggers.

- npm run refresh:data
   Ejecuta import + sync.

- npm run recompute:rounds
   Reordena rondas/fases y recalcula estados open/pending/finished.

## Automatizacion recomendada

Workflow GitHub Actions en:
.github/workflows/refresh-data.yml

Ejecuta:
1. npm run refresh:data
2. npm run recompute:rounds

Frecuencia actual:
cada 30 minutos, mas trigger manual.

## Regla de cierre de pronosticos

La regla se aplica por partido (no por fecha completa):

- Se permite crear/editar/borrar pronosticos hasta 20 minutos antes del kickoff de ese partido.
- Se valida en frontend y en RLS de Supabase (server-side).
