import MatchDetailCard from '../MatchDetailCard'
import UserPredictionRow from '../UserPredictionRow'

const MatchPredictionsByMatch = ({ selectedMatch, users, matchPredictions, matchLoading }) => {
  return (
    <div>
      {selectedMatch && <MatchDetailCard match={selectedMatch} />}

      {matchLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Cargando pronósticos...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users
            .filter(user => matchPredictions[user.id])
            .map(user => (
              <UserPredictionRow
                key={user.id}
                user={user}
                prediction={matchPredictions[user.id]}
                isFinished={selectedMatch?.is_finished}
              />
            ))}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .match-prediction-score { min-width: 80px; }
        }
      `}</style>
    </div>
  )
}

export default MatchPredictionsByMatch
