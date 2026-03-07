import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ override: true })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMPORT_PROVIDER = (process.env.IMPORT_PROVIDER || 'thesportsdb').toLowerCase()

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
const API_FOOTBALL_LEAGUE_ID = process.env.API_FOOTBALL_LEAGUE_ID || '128' // Liga Profesional Argentina

const THESPORTSDB_FREE_KEY = process.env.THESPORTSDB_FREE_KEY || '123'
const THESPORTSDB_BASE_URL =
  process.env.THESPORTSDB_BASE_URL || `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_FREE_KEY}`
const THESPORTSDB_LEAGUE_ID = process.env.THESPORTSDB_LEAGUE_ID || '4406' // Argentinian Primera Division
const THESPORTSDB_MAX_ROUNDS = Number(process.env.THESPORTSDB_MAX_ROUNDS || 20)
const THESPORTSDB_EMPTY_ROUNDS_STOP = Number(process.env.THESPORTSDB_EMPTY_ROUNDS_STOP || 3)
const THESPORTSDB_REQUEST_DELAY_MS = Number(process.env.THESPORTSDB_REQUEST_DELAY_MS || 350)
const THESPORTSDB_MAX_RETRIES = Number(process.env.THESPORTSDB_MAX_RETRIES || 3)
const THESPORTSDB_RETRY_BASE_MS = Number(process.env.THESPORTSDB_RETRY_BASE_MS || 1500)
const THESPORTSDB_SECOND_STAGE_MONTH = Number(process.env.THESPORTSDB_SECOND_STAGE_MONTH || 7)
const ROUND_OPEN_LOOKAHEAD_HOURS = Number(process.env.ROUND_OPEN_LOOKAHEAD_HOURS || 120)
const ROUND_FORCE_FINISHED_AFTER_HOURS = Number(process.env.ROUND_FORCE_FINISHED_AFTER_HOURS || 72)

const IMPORT_SEASON = process.env.IMPORT_SEASON || String(new Date().getUTCFullYear())

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!['thesportsdb', 'api-football'].includes(IMPORT_PROVIDER)) {
  console.error("IMPORT_PROVIDER must be 'thesportsdb' or 'api-football'")
  process.exit(1)
}

