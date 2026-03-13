import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useRoundWinners = () => {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWinners = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('round_scores')
        .select(
          `
          user_id,
          round_number,
          total_points,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .order('round_number', { ascending: false })
        .order('total_points', { ascending: false })

      if (fetchError) throw fetchError

      // For each round, get the top scorer(s), handling ties
      const winnersMap = new Map()
      data.forEach(item => {
        if (!winnersMap.has(item.round_number)) {
          winnersMap.set(item.round_number, {
            round_number: item.round_number,
            total_points: item.total_points,
            winners: [
              {
                id: item.profiles.id,
                username: item.profiles.username,
                full_name: item.profiles.full_name,
              },
            ],
          })
        } else {
          const existing = winnersMap.get(item.round_number)
          if (item.total_points === existing.total_points) {
            existing.winners.push({
              id: item.profiles.id,
              username: item.profiles.username,
              full_name: item.profiles.full_name,
            })
          }
        }
      })

      setWinners([...winnersMap.values()])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWinners()
  }, [fetchWinners])

  return { winners, loading, error }
}
