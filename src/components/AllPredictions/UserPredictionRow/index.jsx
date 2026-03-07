const UserPredictionRow = ({ user, prediction, isFinished }) => {
  return (
    <div
      className="card match-prediction-row"
      style={{
        padding: '10px 12px',
        background:
          'linear-gradient(to bottom, var(--color-surface), var(--color-surface-variant))',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'nowrap',
      }}
    >
      <div className="match-prediction-user" style={{ minWidth: '160px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
          {user.username}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          @{user.full_name}
        </div>
      </div>
      <div>
        {prediction && (
          <>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Pronóstico
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              {prediction.home_prediction} - {prediction.away_prediction}
            </div>
          </>
        )}
      </div>

      <div className="match-prediction-score" style={{ textAlign: 'center' }}>
        <div>
          {isFinished && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: prediction.points > 0 ? '#10b981' : '#ef4444',
              }}
            >
              {prediction.points > 0 ? '✅' : '❌'} {prediction.points} pts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserPredictionRow
