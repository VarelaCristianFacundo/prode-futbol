import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const emptyStats = {
  metrics: {
    totalPoints: 0,
    hitPercentage: 0,
    avgPerRound: 0,
  },
  evolutionByRound: [],
  bestRound: {
    roundNumber: null,
    points: 0,
  },
  worstRound: {
    roundNumber: null,
    points: 0,
  },
  accuracyBreakdown: {
    exactScores: 0,
    winnerHits: 0,
    bonusGoals: 0,
    totalAnalyzed: 0,
    goalDiffCorrect: 0,
    winnerOnly: 0,
    errors: 0,
  },
  additionalStats: {
    totalPredictions: 0,
    avgPointsPerMatch: 0,
    finishedMatches: 0,
  },
}

export const usePersonalStats = userId => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadStats = async () => {
      if (!userId) {
        if (mounted) {
          setStats(emptyStats)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_personal_stats')

      if (!mounted) return

      if (rpcError) {
        setError('No se pudieron cargar las estadísticas personales')
        setLoading(false)
        return
      }

      setStats(data || emptyStats)
      setLoading(false)
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [userId])

  return { stats, loading, error }
}
