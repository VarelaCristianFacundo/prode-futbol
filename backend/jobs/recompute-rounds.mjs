import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ override: true })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMPORT_SEASON = Number(process.env.IMPORT_SEASON || new Date().getUTCFullYear())
const THESPORTSDB_SECOND_STAGE_MONTH = Number(process.env.THESPORTSDB_SECOND_STAGE_MONTH || 7)
const ROUND_OPEN_LOOKAHEAD_HOURS = Number(process.env.ROUND_OPEN_LOOKAHEAD_HOURS || 120)
const ROUND_FORCE_FINISHED_AFTER_HOURS = Number(process.env.ROUND_FORCE_FINISHED_AFTER_HOURS || 72)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

function parseDateParts(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return {
    ts: date.getTime(),
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

function computeRoundStatuses(matches) {
  const now = Date.now()
  const openLookaheadMs = ROUND_OPEN_LOOKAHEAD_HOURS * 60 * 60 * 1000
  const staleRoundMs = ROUND_FORCE_FINISHED_AFTER_HOURS * 60 * 60 * 1000

  const grouped = new Map()
  matches.forEach(match => {
    const list = grouped.get(match.round_number) || []
    list.push(match)
    grouped.set(match.round_number, list)
  })

  const computed = Array.from(grouped.entries())
    .map(([roundNumber, roundMatches]) => {
      const pendingDates = roundMatches
        .filter(match => !match.is_finished)
        .map(match => parseDateParts(match.match_date))
        .filter(Boolean)
        .map(x => x.ts)

      const allFinished = roundMatches.length > 0 && roundMatches.every(match => match.is_finished)
      const nextPendingTs = pendingDates.length > 0 ? Math.min(...pendingDates) : null
      const lastPendingTs = pendingDates.length > 0 ? Math.max(...pendingDates) : null

      let status = 'pending'
      if (allFinished || pendingDates.length === 0) {
        status = 'finished'
      } else if (lastPendingTs !== null && lastPendingTs < now - staleRoundMs) {
        status = 'finished'
      } else if (nextPendingTs !== null && nextPendingTs <= now + openLookaheadMs) {
        status = 'open-candidate'
      }

      return {
        round_number: roundNumber,
        status,
        nextPendingTs,
      }
    })
    .sort((a, b) => a.round_number - b.round_number)

  const openCandidates = computed.filter(x => x.status === 'open-candidate')
  const openRound =
    openCandidates.length > 0
      ? openCandidates.sort((a, b) => (a.nextPendingTs || Number.MAX_SAFE_INTEGER) - (b.nextPendingTs || Number.MAX_SAFE_INTEGER))[0]
      : null

  return computed.map(item => ({
    round_number: item.round_number,
    status: openRound && openRound.round_number === item.round_number ? 'open' : item.status === 'finished' ? 'finished' : 'pending',
  }))
}

async function run() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, round_number, match_number, match_date, is_finished, external_provider')

  if (error) {
    throw new Error(`Unable to load matches: ${error.message}`)
  }

  const allMatches = matches || []
  const seasonTsdb = allMatches.filter(match => {
    if (match.external_provider !== 'thesportsdb') return false
    const parsed = parseDateParts(match.match_date)
    if (!parsed) return false
    return parsed.year === IMPORT_SEASON
  })

  const earlyRounds = seasonTsdb
    .map(match => ({
      round: Number(match.round_number),
      parsed: parseDateParts(match.match_date),
    }))
    .filter(x => Number.isInteger(x.round) && x.round > 0 && x.parsed && x.parsed.month < THESPORTSDB_SECOND_STAGE_MONTH)
    .map(x => x.round)

  const earlyMaxRound = earlyRounds.length > 0 ? Math.max(...earlyRounds) : 0

  const targetById = new Map()
  for (const match of allMatches) {
    const parsed = parseDateParts(match.match_date)
    let targetRound = Number(match.round_number)

    if (
      match.external_provider === 'thesportsdb' &&
      parsed &&
      parsed.year === IMPORT_SEASON &&
      parsed.month >= THESPORTSDB_SECOND_STAGE_MONTH &&
      earlyMaxRound > 0 &&
      targetRound > 0 &&
      targetRound <= earlyMaxRound
    ) {
      targetRound = targetRound + earlyMaxRound
    }

    targetById.set(match.id, {
      ...match,
      targetRound,
      ts: parsed?.ts || Number.MAX_SAFE_INTEGER,
    })
  }

  const byRound = new Map()
  for (const item of targetById.values()) {
    const list = byRound.get(item.targetRound) || []
    list.push(item)
    byRound.set(item.targetRound, list)
  }

  const updates = []
  for (const [round, list] of byRound.entries()) {
    list.sort((a, b) => {
      if (a.ts !== b.ts) return a.ts - b.ts
      return a.id - b.id
    })

    list.forEach((item, index) => {
      const targetMatchNumber = index + 1
      if (item.round_number !== round || item.match_number !== targetMatchNumber) {
        updates.push({
          id: item.id,
          round_number: round,
          match_number: targetMatchNumber,
        })
      }
    })
  }

  const targetRoundRows = Array.from(byRound.keys())
    .sort((a, b) => a - b)
    .map(round => ({ round_number: round, status: 'pending' }))

  if (targetRoundRows.length > 0) {
    const { error: ensureRoundsError } = await supabase
      .from('rounds')
      .upsert(targetRoundRows, { onConflict: 'round_number', ignoreDuplicates: false })

    if (ensureRoundsError) {
      throw new Error(`Unable to ensure rounds before match remap: ${ensureRoundsError.message}`)
    }
  }

  if (updates.length > 0) {
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          round_number: update.round_number,
          match_number: update.match_number,
        })
        .eq('id', update.id)

      if (updateError) {
        throw new Error(`Unable to update match ${update.id}: ${updateError.message}`)
      }
    }
  }

  const { data: refreshedMatches, error: refreshedError } = await supabase
    .from('matches')
    .select('round_number, match_date, is_finished')

  if (refreshedError) {
    throw new Error(`Unable to reload matches: ${refreshedError.message}`)
  }

  const statuses = computeRoundStatuses(refreshedMatches || [])

  const { error: roundsUpsertError } = await supabase
    .from('rounds')
    .upsert(statuses, { onConflict: 'round_number', ignoreDuplicates: false })

  if (roundsUpsertError) {
    throw new Error(`Unable to upsert rounds: ${roundsUpsertError.message}`)
  }

  const activeRounds = new Set((refreshedMatches || []).map(match => match.round_number))
  const { data: currentRounds, error: currentRoundsError } = await supabase
    .from('rounds')
    .select('round_number')

  if (currentRoundsError) {
    throw new Error(`Unable to fetch current rounds: ${currentRoundsError.message}`)
  }

  const staleRounds = (currentRounds || [])
    .map(row => row.round_number)
    .filter(round => !activeRounds.has(round))

  for (const round of staleRounds) {
    const { error: deleteError } = await supabase.from('rounds').delete().eq('round_number', round)
    if (deleteError) {
      throw new Error(`Unable to delete stale round ${round}: ${deleteError.message}`)
    }
  }

  const openRounds = statuses.filter(x => x.status === 'open').map(x => x.round_number)

  console.log(
    `Recomputed rounds. MatchesUpdated=${updates.length}, RoundsUpserted=${statuses.length}, StaleRoundsDeleted=${staleRounds.length}, OpenRounds=${openRounds.join(',') || 'none'}`
  )
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
