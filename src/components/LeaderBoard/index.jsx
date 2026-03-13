import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useRoundWinners } from '../../hooks/useRoundWinners'
import { useRounds } from '../../hooks/useRounds'
import LeaderboardHeader from './LeadboardHeader'
import LeaderboardTable from './LeaderboardTable'
import RoundWinnersTable from './RoundWinnersTable'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function Leaderboard({ onViewPredictions }) {
  const [selectedRound, setSelectedRound] = useState(null)
  const [view, setView] = useState('general') // 'general' | 'winners'
  const { leaderboard, loading, error } = useLeaderboard(selectedRound)
  const { winners, loading: winnersLoading, error: winnersError } = useRoundWinners()
  const { rounds, loading: roundsLoading } = useRounds()

  const isLoading = view === 'general' ? loading : winnersLoading
  const currentError = view === 'general' ? error : winnersError

  if (isLoading) {
    return (
      <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
        <LoadingSpinner size="md" label="Cargando tabla de posiciones..." />
      </div>
    )
  }

  if (currentError) {
    return (
      <div className="container" style={{ maxWidth: '1000px' }}>
        <ErrorMessage error={currentError} />
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
        view={view}
        setView={setView}
      />

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {view === 'general' ? (
          <LeaderboardTable
            leaderboard={leaderboard}
            selectedRound={selectedRound}
            onViewPredictions={onViewPredictions}
          />
        ) : (
          <RoundWinnersTable winners={winners} />
        )}
      </div>
    </div>
  )
}
