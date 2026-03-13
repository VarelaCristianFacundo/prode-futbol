import { useState, useCallback, useMemo } from 'react'
import { CircleDot, Calendar, Loader2, Save } from 'lucide-react'
import { useRounds } from '../../hooks/useRounds'
import { useMatches } from '../../hooks/useMatches'
import MatchResult from './MatchResult'
import Toast from '../Common/Toast'

export default function MatchManager() {
  const { rounds } = useRounds()
  const [selectedRound, setSelectedRound] = useState(null)
  const { matches, loading: matchesLoading, updateMatch } = useMatches(selectedRound)
  const [resultValues, setResultValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Filtrar solo fechas cerradas
  const closedRounds = useMemo(() => rounds.filter(r => r.status === 'locked'), [rounds])

  const handleValueChange = useCallback((matchId, field, value) => {
    setResultValues(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }))
  }, [])

  const handleSaveAll = useCallback(async () => {
    setSaving(true)

    const validMatches = matches.filter(match => {
      const values = resultValues[match.id]
      return (
        values?.home !== undefined &&
        values?.home !== '' &&
        values?.away !== undefined &&
        values?.away !== ''
      )
    })

    if (validMatches.length === 0) {
      setToast({
        message: 'No hay resultados para guardar',
        type: 'warning',
      })
      setSaving(false)
      return
    }

    const results = await Promise.all(
      validMatches.map(async match => {
        const values = resultValues[match.id]
        const home = parseInt(values.home, 10)
        const away = parseInt(values.away, 10)

        return updateMatch(match.id, {
          home_score: home,
          away_score: away,
          is_finished: true,
        })
      })
    )

    const successCount = results.filter(result => !result.error).length
    const errorCount = results.filter(result => result.error).length

    setSaving(false)

    if (successCount > 0 && errorCount === 0) {
      setToast({
        message: `${successCount} resultado${successCount > 1 ? 's' : ''} guardado${successCount > 1 ? 's' : ''} correctamente`,
        type: 'success',
      })
      setResultValues({}) // Limpiar valores después de guardar
    } else if (successCount > 0 && errorCount > 0) {
      setToast({
        message: `${successCount} guardado${successCount > 1 ? 's' : ''}, ${errorCount} fallaron`,
        type: 'warning',
      })
    } else if (errorCount > 0) {
      setToast({
        message: 'Error al guardar resultados. Intentá de nuevo.',
        type: 'error',
      })
    }
  }, [matches, resultValues, updateMatch])

  // Verificar si hay al menos un resultado para guardar
  const hasValidResults = useMemo(
    () =>
      Object.values(resultValues).some(
        v => v?.home !== undefined && v?.home !== '' && v?.away !== undefined && v?.away !== ''
      ),
    [resultValues]
  )

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '8px',
          }}
        >
          ⚙️ Cargar Resultados
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Seleccioná una fecha cerrada y cargá los resultados de los partidos
        </p>
      </div>

      {/* Selector de fecha */}
      <div className="card" style={{ marginBottom: '16px', padding: '0px' }}>
        <label
          className="form-label"
          style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}
        >
          📅 Seleccioná una Fecha Cerrada
        </label>
        <select
          value={selectedRound || ''}
          onChange={e => {
            setSelectedRound(Number(e.target.value))
            setResultValues({}) // Limpiar valores al cambiar de fecha
          }}
          className="form-input"
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '2px solid var(--color-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="">Seleccionar fecha...</option>
          {closedRounds.map(round => (
            <option key={round.id} value={round.round_number}>
              Fecha {round.round_number}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de partidos */}
      {selectedRound ? (
        matchesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Cargando partidos...</p>
          </div>
        ) : !matches || matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-text-secondary)' }}><CircleDot size={48} /></div>
            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              No hay partidos en esta fecha
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Todavía no se cargaron partidos para esta fecha.
            </p>
          </div>
        ) : (
          <>
            {/* Lista de partidos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {matches.map(match => (
                <MatchResult
                  key={`${match.round_number}-${match.match_number}-${match.id}`}
                  match={match}
                  resultValues={resultValues}
                  onValueChange={handleValueChange}
                />
              ))}
            </div>

            {/* Botón para guardar todos */}
            <div style={{ marginTop: '24px', position: 'sticky', bottom: '20px', zIndex: 10 }}>
              <button
                onClick={handleSaveAll}
                disabled={saving || !hasValidResults}
                className="btn-success"
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: saving || !hasValidResults ? 0.6 : 1,
                  cursor: saving || !hasValidResults ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>{saving ? <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={24} />}</span>
                <span>{saving ? 'Guardando...' : 'Guardar Todos los Resultados'}</span>
              </button>
            </div>
          </>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-text-secondary)' }}><Calendar size={48} /></div>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Seleccioná una fecha
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Elegí una fecha cerrada para cargar los resultados
          </p>
        </div>
      )}

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
