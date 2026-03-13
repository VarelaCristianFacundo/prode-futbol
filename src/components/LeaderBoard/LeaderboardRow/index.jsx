import { memo } from 'react'
import { Eye, Trophy } from 'lucide-react'
import { POSITION_CONFIG } from '../leaderboard.config'
import InfoButton from '../../Common/InfoButton'

// Lista de jugadores suspendidos
const SUSPENDED_PLAYERS = [
  'Rodriguez Matias',
  'Lázaro Beldrio',
  'Geronimo Andres Garcia',
  'Ezequiel Cordoba',
]

const LeaderboardRow = memo(function LeaderboardRow({
  player,
  position,
  showRoundsColumn = false,
  showViewColumn = false,
  onViewPredictions,
  selectedRound,
}) {
  const positionConfig = POSITION_CONFIG[position] || {}
  const { bgColor } = positionConfig

  return (
    <tr
      style={{
        backgroundColor: bgColor || 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.2s',
      }}
    >
      <PositionCell position={position} />
      <PlayerCell player={player} />
      <PointsCell points={player.total_points} />
      {showRoundsColumn && <RoundsCell rounds={player.rounds_played || 0} />}
      {showViewColumn && (
        <ViewCell
          player={player}
          selectedRound={selectedRound}
          onViewPredictions={onViewPredictions}
        />
      )}
    </tr>
  )
})

const PositionCell = memo(function PositionCell({ position }) {
  const trophyColor = position === 1 ? '#f9a825' : position === 2 ? '#9e9e9e' : position === 3 ? '#cd7f32' : null
  return (
    <td
      style={{
        padding: '12px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {trophyColor && <Trophy size={16} color={trophyColor} />}
        <span
          style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
          }}
        >
          {position}
        </span>
      </div>
    </td>
  )
})

const PlayerCell = memo(function PlayerCell({ player }) {
  const isSuspended = SUSPENDED_PLAYERS.includes(player.full_name)

  return (
    <td style={{ padding: '12px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: isSuspended ? '#ef4444' : 'var(--color-text-primary)',
              marginBottom: '2px',
              textTransform: 'capitalize',
            }}
          >
            {player.username}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: isSuspended ? '#ef4444' : 'white',
              textTransform: 'capitalize',
            }}
          >
            {player.full_name}
          </div>
        </div>
        {isSuspended && (
          <InfoButton
            message="Jugador suspendido"
            type="error"
            ariaLabel="Jugador suspendido"
            position="top"
          />
        )}
      </div>
    </td>
  )
})

const PointsCell = memo(function PointsCell({ points }) {
  return (
    <td
      style={{
        padding: '12px 8px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          color: 'var(--color-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {points}
        <span style={{ fontSize: '0.85rem' }}>pts</span>
      </span>
    </td>
  )
})

const RoundsCell = memo(function RoundsCell({ rounds }) {
  return (
    <td
      style={{
        padding: '12px 8px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
          fontWeight: '600',
        }}
      >
        {rounds}
      </span>
    </td>
  )
})

const ViewCell = memo(function ViewCell({ player, selectedRound, onViewPredictions }) {
  const handleClick = () => {
    if (!onViewPredictions || !selectedRound) return
    onViewPredictions({ userId: player.id, roundNumber: selectedRound })
  }

  return (
    <td
      style={{
        textAlign: 'center',
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="btn-success"
        style={{
          backgroundColor: 'transparent',
          padding: '4px 4px',
          fontSize: '0.8rem',
          borderRadius: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-label={`Ver pronosticos de ${player.username} en fecha ${selectedRound}`}
      >
        <Eye size={16} aria-hidden="true" />
      </button>
    </td>
  )
})

export default LeaderboardRow
