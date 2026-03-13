import { useState, useEffect } from 'react'
import { Calendar, User, CircleDot } from 'lucide-react'
import MatchSelector from '../MatchSelector'
import SelectDropdown from '../../Common/SelectDropdown'

const RoundUserSelectors = ({
  availableRounds,
  selectedRound,
  onRoundChange,
  viewMode,
  users,
  selectedUser,
  onUserChange,
  matches,
  matchesLoading,
  selectedMatchId,
  onMatchChange,
}) => {
  const [showAllRounds, setShowAllRounds] = useState(false)

  // Seleccionar automáticamente la última fecha si no hay seleccionada
  useEffect(() => {
    if (!selectedRound && availableRounds.length > 0) {
      const lastRound = availableRounds[availableRounds.length - 1]
      onRoundChange(lastRound.round_number)
    }
  }, [availableRounds, selectedRound, onRoundChange])

  // Seleccionar automáticamente el primer partido cuando se cambia a vista por partido
  useEffect(() => {
    if (viewMode === 'by-match' && matches.length > 0 && !selectedMatchId) {
      onMatchChange(matches[0].id)
    }
  }, [viewMode, matches, selectedMatchId, onMatchChange])

  // Cuando cambia la fecha en vista "por partido", seleccionar el primer partido nuevamente
  useEffect(() => {
    if (viewMode === 'by-match' && selectedRound && matches.length > 0) {
      onMatchChange(matches[0].id)
    }
  }, [selectedRound, viewMode, matches, onMatchChange])

  // Limpiar usuario seleccionado cuando se cambia a vista "por usuario"
  useEffect(() => {
    if (viewMode === 'by-user' && selectedUser) {
      // El usuario se mantiene automáticamente, no necesita limpieza
    }
  }, [viewMode, selectedUser])

  // Limpiar match seleccionado cuando se cambia a vista "por usuario"
  useEffect(() => {
    if (viewMode === 'by-user') {
      onMatchChange(null)
    }
  }, [viewMode, onMatchChange])

  // Obtener las últimas 3 fechas
  const recentRounds = availableRounds.slice(-3)
  const allOtherRounds = availableRounds.slice(0, availableRounds.length - 3).reverse()

  const getRoundLabel = round => {
    return `Fecha ${round.round_number} ${round.status === 'finished' ? '(fin)' : ''}`
  }

  return (
    <>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}
        className="responsive-selectors"
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> Seleccioná una Fecha
            </label>
            {availableRounds.length > 3 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowAllRounds(!showAllRounds)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    minHeight: 'min-content',
                    padding: 0,
                  }}
                >
                  Ver todas
                </button>
                {showAllRounds && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'var(--color-surface)',
                      border: '2px solid var(--color-primary)',
                      borderRadius: '10px',
                      minWidth: '250px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      zIndex: 100,
                      marginTop: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {allOtherRounds.map(round => (
                      <button
                        key={round.id}
                        onClick={() => {
                          onRoundChange(round.round_number)
                          setShowAllRounds(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background:
                            selectedRound === round.round_number
                              ? 'var(--color-primary)'
                              : 'transparent',
                          color:
                            selectedRound === round.round_number
                              ? 'white'
                              : 'var(--color-text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 200ms',
                          borderBottom: '1px solid var(--color-border)',
                          fontSize: '0.95rem',
                        }}
                        onMouseEnter={e => {
                          if (selectedRound !== round.round_number) {
                            e.target.style.background = 'var(--color-surface-variant)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (selectedRound !== round.round_number) {
                            e.target.style.background = 'transparent'
                          }
                        }}
                      >
                        {getRoundLabel(round)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {recentRounds.map(round => (
              <button
                key={round.id}
                onClick={() => onRoundChange(round.round_number)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border:
                    selectedRound === round.round_number
                      ? '2px solid var(--color-primary)'
                      : '2px solid var(--color-border)',
                  background:
                    selectedRound === round.round_number
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                  color:
                    selectedRound === round.round_number ? 'white' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  font: '0.95rem',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  if (selectedRound !== round.round_number) {
                    e.target.style.background = 'var(--color-surface-variant)'
                    e.target.style.borderColor = 'var(--color-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (selectedRound !== round.round_number) {
                    e.target.style.background = 'var(--color-surface)'
                    e.target.style.borderColor = 'var(--color-border)'
                  }
                }}
              >
                {getRoundLabel(round)}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'by-user' ? (
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={15} /> Seleccionar Usuario</label>
            <SelectDropdown
              items={users}
              selectedId={selectedUser}
              onSelect={onUserChange}
              disabled={!selectedRound}
              placeholder="Seleccionar usuario..."
              renderButton={user => (
                <span style={{ fontWeight: '600' }}>
                  {user.full_name} (@{user.username})
                </span>
              )}
              renderOption={user => (
                <span style={{ flex: 1, fontWeight: '600' }}>
                  {user.full_name} (@{user.username})
                </span>
              )}
            />
          </div>
        ) : (
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CircleDot size={15} /> Seleccionar Partido</label>
            <MatchSelector
              matches={matches}
              selectedMatchId={selectedMatchId}
              onMatchChange={onMatchChange}
              disabled={!selectedRound || matchesLoading || matches.length === 0}
              isLoading={matchesLoading}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default RoundUserSelectors
