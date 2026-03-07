import { memo, useMemo } from 'react'
import LeaderboardRow from '../LeaderboardRow'
import EmptyState from '../EmptyState'
import { TABLE_COLUMNS } from '../leaderboard.config'

const LeaderboardTable = memo(function LeaderboardTable({
  leaderboard,
  selectedRound,
  onViewPredictions,
}) {
  const columns = useMemo(() => TABLE_COLUMNS[selectedRound ? 'round' : 'general'], [selectedRound])

  if (leaderboard.length === 0) {
    return <EmptyState />
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <TableHeader columns={columns} />
        <tbody>
          {leaderboard.map((player, index) => (
            <LeaderboardRow
              key={player.id}
              player={player}
              position={index + 1}
              showRoundsColumn={!selectedRound}
              showViewColumn={Boolean(selectedRound)}
              onViewPredictions={onViewPredictions}
              selectedRound={selectedRound}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
})

const TableHeader = memo(function TableHeader({ columns }) {
  return (
    <thead>
      <tr
        style={{
          backgroundColor: 'var(--color-surface-variant)',
          borderBottom: '2px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        {columns.map((column, index) => (
          <th
            key={column}
            style={{
              padding: '12px 8px',
              textAlign:
                index === 0
                  ? 'left'
                  : column === 'Pts' || column === 'Fch' || column === 'Ver'
                    ? 'center'
                    : 'left',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  )
})

export default LeaderboardTable
