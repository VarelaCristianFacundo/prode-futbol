import { memo } from 'react'
import { Trophy, Calendar, Medal } from 'lucide-react'
import SelectDropdown from '../../Common/SelectDropdown'

const LeaderboardHeader = memo(function LeaderboardHeader({
  selectedRound,
  setSelectedRound,
  rounds,
  roundsLoading,
  view,
  setView,
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2
        style={{
          fontWeight: '700',
          color: 'var(--color-primary)',
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '1.5rem',
        }}
      >
        <Trophy size={22} />
        <span>Tabla de Posiciones</span>
      </h2>

      {/* Toggle between general and winners views */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          background: 'var(--color-surface-variant)',
          borderRadius: '10px',
          padding: '4px',
        }}
      >
        <button
          onClick={() => setView('general')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            background: view === 'general' ? 'var(--color-primary)' : 'transparent',
            color: view === 'general' ? 'white' : 'var(--color-text-secondary)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Trophy size={15} /> General
        </button>
        <button
          onClick={() => setView('winners')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            background: view === 'winners' ? 'var(--color-primary)' : 'transparent',
            color: view === 'winners' ? 'white' : 'var(--color-text-secondary)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Medal size={15} /> Ganadores por Fecha
        </button>
      </div>

      {/* Round filter — only shown in general view */}
      {view === 'general' && rounds && rounds.length > 0 && (
        <SelectDropdown
          items={[
            { id: null, round_number: null, name: 'General' },
            ...rounds
              .filter(r => ['open', 'locked', 'finished'].includes(r.status))
              .map(r => ({
                ...r,
                id: r.round_number,
              })),
          ]}
          selectedId={selectedRound === null ? null : selectedRound}
          onSelect={value => setSelectedRound(value)}
          valueKey="id"
          isLoading={roundsLoading}
          placeholder="Seleccionar fecha..."
          renderButton={round => (
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {round.round_number === null ? <><Trophy size={14} /> General</> : <><Calendar size={14} /> Fecha {round.round_number}</>}
            </span>
          )}
          renderOption={round => (
            <span style={{ flex: 1, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {round.round_number === null ? <><Trophy size={14} /> General</> : <><Calendar size={14} /> Fecha {round.round_number}</>}
            </span>
          )}
        />
      )}
    </div>
  )
})

export default LeaderboardHeader
