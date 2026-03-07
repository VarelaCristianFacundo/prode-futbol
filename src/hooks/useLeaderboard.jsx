import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useLeaderboard = (roundNumber = null) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)

      if (roundNumber) {
        // Tabla de posiciones por fecha específica
        const { data: roundScoresData, error: roundError } = await supabase
          .from('round_scores')
          .select(
            `
            user_id,
            total_points,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `
          )
          .eq('round_number', roundNumber)
          .order('total_points', { ascending: false })

        if (roundError) throw roundError

        // Transformar los datos al formato esperado
        const formattedData = roundScoresData.map(item => ({
          id: item.profiles.id,
          username: item.profiles.username,
          full_name: item.profiles.full_name,
          avatar_url: item.profiles.avatar_url,
          round_number: roundNumber,
          total_points: item.total_points,
        }))

        setLeaderboard(formattedData)
      } else {
        // Tabla de posiciones general - usar vista optimizada
        const { data, error: viewError } = await supabase.from('general_leaderboard').select('*')

        if (viewError) throw viewError

        setLeaderboard(data || [])
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [roundNumber])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
  }
}
