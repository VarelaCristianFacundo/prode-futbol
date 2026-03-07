import { useCallback, memo, useRef } from 'react'
import TeamDisplay from '../../Common/TeamDisplay'

const MatchResult = ({ match, resultValues, onValueChange }) => {
  const awayInputRef = useRef(null)

  const handleInputChange = useCallback(
    (field, value) => {
      // Permitir vacío o solo un dígito (0-9)
      if (value === '' || /^[0-9]$/.test(value)) {
        onValueChange(match.id, field, value)

        // Si se ingresó un valor en el input home, pasar al away
        if (field === 'home' && value !== '' && awayInputRef.current) {
          awayInputRef.current.focus()
        }
      }
    },
    [onValueChange, match.id]
  )

  const homeScore = resultValues[match.id]?.home || ''
  const awayScore = resultValues[match.id]?.away || ''

  // Si ya tiene resultado, mostrar valores guardados
  const displayHomeValue = match.is_finished
    ? resultValues[match.id]?.home || match.home_score?.toString() || ''
    : homeScore

  const displayAwayValue = match.is_finished
    ? resultValues[match.id]?.away || match.away_score?.toString() || ''
    : awayScore

  // Formatear fecha
  const matchDate = new Date(match.match_date)
  const formattedDate = matchDate.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  const formattedTime = matchDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  })

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(to bottom, var(--color-surface), var(--color-surface-variant))',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '8px',
      }}
    >
      {/* Match Number */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '700',
        }}
      >
        #{match.match_number || '?'}
      </div>

      {/* Match Status Badge */}
      {match.is_finished && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'var(--color-success)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
          }}
        >
          Finalizado
        </div>
      )}

      {/* Match Date and Time */}
      <div
        style={{
          marginTop: '36px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--color-text-secondary)',
          }}
        >
          📅 {formattedDate} • 🕐 {formattedTime}
        </span>
      </div>

      {/* Teams and Score */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto 1fr',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {/* Home Team */}
          <div style={{ justifySelf: 'end', textAlign: 'center' }}>
            <TeamDisplay team={match.home_team} size="sm" showNameBelow />
          </div>

          {/* Home Score Input */}
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayHomeValue}
            onChange={e => handleInputChange('home', e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="-"
            style={{
              width: '50px',
              padding: '10px 6px',
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: '700',
              borderRadius: '10px',
              border: match.is_finished
                ? '3px solid var(--color-success)'
                : '3px solid var(--color-primary)',
              backgroundColor: 'var(--color-surface)',
              color: match.is_finished ? 'var(--color-success)' : 'var(--color-primary)',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />

          {/* Separator */}
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: 'var(--color-text-secondary)',
              padding: '0 2px',
            }}
          >
            -
          </span>

          {/* Away Score Input */}
          <input
            ref={awayInputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayAwayValue}
            onChange={e => handleInputChange('away', e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="-"
            style={{
              width: '50px',
              padding: '10px 6px',
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: '700',
              borderRadius: '10px',
              border: match.is_finished
                ? '3px solid var(--color-success)'
                : '3px solid var(--color-primary)',
              backgroundColor: 'var(--color-surface)',
              color: match.is_finished ? 'var(--color-success)' : 'var(--color-primary)',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />

          {/* Away Team */}
          <div style={{ justifySelf: 'start', textAlign: 'center' }}>
            <TeamDisplay team={match.away_team} size="sm" showNameBelow />
          </div>
        </div>
      </div>

      {/* Indicador de resultado guardado */}
      {match.is_finished && (
        <p
          style={{
            textAlign: 'center',
            marginTop: '12px',
            fontSize: '0.85rem',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontWeight: '600',
          }}
        >
          <span>✓</span>
          <span>Resultado guardado (se actualizará al guardar todos)</span>
        </p>
      )}
    </div>
  )
}

export default memo(MatchResult)
