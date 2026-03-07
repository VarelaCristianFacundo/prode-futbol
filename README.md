# Prode Futbol

Aplicacion web de prode para futbol argentino con frontend en React/Vite, datos en Supabase y jobs automatizados para fixture/resultados.

## Arquitectura

- Frontend: carpeta raiz del proyecto (Vite).
- Backend de datos: Supabase (Postgres, Auth, RLS, RPC, triggers).
- Jobs automaticos: carpeta backend con scripts Node.

Esta estructura en un solo repositorio es una buena practica para este caso (monorepo simple).

## Desarrollo local

### 1) Frontend

1. Crear archivo .env en la raiz con:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu-anon-key

2. Instalar y ejecutar:
npm install
npm run dev

### 2) Base de datos en Supabase

Ejecutar en SQL Editor de Supabase:
1. backend/supabase/schema.sql
2. opcional: backend/supabase/seed.sql

Si queres permitir pronosticos en rondas pending, ejecutar tambien:
backend/supabase/migrations/20260307_allow_pending_predictions.sql

### 3) Jobs de backend

1. Crear backend/.env desde backend/.env.example
2. Instalar dependencias:
cd backend
npm install

3. Scripts utiles:
npm run import:fixtures
npm run sync:results
npm run refresh:data
npm run recompute:rounds

## Deploy recomendado

### Frontend en Vercel

Deploy del root del repositorio.

Variables de entorno en Vercel:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

Build command:
npm run build

Output directory:
dist

### Frontend en GitHub Pages (opcion para pruebas)

Se agrego workflow automatico:
.github/workflows/deploy-pages.yml

Pasos para activarlo:
1. En GitHub: Settings > Pages > Build and deployment > Source: GitHub Actions.
2. Configurar secrets del repositorio:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
3. Push a main o ejecutar workflow_dispatch.

URL esperada:
https://TU_USUARIO.github.io/TU_REPO/

### Automatizacion de backend con GitHub Actions

El workflow esta en:
.github/workflows/refresh-data.yml

Hace:
1. npm run refresh:data
2. npm run recompute:rounds

Frecuencia:
cada 30 minutos y ejecucion manual por workflow_dispatch.

## Secretos de GitHub requeridos

Minimos:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- IMPORT_PROVIDER
- IMPORT_SEASON

Si usas TheSportsDB:
- THESPORTSDB_FREE_KEY
- THESPORTSDB_BASE_URL
- THESPORTSDB_LEAGUE_ID
- THESPORTSDB_MAX_ROUNDS
- THESPORTSDB_EMPTY_ROUNDS_STOP
- THESPORTSDB_REQUEST_DELAY_MS
- THESPORTSDB_MAX_RETRIES
- THESPORTSDB_RETRY_BASE_MS
- THESPORTSDB_SECOND_STAGE_MONTH
- THESPORTSDB_SYNC_DELAY_MS

Si usas API-Football:
- API_FOOTBALL_KEY
- API_FOOTBALL_BASE_URL
- API_FOOTBALL_LEAGUE_ID
- API_FOOTBALL_USE_RAPIDAPI
- API_FOOTBALL_HOST

Parametros de estado de rondas:
- ROUND_OPEN_LOOKAHEAD_HOURS
- ROUND_FORCE_FINISHED_AFTER_HOURS
- SYNC_LOOKBACK_HOURS
- SYNC_LOOKAHEAD_HOURS

## Subir a GitHub (primer push)

Desde la raiz del proyecto:

git init
git add .
git commit -m "feat: prode futbol frontend + supabase backend jobs"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
