import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useRounds = () => {
  const [rounds, setRounds] = useState([])
  const [activeRound, setActiveRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRounds = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .order('round_number', { ascending: true })

      if (error) throw error

      setRounds(data)

      // Encontrar la fecha activa (open)
      const active = data.find(r => r.status === 'open')
      setActiveRound(active)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  const updateRoundStatus = async (roundNumber, status) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('round_number', roundNumber)

      if (error) throw error

      setRounds(prev => {
        const updated = prev.map(r =>
          r.round_number === roundNumber
            ? { ...r, status, updated_at: new Date().toISOString() }
            : r
        )
        const active = updated.find(r => r.status === 'open')
        setActiveRound(active)
        return updated
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const lockRound = async roundNumber => {
    try {
      const { error } = await supabase
        .from('rounds')
        .update({ status: 'locked', updated_at: new Date().toISOString() })
        .eq('round_number', roundNumber)

      if (error) throw error

      setRounds(prev => {
        const updated = prev.map(r =>
          r.round_number === roundNumber
            ? { ...r, status: 'locked', updated_at: new Date().toISOString() }
            : r
        )
        const active = updated.find(r => r.status === 'open')
        setActiveRound(active)
        return updated
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const finishRound = async roundNumber => {
    try {
      const { error } = await supabase
        .from('rounds')
        .update({ status: 'finished', updated_at: new Date().toISOString() })
        .eq('round_number', roundNumber)

      if (error) throw error

      setRounds(prev => {
        const updated = prev.map(r =>
          r.round_number === roundNumber
            ? { ...r, status: 'finished', updated_at: new Date().toISOString() }
            : r
        )
        const active = updated.find(r => r.status === 'open')
        setActiveRound(active)
        return updated
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const openNextRound = async () => {
    try {
      // Buscar la primera fecha en estado 'pending' usando el estado actual
      let pendingRound = null
      setRounds(prev => {
        pendingRound = prev.find(r => r.status === 'pending')
        return prev
      })

      if (!pendingRound) {
        throw new Error('No hay fechas pendientes para abrir')
      }

      // Abrir la fecha pending
      await updateRoundStatus(pendingRound.round_number, 'open')

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const isRoundOpen = roundNumber => {
    const round = rounds.find(r => r.round_number === roundNumber)
    return round?.status === 'open'
  }

  const canPredictRound = roundNumber => isRoundOpen(roundNumber)

  return {
    rounds,
    activeRound,
    loading,
    error,
    fetchRounds,
    updateRoundStatus,
    openNextRound,
    lockRound,
    finishRound,
    isRoundOpen,
    canPredictRound,
  }
}
