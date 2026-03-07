import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ override: true })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || 'api-football-v1.p.rapidapi.com'
const API_FOOTBALL_USE_RAPIDAPI = (process.env.API_FOOTBALL_USE_RAPIDAPI || 'false').toLowerCase() === 'true'
const THESPORTSDB_FREE_KEY = process.env.THESPORTSDB_FREE_KEY || '123'
const THESPORTSDB_BASE_URL =
  process.env.THESPORTSDB_BASE_URL || `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_FREE_KEY}`
const SYNC_LOOKBACK_HOURS = Number(process.env.SYNC_LOOKBACK_HOURS || 48)
const SYNC_LOOKAHEAD_HOURS = Number(process.env.SYNC_LOOKAHEAD_HOURS || 6)
const THESPORTSDB_SYNC_DELAY_MS = Number(process.env.THESPORTSDB_SYNC_DELAY_MS || 500)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])
const FINISHED_THESPORTSDB_STATUSES = new Set([
  'MATCH FINISHED',
  'FT',
  'AET',
  'PEN',
  'FINISHED',
  'FULL TIME',
])

function isFinishedStatus(statusShort) {
  return FINISHED_STATUSES.has((statusShort || '').toUpperCase())
}

function isFinishedTheSportsDbStatus(status) {
  return FINISHED_THESPORTSDB_STATUSES.has((status || '').toUpperCase())
}

function sleep(ms) {
  if (ms <= 0) return Promise.resolve()
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function isTheSportsDbRateLimitError(message) {
  const normalized = String(message || '').toLowerCase()
  return normalized.includes('429') || normalized.includes('1015') || normalized.includes('rate limit')
}

async function fetchApiFootballFixtureResult(externalMatchId) {
  if (!API_FOOTBALL_KEY) {
    throw new Error('Missing API_FOOTBALL_KEY for provider api-football')
  }

  const url = API_FOOTBALL_USE_RAPIDAPI
    ? `https://${API_FOOTBALL_HOST}/v3/fixtures?id=${encodeURIComponent(externalMatchId)}`
    : `${API_FOOTBALL_BASE_URL}/fixtures?id=${encodeURIComponent(externalMatchId)}`

  const headers = API_FOOTBALL_USE_RAPIDAPI
    ? {
        'x-rapidapi-key': API_FOOTBALL_KEY,
        'x-rapidapi-host': API_FOOTBALL_HOST,
      }
    : {
        'x-apisports-key': API_FOOTBALL_KEY,
      }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const fixture = data?.response?.[0]

  if (!fixture) {
    return null
  }

  return {
    status: fixture?.fixture?.status?.short || null,
    homeGoals: fixture?.goals?.home,
    awayGoals: fixture?.goals?.away,
  }
}

async function fetchTheSportsDbFixtureResult(externalMatchId) {
  const url = `${THESPORTSDB_BASE_URL}/lookupevent.php?id=${encodeURIComponent(externalMatchId)}`
  const response = await fetch(url, { method: 'GET' })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`TheSportsDB API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const event = data?.events?.[0]

  if (!event) {
    return null
  }

  const homeGoals = Number.parseInt(event?.intHomeScore, 10)
  const awayGoals = Number.parseInt(event?.intAwayScore, 10)

  return {
    status: event?.strStatus || null,
    homeGoals: Number.isInteger(homeGoals) ? homeGoals : null,
    awayGoals: Number.isInteger(awayGoals) ? awayGoals : null,
  }
}

async function fetchFixtureResult(match) {
  if (match.external_provider === 'api-football') {
    return fetchApiFootballFixtureResult(match.external_match_id)
  }

  if (match.external_provider === 'thesportsdb') {
    return fetchTheSportsDbFixtureResult(match.external_match_id)
  }

  throw new Error(
    `Unsupported provider '${match.external_provider}'. Use 'api-football' or 'thesportsdb' in matches.external_provider`
  )
}

async function getCandidateMatches() {
  const now = Date.now()
  const fromDate = new Date(now - SYNC_LOOKBACK_HOURS * 60 * 60 * 1000).toISOString()
  const toDate = new Date(now + SYNC_LOOKAHEAD_HOURS * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('matches')
    .select('id, round_number, match_number, external_provider, external_match_id, is_finished, home_score, away_score, match_date')
    .in('external_provider', ['api-football', 'thesportsdb'])
    .not('external_match_id', 'is', null)
    .order('match_date', { ascending: true })

  if (error) {
    throw new Error(`Unable to fetch candidate matches: ${error.message}`)
  }

  const raw = data || []

  // Always process unfinished matches, plus a configurable window around "now".
  return raw.filter(match => {
    if (!match.is_finished) {
      return true
    }

    if (!match.match_date) {
      return false
    }

    return match.match_date >= fromDate && match.match_date <= toDate
  })
}

async function updateMatchResult(match, result) {
  const shouldMarkFinished =
    match.external_provider === 'thesportsdb'
      ? isFinishedTheSportsDbStatus(result.status)
      : isFinishedStatus(result.status)
  const hasValidScores = Number.isInteger(result.homeGoals) && Number.isInteger(result.awayGoals)

  if (!shouldMarkFinished || !hasValidScores) {
    return { updated: false, reason: 'not-finished-or-no-score' }
  }

  const scoresChanged = match.home_score !== result.homeGoals || match.away_score !== result.awayGoals
  const finishStateChanged = match.is_finished !== true

  if (!scoresChanged && !finishStateChanged) {
    return { updated: false, reason: 'already-up-to-date' }
  }

  const { error } = await supabase
    .from('matches')
    .update({
      home_score: result.homeGoals,
      away_score: result.awayGoals,
      is_finished: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', match.id)

  if (error) {
    throw new Error(`Unable to update match ${match.id}: ${error.message}`)
  }

  return { updated: true }
}

async function run() {
  console.log('Starting results sync...')
  const matches = await getCandidateMatches()
  console.log(`Found ${matches.length} candidate matches`)

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  let thesportsdbRateLimited = false

  for (const [index, match] of matches.entries()) {
    if (match.external_provider === 'thesportsdb' && index > 0) {
      await sleep(THESPORTSDB_SYNC_DELAY_MS)
    }

    try {
      const result = await fetchFixtureResult(match)
      if (!result) {
        skippedCount += 1
        continue
      }

      const updateInfo = await updateMatchResult(match, result)
      if (updateInfo.updated) {
        updatedCount += 1
        console.log(
          `Updated match id=${match.id} provider=${match.external_provider} (round=${match.round_number}, match=${match.match_number}) to ${result.homeGoals}-${result.awayGoals}`
        )
      } else {
        skippedCount += 1
      }
    } catch (error) {
      if (match.external_provider === 'thesportsdb' && isTheSportsDbRateLimitError(error.message)) {
        thesportsdbRateLimited = true
        console.warn('TheSportsDB rate limit reached during sync. Stopping this run early to avoid repeated failures.')
        break
      }

      errorCount += 1
      console.error(`Error processing match id=${match.id}: ${error.message}`)
    }
  }

  console.log(
    `Sync finished. Updated=${updatedCount}, Skipped=${skippedCount}, Errors=${errorCount}`
  )

  if (errorCount > 0 && !thesportsdbRateLimited) {
    process.exitCode = 1
  }
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
