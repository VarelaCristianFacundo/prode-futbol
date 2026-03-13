import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ override: true })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Step 1: fix is_finished where scores are set but flag is false
const { error: fixErr } = await supabase
  .from('matches')
  .update({ is_finished: true })
  .not('home_score', 'is', null)
  .not('away_score', 'is', null)
  .eq('is_finished', false)
console.log('is_finished corregido:', fixErr ? fixErr.message : 'OK')

// Step 2: load all matches grouped by round
const { data: matches } = await supabase.from('matches').select('round_number, is_finished, home_score, away_score')
const map = {}
for (const m of matches) {
  if (!map[m.round_number]) map[m.round_number] = { total: 0, finished: 0 }
  map[m.round_number].total++
  if (m.is_finished || (m.home_score !== null && m.away_score !== null)) map[m.round_number].finished++
}

// Step 3: load current round statuses, highest first
const { data: rounds } = await supabase.from('rounds').select('round_number, status').order('round_number', { ascending: false })

let openAssigned = false
const updates = []

for (const r of rounds) {
  if (r.status === 'finished') continue
  const mInfo = map[r.round_number] || { total: 0, finished: 0 }
  let newStatus
  if (mInfo.total > 0 && mInfo.finished === mInfo.total) {
    newStatus = 'finished'
  } else if (mInfo.finished > 0 && !openAssigned) {
    newStatus = 'open'
    openAssigned = true
  } else if (mInfo.finished > 0 && openAssigned) {
    newStatus = 'locked'
  } else {
    newStatus = 'pending'
  }
  if (newStatus !== r.status) updates.push({ round_number: r.round_number, from: r.status, to: newStatus })
}

console.log(`\nFechas a actualizar: ${updates.length}`)
for (const u of updates) {
  const { error } = await supabase.from('rounds').update({ status: u.to, updated_at: new Date().toISOString() }).eq('round_number', u.round_number)
  console.log(`  Fecha ${u.round_number}: ${u.from} -> ${u.to}  ${error ? error.message : 'OK'}`)
}
console.log('\nListo!')