if (IMPORT_PROVIDER === 'api-football' && !API_FOOTBALL_KEY) {
  console.error('Missing API_FOOTBALL_KEY for IMPORT_PROVIDER=api-football')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const FINISHED_THESPORTSDB_STATUSES = new Set([
  'MATCH FINISHED',
  'FT',
  'AET',
  'PEN',
  'FINISHED',
  'FULL TIME',
])
const FINISHED_API_FOOTBALL_STATUSES = new Set(['FT', 'AET', 'PEN'])

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseMatchDate(event) {
  if (event.matchDate) {
    const parsed = new Date(event.matchDate)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  if (event.strTimestamp) {
    const iso = event.strTimestamp.endsWith('Z') ? event.strTimestamp : `${event.strTimestamp}Z`
    const parsed = new Date(iso)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  if (event.dateEvent) {
    const fallback = event.strTime ? `${event.dateEvent}T${event.strTime}` : `${event.dateEvent}T00:00:00`
    const parsed = new Date(fallback)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  return null
}

function parseNullableInt(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) ? parsed : null
}

function sleep(ms) {
  if (ms <= 0) return Promise.resolve()
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function isTheSportsDbRateLimit(status, body) {
  const normalized = String(body || '').toLowerCase()
  return status === 429 || normalized.includes('error 1015') || normalized.includes('rate limited')
}

async function fetchTheSportsDbJson(url, label) {
  for (let attempt = 1; attempt <= THESPORTSDB_MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, { method: 'GET' })

    if (response.ok) {
      return response.json()
    }

    const body = await response.text()
    const shouldRetry = isTheSportsDbRateLimit(response.status, body) && attempt < THESPORTSDB_MAX_RETRIES

    if (shouldRetry) {
      const delayMs = THESPORTSDB_RETRY_BASE_MS * attempt
      console.warn(`${label} throttled (attempt ${attempt}/${THESPORTSDB_MAX_RETRIES}). Retrying in ${delayMs}ms...`)
      await sleep(delayMs)
      continue
    }

    const compactBody = String(body).replace(/\s+/g, ' ').slice(0, 260)
    throw new Error(`${label} error ${response.status}: ${compactBody}`)
  }

  throw new Error(`${label} failed after ${THESPORTSDB_MAX_RETRIES} attempts`)
}

function isFinished(event) {
  if (event.provider === 'api-football') {
    return FINISHED_API_FOOTBALL_STATUSES.has((event.status || '').toUpperCase())
  }

  return FINISHED_THESPORTSDB_STATUSES.has((event.status || '').toUpperCase())
}

function parseRoundNumber(event) {
  const direct = parseNullableInt(event.roundNumber)
  if (direct && direct > 0) return direct

  const fromRaw = String(event.roundRaw || '').match(/(\d+)\s*$/)
  if (fromRaw) return Number.parseInt(fromRaw[1], 10)

  const fromFilename = String(event.strFilename || '').match(/\bRound\s*(\d+)\b/i)
  if (fromFilename) return Number.parseInt(fromFilename[1], 10)

  return null
}

function getEventMonth(event) {
  const iso = parseMatchDate(event)
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.getUTCMonth() + 1
}

function createRoundNumberResolver(events) {
  if (IMPORT_PROVIDER !== 'thesportsdb') {
    return event => parseRoundNumber(event)
  }

  const earlyRounds = []
  let hasSecondStageEvents = false

  events.forEach(event => {
    const round = parseRoundNumber(event)
    if (!round) return

    const month = getEventMonth(event)
    if (!month) return

    if (month >= THESPORTSDB_SECOND_STAGE_MONTH) {
      hasSecondStageEvents = true
      return
    }

    earlyRounds.push(round)
  })

  const earlyMaxRound = earlyRounds.length > 0 ? Math.max(...earlyRounds) : 0

  if (!hasSecondStageEvents || earlyMaxRound <= 0) {
    return event => parseRoundNumber(event)
  }

  return event => {
    const round = parseRoundNumber(event)
    if (!round) return null

    const month = getEventMonth(event)
    if (month && month >= THESPORTSDB_SECOND_STAGE_MONTH && round <= earlyMaxRound) {
      return round + earlyMaxRound
    }

    return round
  }
}

function mapTheSportsDbEvent(event) {
  return {
    provider: 'thesportsdb',
    externalMatchId: String(event.idEvent),
    strFilename: event.strFilename || '',
    sport: event.strSport,
    homeName: event.strHomeTeam,
    awayName: event.strAwayTeam,
    homeLogo: event.strHomeTeamBadge || null,
    awayLogo: event.strAwayTeamBadge || null,
    roundNumber: event.intRound,
    roundRaw: event.intRound ? String(event.intRound) : '',
    matchDate: event.strTimestamp || (event.dateEvent && event.strTime ? `${event.dateEvent}T${event.strTime}` : null),
    homeScore: event.intHomeScore,
    awayScore: event.intAwayScore,
    status: event.strStatus || null,
  }
}

async function fetchTheSportsDbEventsBySeason(leagueId, season) {
  const url = `${THESPORTSDB_BASE_URL}/eventsseason.php?id=${encodeURIComponent(leagueId)}&s=${encodeURIComponent(season)}`
  const data = await fetchTheSportsDbJson(url, 'TheSportsDB season')
  const events = data?.events || []
  return events.map(mapTheSportsDbEvent)
}

async function fetchTheSportsDbEventsByRound(leagueId, season, round) {
  const url = `${THESPORTSDB_BASE_URL}/eventsround.php?id=${encodeURIComponent(leagueId)}&r=${encodeURIComponent(round)}&s=${encodeURIComponent(season)}`
  const data = await fetchTheSportsDbJson(url, `TheSportsDB round ${round}`)
  const events = data?.events || []
  return events.map(mapTheSportsDbEvent)
}

async function fetchTheSportsDbLeagueWindowEvents(leagueId, type) {
  const endpoint = type === 'next' ? 'eventsnextleague.php' : 'eventspastleague.php'
  const url = `${THESPORTSDB_BASE_URL}/${endpoint}?id=${encodeURIComponent(leagueId)}`
  const data = await fetchTheSportsDbJson(url, `TheSportsDB ${type} league`)
  const events = data?.events || []
  return events.map(mapTheSportsDbEvent)
}

function getRoundHints(events) {
  const hints = new Set()

  events.forEach(event => {
    const roundNumber = parseRoundNumber(event)
    if (roundNumber && roundNumber > 0) {
      hints.add(roundNumber)
    }
  })

  return hints
}

async function fetchTheSportsDbEvents(leagueId, season) {
  const seasonEvents = await fetchTheSportsDbEventsBySeason(leagueId, season)

  // These endpoints help discover the real "current" round so we don't over-query.
  const [pastEvents, nextEvents] = await Promise.all([
    fetchTheSportsDbLeagueWindowEvents(leagueId, 'past').catch(() => []),
    fetchTheSportsDbLeagueWindowEvents(leagueId, 'next').catch(() => []),
  ])

  const hintRounds = getRoundHints([...seasonEvents, ...pastEvents, ...nextEvents])
  const maxHintRound = hintRounds.size > 0 ? Math.max(...hintRounds) : 1
  const scanLimit = Math.min(Math.max(maxHintRound + 2, 8), THESPORTSDB_MAX_ROUNDS)

  const roundEvents = []
  let consecutiveEmptyRounds = 0
  let foundAnyRoundData = false

  for (let round = 1; round <= scanLimit; round += 1) {
    if (round > 1) {
      await sleep(THESPORTSDB_REQUEST_DELAY_MS)
    }

    try {
      const events = await fetchTheSportsDbEventsByRound(leagueId, season, round)
      if (events.length === 0) {
        consecutiveEmptyRounds += 1
        if (foundAnyRoundData && consecutiveEmptyRounds >= THESPORTSDB_EMPTY_ROUNDS_STOP) {
          break
        }
        continue
      }

      foundAnyRoundData = true
      consecutiveEmptyRounds = 0
      roundEvents.push(...events)
    } catch (error) {
      // On provider throttling/transient failures, keep season data as fallback.
      console.warn(`Unable to fetch TheSportsDB round ${round}: ${error.message}`)
      break
    }
  }

  const merged = new Map()

  seasonEvents.forEach(event => {
    merged.set(event.externalMatchId, event)
  })

  roundEvents.forEach(event => {
    // Prefer round payload because it is usually more complete/current.
    merged.set(event.externalMatchId, event)
  })

  return Array.from(merged.values())
}

async function fetchApiFootballEvents(leagueId, season) {
  const url = `${API_FOOTBALL_BASE_URL}/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API-Football error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const fixtures = data?.response || []
  const events = []

  fixtures.forEach(item => {
    events.push({
      provider: 'api-football',
      externalMatchId: String(item?.fixture?.id),
      strFilename: '',
      sport: 'Soccer',
      homeName: item?.teams?.home?.name,
      awayName: item?.teams?.away?.name,
      homeLogo: item?.teams?.home?.logo || null,
      awayLogo: item?.teams?.away?.logo || null,
      roundNumber: null,
      roundRaw: item?.league?.round || '',
      matchDate: item?.fixture?.date || null,
      homeScore: item?.goals?.home,
      awayScore: item?.goals?.away,
      status: item?.fixture?.status?.short || null,
    })
  })

  return events
}

async function fetchSeasonEvents() {
  if (IMPORT_PROVIDER === 'api-football') {
    return fetchApiFootballEvents(API_FOOTBALL_LEAGUE_ID, IMPORT_SEASON)
  }

  return fetchTheSportsDbEvents(THESPORTSDB_LEAGUE_ID, IMPORT_SEASON)
}

async function upsertTeams(events) {
  const teamsMap = new Map()

  for (const event of events) {
    const homeName = String(event.homeName || '').trim()
    const awayName = String(event.awayName || '').trim()

    if (homeName) {
      const slug = slugify(homeName)
      teamsMap.set(slug, {
        name: homeName,
        slug,
        logo_url: event.homeLogo || null,
      })
    }

    if (awayName) {
      const slug = slugify(awayName)
      teamsMap.set(slug, {
        name: awayName,
        slug,
        logo_url: event.awayLogo || null,
      })
    }
  }

  const teams = Array.from(teamsMap.values())
  if (teams.length === 0) return []

  const { data, error } = await supabase
    .from('teams')
    .upsert(teams, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id, slug, name')

  if (error) {
    throw new Error(`Unable to upsert teams: ${error.message}`)
  }

  return data || []
}

function buildRoundStatuses(roundsMap) {
  const now = Date.now()
  const openLookaheadMs = ROUND_OPEN_LOOKAHEAD_HOURS * 60 * 60 * 1000
  const staleRoundMs = ROUND_FORCE_FINISHED_AFTER_HOURS * 60 * 60 * 1000
  const ordered = Array.from(roundsMap.entries())
    .map(([roundNumber, events]) => ({
      roundNumber,
      events,
      allFinished: events.every(event => isFinished(event)),
      pendingDates: events
        .filter(event => !isFinished(event))
        .map(event => parseMatchDate(event))
        .filter(Boolean)
        .map(iso => new Date(iso).getTime())
        .filter(ts => !Number.isNaN(ts)),
      hasStarted: events.some(event => {
        const iso = parseMatchDate(event)
        if (!iso) return false
        return new Date(iso).getTime() <= now
      }),
    }))
    .sort((a, b) => a.roundNumber - b.roundNumber)

  const withComputedStatus = ordered.map(round => {
    const nextPendingTs = round.pendingDates.length > 0 ? Math.min(...round.pendingDates) : null
    const lastPendingTs = round.pendingDates.length > 0 ? Math.max(...round.pendingDates) : null

    let status = 'pending'

    if (round.allFinished || round.pendingDates.length === 0) {
      status = 'finished'
    } else if (lastPendingTs !== null && lastPendingTs < now - staleRoundMs) {
      status = 'finished'
    } else if (nextPendingTs !== null && nextPendingTs <= now + openLookaheadMs) {
      status = 'open-candidate'
    }

    return {
      round_number: round.roundNumber,
      status,
      nextPendingTs,
    }
  })

  const openCandidates = withComputedStatus.filter(round => round.status === 'open-candidate')
  const openRound =
    openCandidates.length > 0
      ? openCandidates.sort((a, b) => (a.nextPendingTs || Number.MAX_SAFE_INTEGER) - (b.nextPendingTs || Number.MAX_SAFE_INTEGER))[0]
      : null

  return withComputedStatus.map(round => ({
    round_number: round.round_number,
    status: openRound && openRound.round_number === round.round_number ? 'open' : round.status === 'finished' ? 'finished' : 'pending',
  }))
}

async function upsertRounds(events) {
  const resolveRoundNumber = createRoundNumberResolver(events)
  const roundsMap = new Map()

  for (const event of events) {
    const roundNumber = resolveRoundNumber(event)
    if (!roundNumber) continue

    const existing = roundsMap.get(roundNumber) || []
    existing.push(event)
    roundsMap.set(roundNumber, existing)
  }

  const rounds = buildRoundStatuses(roundsMap)
  if (rounds.length === 0) return []

  const { data, error } = await supabase
    .from('rounds')
    .upsert(rounds, { onConflict: 'round_number', ignoreDuplicates: false })
    .select('id, round_number, status')

  if (error) {
    throw new Error(`Unable to upsert rounds: ${error.message}`)
  }

  return data || []
}

function normalizeEventsToMatches(events, teamBySlug) {
  const resolveRoundNumber = createRoundNumberResolver(events)
  const groupedByRound = new Map()

  for (const event of events) {
    const roundNumber = resolveRoundNumber(event)
    if (!roundNumber) continue

    const homeSlug = slugify(String(event.homeName || ''))
    const awaySlug = slugify(String(event.awayName || ''))
    const homeTeam = teamBySlug.get(homeSlug)
    const awayTeam = teamBySlug.get(awaySlug)

    if (!homeTeam || !awayTeam) continue

    const normalized = {
      round_number: roundNumber,
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      match_date: parseMatchDate(event),
      home_score: parseNullableInt(event.homeScore),
      away_score: parseNullableInt(event.awayScore),
      is_finished: isFinished(event),
      external_provider: event.provider,
      external_match_id: event.externalMatchId,
      _sortDate: parseMatchDate(event) || '9999-12-31T23:59:59.000Z',
    }

    const current = groupedByRound.get(roundNumber) || []
    current.push(normalized)
    groupedByRound.set(roundNumber, current)
  }

  const matches = []

  for (const [roundNumber, list] of groupedByRound.entries()) {
    const ordered = list.sort((a, b) => {
      if (a._sortDate !== b._sortDate) return a._sortDate.localeCompare(b._sortDate)
      return a.external_match_id.localeCompare(b.external_match_id)
    })

    ordered.forEach((match, index) => {
      matches.push({
        round_number: roundNumber,
        match_number: index + 1,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        match_date: match.match_date,
        home_score: match.home_score,
        away_score: match.away_score,
        is_finished: match.is_finished,
        external_provider: match.external_provider,
        external_match_id: match.external_match_id,
      })
    })
  }

  return matches
}

async function upsertMatches(matches) {
  if (matches.length === 0) return []

  const { data, error } = await supabase
    .from('matches')
    .upsert(matches, { onConflict: 'round_number,match_number', ignoreDuplicates: false })
    .select('id, round_number, match_number, external_match_id')

  if (error) {
    throw new Error(`Unable to upsert matches: ${error.message}`)
  }

  return data || []
}

async function pruneStaleMatches(matches) {
  if (matches.length === 0) return

  const byRound = new Map()

  matches.forEach(match => {
    const currentMax = byRound.get(match.round_number) || 0
    if (match.match_number > currentMax) {
      byRound.set(match.round_number, match.match_number)
    }
  })

  for (const [roundNumber, maxMatchNumber] of byRound.entries()) {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('round_number', roundNumber)
      .gt('match_number', maxMatchNumber)

    if (error) {
      throw new Error(
        `Unable to prune stale matches for round ${roundNumber}: ${error.message}`
      )
    }
  }
}

async function run() {
  const sourceDescription =
    IMPORT_PROVIDER === 'api-football'
      ? `API-Football league=${API_FOOTBALL_LEAGUE_ID}`
      : `TheSportsDB league=${THESPORTSDB_LEAGUE_ID}`

  console.log(`Importing fixtures from ${sourceDescription} season=${IMPORT_SEASON}`)

  let events

  try {
    events = await fetchSeasonEvents()
  } catch (error) {
    if (IMPORT_PROVIDER === 'thesportsdb' && /429|1015|rate limited/i.test(String(error.message || ''))) {
      const { count, error: countError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })

      if (!countError && (count || 0) > 0) {
        console.warn('TheSportsDB is rate-limiting requests. Keeping existing fixtures and skipping import in this run.')
        return
      }
    }

    throw error
  }

  const soccerEvents = events.filter(event => String(event.sport || '').toLowerCase() === 'soccer')

  if (soccerEvents.length === 0) {
    console.log('No soccer events returned by provider for the selected league/season.')
    return
  }

  const teams = await upsertTeams(soccerEvents)
  const teamBySlug = new Map(teams.map(team => [team.slug, team]))

  await upsertRounds(soccerEvents)
  const matches = normalizeEventsToMatches(soccerEvents, teamBySlug)
  const savedMatches = await upsertMatches(matches)
  await pruneStaleMatches(matches)

  console.log(
    `Import finished. Events=${soccerEvents.length}, Teams=${teams.length}, MatchesUpserted=${savedMatches.length}`
  )
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
