import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRounds } from './useRounds'
import { useMatches } from './useMatches'
import { supabase } from '../lib/supabase'

export function useAllPredictions({ initialRound = null, initialUser = '' } = {}) {
  const { rounds, loading: roundsLoading } = useRounds()
  const [selectedRound, setSelectedRound] = useState(null)
  const { matches, loading: matchesLoading } = useMatches(selectedRound)
  const [roundPredictions, setRoundPredictions] = useState({})
  const [matchPredictions, setMatchPredictions] = useState({})
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [viewMode, setViewMode] = useState('by-user')

  useEffect(() => {
    if (initialRound) setSelectedRound(initialRound)
  }, [initialRound])
  useEffect(() => {
    if (initialUser) setSelectedUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    setSelectedMatchId(null)
    setMatchPredictions({})
  }, [selectedRound])

  useEffect(() => {
    if (viewMode === 'by-user') {
      setSelectedMatchId(null)
      setMatchPredictions({})
    } else {
      setSelectedUser('')
      setRoundPredictions({})
    }
  }, [viewMode])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .order('full_name')
        if (error) throw error
        setUsers(data || [])
      } catch {
        /* silent */
      }
    }
    fetchUsers()
  }, [])

  const currentRound = useMemo(
    () => rounds.find(r => r.round_number === selectedRound),
    [rounds, selectedRound]
  )
  const isRoundOpen = currentRound?.status === 'open'

  const availableRounds = useMemo(
    () => rounds.filter(r => ['locked', 'finished'].includes(r.status)),
    [rounds]
  )

  const selectedUserData = useMemo(
    () => users.find(u => u.id === selectedUser),
    [users, selectedUser]
  )

  const selectedMatch = useMemo(
    () => matches.find(m => m.id === selectedMatchId),
    [matches, selectedMatchId]
  )

  const hasMatchStarted = useCallback(match => new Date() >= new Date(match.match_date), [])

  const fetchPredictionsForRound = useCallback(async () => {
    if (!selectedRound || !selectedUser || !matches.length) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .in(
          'match_id',
          matches.map(m => m.id)
        )
        .eq('user_id', selectedUser)
      if (error) throw error
      const byMatch = {}
      data?.forEach(pred => {
        byMatch[pred.match_id] = pred
      })
      setRoundPredictions(byMatch)
    } catch {
      setRoundPredictions({})
    } finally {
      setLoading(false)
    }
  }, [selectedRound, selectedUser, matches])

  const fetchPredictionsForMatch = useCallback(async () => {
    if (!selectedMatchId) return
    setMatchLoading(true)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', selectedMatchId)
      if (error) throw error
      const byUser = {}
      data?.forEach(pred => {
        byUser[pred.user_id] = pred
      })
      setMatchPredictions(byUser)
    } catch {
      setMatchPredictions({})
    } finally {
      setMatchLoading(false)
    }
  }, [selectedMatchId])

  useEffect(() => {
    if (viewMode !== 'by-user') return
    if (selectedRound && selectedUser && !isRoundOpen) fetchPredictionsForRound()
    else setRoundPredictions({})
  }, [viewMode, selectedRound, selectedUser, isRoundOpen, fetchPredictionsForRound])

  useEffect(() => {
    if (viewMode !== 'by-match') return
    if (selectedRound && selectedMatchId && !isRoundOpen) fetchPredictionsForMatch()
    else setMatchPredictions({})
  }, [viewMode, selectedRound, selectedMatchId, isRoundOpen, fetchPredictionsForMatch])

  return {
    rounds,
    roundsLoading,
    availableRounds,
    matches,
    matchesLoading,
    users,
    selectedUser,
    setSelectedUser,
    selectedUserData,
    selectedRound,
    setSelectedRound,
    selectedMatchId,
    setSelectedMatchId,
    selectedMatch,
    viewMode,
    setViewMode,
    isRoundOpen,
    roundPredictions,
    matchPredictions,
    loading,
    matchLoading,
    hasMatchStarted,
  }
}
