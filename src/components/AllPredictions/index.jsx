import { useAllPredictions } from '../../hooks/useAllPredictions'
import { Lock, Users, CircleDot } from 'lucide-react'
import ViewModeToggle from './ViewModeToggle'
import RoundUserSelectors from './RoundUserSelectors'
import MatchPredictionsByUser from './MatchPredictionsByUser'
import MatchPredictionsByMatch from './MatchPredictionsByMatch'
import EmptyState from './EmptyState'

export default function AllPredictions({ initialRound = null, initialUser = '' }) {
  const {
    roundsLoading,
    availableRounds,
    matches,
    matchesLoading,
    users,
    selectedUser,
    setSelectedUser,
    selectedRound,
    setSelectedRound,
    selectedMatchId,
    setSelectedMatchId,
    selectedMatch,
    viewMode,
    setViewMode,
    isRoundOpen,
    roundPredictions,
    matchPredictions,
    loading,
    matchLoading,
    hasMatchStarted,
  } = useAllPredictions({ initialRound, initialUser })

  if (roundsLoading)
    return (
      <div className="container" style={{ textAlign: 'center', padding: '48px 16px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>
      </div>
    )

  const noSelection =
    !selectedRound ||
    (viewMode === 'by-user' && !selectedUser) ||
    (viewMode === 'by-match' && !selectedMatchId)

  const showByUser =
    viewMode === 'by-user' &&
    selectedRound &&
    selectedUser &&
    !matchesLoading &&
    matches.length > 0 &&
    !isRoundOpen

  const showByMatch =
    viewMode === 'by-match' &&
    selectedRound &&
    selectedMatchId &&
    !matchesLoading &&
    matches.length > 0 &&
    !isRoundOpen

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Users size={18} /> Espia como vienen los rivales
        </h2>
      </div>

      {availableRounds.length === 0 && (
        <EmptyState
          icon={<Lock size={48} />}
          title="Todavía no hay fechas para ver"
          description="Los pronósticos de otros usuarios se podrán ver cuando las fechas estén bloqueadas o finalizadas. Por ahora, todas las fechas están abiertas o pendientes."
        />
      )}

      {availableRounds.length > 0 && (
        <div className="card" style={{ marginBottom: '8px' }}>
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          <RoundUserSelectors
            availableRounds={availableRounds}
            selectedRound={selectedRound}
            onRoundChange={setSelectedRound}
            viewMode={viewMode}
            users={users}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
            matches={matches}
            matchesLoading={matchesLoading}
            selectedMatchId={selectedMatchId}
            onMatchChange={setSelectedMatchId}
          />
        </div>
      )}

      {showByUser && (
        <MatchPredictionsByUser
          matches={matches}
          roundPredictions={roundPredictions}
          hasMatchStarted={hasMatchStarted}
          loading={loading}
        />
      )}

      {showByMatch && (
        <MatchPredictionsByMatch
          selectedMatch={selectedMatch}
          users={users}
          matchPredictions={matchPredictions}
          matchLoading={matchLoading}
        />
      )}

      {availableRounds.length > 0 &&
        selectedRound &&
        !matchesLoading &&
        matches.length === 0 &&
        !isRoundOpen && (
          <EmptyState
            icon={<CircleDot size={48} />}
            title="No hay partidos cargados"
            description="Esta fecha todavía no tiene partidos configurados"
          />
        )}

      {availableRounds.length > 0 &&
        selectedRound &&
        ((viewMode === 'by-user' && selectedUser) ||
          (viewMode === 'by-match' && selectedMatchId)) &&
        isRoundOpen && (
          <EmptyState
            icon={<Lock size={48} />}
            title="Fecha abierta"
            description="Los pronósticos se pueden ver una vez que la fecha esté cerrada"
          />
        )}

      {availableRounds.length > 0 && noSelection && (
        <EmptyState
          icon={<Users size={48} />}
          title={
            viewMode === 'by-match'
              ? 'Seleccioná una fecha y un partido'
              : 'Seleccioná una fecha y un usuario'
          }
          description={
            viewMode === 'by-match'
              ? 'Elegí una fecha y un partido para ver todos los pronósticos'
              : 'Elegí una fecha y un usuario para ver sus pronósticos'
          }
        />
      )}
    </div>
  )
}
