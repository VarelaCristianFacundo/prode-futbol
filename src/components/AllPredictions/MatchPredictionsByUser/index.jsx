import MatchCard from '../MatchCard'

const MatchPredictionsByUser = ({ matches, roundPredictions, hasMatchStarted, loading }) => {
  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando pronósticos...</p>
      </div>
    )

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={roundPredictions[match.id]}
            started={hasMatchStarted(match)}
          />
        ))}
      </div>
    </div>
  )
}

export default MatchPredictionsByUser
