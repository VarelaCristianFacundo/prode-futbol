import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useTeams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setTeams(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const getTeamByName = useCallback(name => teams.find(t => t.name === name), [teams])

  const getTeamById = useCallback(id => teams.find(t => t.id === id), [teams])

  return {
    teams,
    loading,
    error,
    fetchTeams,
    getTeamByName,
    getTeamById,
  }
}
