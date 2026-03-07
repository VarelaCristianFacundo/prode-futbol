import { useEffect, useCallback, memo, useRef } from 'react'
import TeamDisplay from '../../Common/TeamDisplay'
import InfoButton from '../../Common/InfoButton'

const MatchPrediction = ({
  match,
  existingPrediction,
  isRoundOpen,
  predictionValue,
  onValueChange,
}) => {
  const awayInputRef = useRef(null)

  const isGameOfTheRound = match.round_number === match.match_number

  const canPredict = useCallback(matchDate => {
    const cutoffTime = new Date(new Date(matchDate).getTime() - 20 * 60 * 1000)
    return new Date() < cutoffTime
  }, [])

  // Solo se puede predecir si la fecha está abierta Y falta más de 1 hora para el partido
  const canPredictMatch = isRoundOpen && canPredict(match.match_date)

  // Inicializar valores desde predicción existente
  useEffect(() => {
    if (existingPrediction && !predictionValue) {
      onValueChange(match.id, 'home', existingPrediction.home_prediction.toString())
      onValueChange(match.id, 'away', existingPrediction.away_prediction.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPrediction, match.id, predictionValue])

  const handleInputChange = useCallback(
    (field, value) => {
      // Solo permitir cambios si se puede predecir
      if (!canPredictMatch) return

      // Permitir vacío o solo un dígito (0-9)
      if (value === '' || /^[0-9]$/.test(value)) {
        onValueChange(match.id, field, value)

        // Si se ingresó un valor en el input home, pasar al away
        if (field === 'home' && value !== '' && awayInputRef.current) {
          awayInputRef.current.focus()
        }
      }
    },
    [canPredictMatch, onValueChange, match.id]
  )

  const homeScore = predictionValue?.home || ''
  const awayScore = predictionValue?.away || ''

  // Si no se puede editar, mostrar valor guardado o placeholder
  const displayHomeValue = canPredictMatch
    ? homeScore
    : existingPrediction?.home_prediction?.toString() || '-'

  const displayAwayValue = canPredictMatch
    ? awayScore
    : existingPrediction?.away_prediction?.toString() || '-'

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
        opacity: !canPredictMatch && !match.is_finished && !existingPrediction ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
        background: isGameOfTheRound
          ? 'var(--color-match-highlight)'
          : 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-variant))',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '8px',
      }}
    >
      {/* Match Number (ID visible) */}
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

      {isGameOfTheRound && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '55px',
            zIndex: 2,
          }}
        >
          <InfoButton message="Partido de la fecha" ariaLabel="Partido de la fecha" />
        </div>
      )}

      {/* Match Status Badge */}
      {match.is_finished ? (
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
      ) : !canPredict(match.match_date) ? (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          ⚽ En Juego
        </div>
      ) : null}

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
        {/* Diseño horizontal compacto */}
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
          {canPredictMatch ? (
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={homeScore}
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
                border: '3px solid var(--color-primary)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div
              style={{
                width: '50px',
                padding: '10px 6px',
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: '700',
                borderRadius: '10px',
                border: '3px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: existingPrediction ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {displayHomeValue}
            </div>
          )}

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
          {canPredictMatch ? (
            <input
              ref={awayInputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={awayScore}
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
                border: '3px solid var(--color-primary)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div
              style={{
                width: '50px',
                padding: '10px 6px',
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: '700',
                borderRadius: '10px',
                border: '3px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: existingPrediction ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {displayAwayValue}
            </div>
          )}

          {/* Away Team */}
          <div style={{ justifySelf: 'start', textAlign: 'center' }}>
            <TeamDisplay team={match.away_team} size="sm" showNameBelow />
          </div>
        </div>
      </div>

      {/* Match Result and Points */}
      {match.is_finished && (
        <div
          style={{
            backgroundColor:
              existingPrediction?.points > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${existingPrediction?.points > 0 ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                }}
              >
                ⚽ Resultado Final:{' '}
                <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  {match.home_score} - {match.away_score}
                </span>
              </p>
              {existingPrediction && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  Tu pronóstico: {existingPrediction.home_prediction} -{' '}
                  {existingPrediction.away_prediction}
                </p>
              )}
            </div>
            {existingPrediction && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: existingPrediction.points > 0 ? '#10b981' : '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>
                  {existingPrediction.points > 0 ? '✅' : '❌'}
                </span>
                <span>{existingPrediction.points || 0} pts</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {!isRoundOpen && !match.is_finished && !existingPrediction && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '12px 16px',
            textAlign: 'center',
            color: '#dc2626',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          🔒 No cargaste pronóstico para este partido
        </div>
      )}

      {isRoundOpen && !canPredict(match.match_date) && !match.is_finished && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '12px 16px',
            textAlign: 'center',
            color: '#d97706',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          ⏰ Ya no se pueden cargar pronósticos para este partido
        </div>
      )}

      {/* Indicador de pronóstico guardado */}
      {canPredictMatch && existingPrediction && (
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
          <span>Pronóstico guardado (se actualizará al guardar todos)</span>
        </p>
      )}
    </div>
  )
}

export default memo(MatchPrediction)
