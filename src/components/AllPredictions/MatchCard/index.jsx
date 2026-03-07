import TeamDisplay from '../../Common/TeamDisplay'
import MatchStatusBadge from '../MatchStatusBadge'

const CARD_STYLE = {
  padding: '12px',
  background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-variant))',
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const MatchCard = ({ match, prediction, started }) => {
  return (
    <div className="card" style={{ ...CARD_STYLE, opacity: started ? 1 : 0.6 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '700',
          }}
        >
          Partido #{match.match_number}
        </span>
        <MatchStatusBadge match={match} />
      </div>

      {/* Teams + Prediction */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div style={{ justifySelf: 'end', textAlign: 'center' }}>
          <TeamDisplay team={match.home_team} size="sm" showNameBelow />
        </div>

        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          {prediction ? (
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '2px',
                }}
              >
                Pronóstico
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {prediction.home_prediction} - {prediction.away_prediction}
              </div>
              {match.is_finished && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '2px',
                    }}
                  >
                    Resultado Real
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
                    {match.home_score} - {match.away_score}
                  </div>
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
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
              }}
            >
              Sin pronóstico
            </div>
          )}
        </div>

        <div style={{ justifySelf: 'start', textAlign: 'center' }}>
          <TeamDisplay team={match.away_team} size="sm" showNameBelow />
        </div>
      </div>
    </div>
  )
}

export default MatchCard
