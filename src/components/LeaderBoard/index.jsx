import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useRounds } from '../../hooks/useRounds'
import LeaderboardHeader from './LeadboardHeader'
import LeaderboardTable from './LeaderboardTable'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function Leaderboard({ onViewPredictions }) {
  const [selectedRound, setSelectedRound] = useState(null)
  const { leaderboard, loading, error } = useLeaderboard(selectedRound)
  const { rounds, loading: roundsLoading } = useRounds()

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
        <LoadingSpinner size="md" label="Cargando tabla de posiciones..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '1000px' }}>
        <ErrorMessage error={error} />
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <LeaderboardHeader
        selectedRound={selectedRound}
        setSelectedRound={setSelectedRound}
        rounds={rounds}
        roundsLoading={roundsLoading}
      />

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <LeaderboardTable
          leaderboard={leaderboard}
          selectedRound={selectedRound}
          onViewPredictions={onViewPredictions}
        />
      </div>
    </div>
  )
}
