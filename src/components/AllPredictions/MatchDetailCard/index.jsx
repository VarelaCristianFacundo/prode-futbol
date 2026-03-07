import TeamDisplay from '../../Common/TeamDisplay'
import MatchStatusBadge from '../MatchStatusBadge'

const MatchDetailCard = ({ match }) => {
  return (
    <div
      className="card"
      style={{
        padding: '16px',
        marginBottom: '16px',
        background:
          'linear-gradient(to bottom, var(--color-surface), var(--color-surface-variant))',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
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
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '2px',
            }}
          >
            Resultado Real
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            {match.is_finished
              ? `${match.home_score ?? '-'} - ${match.away_score ?? '-'}`
              : 'En juego'}
          </div>
        </div>

        <div style={{ justifySelf: 'start', textAlign: 'center' }}>
          <TeamDisplay team={match.away_team} size="sm" showNameBelow />
        </div>
      </div>
    </div>
  )
}

export default MatchDetailCard
