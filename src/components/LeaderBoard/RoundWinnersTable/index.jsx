import { memo } from 'react'
import { Calendar, Medal } from 'lucide-react'
import EmptyState from '../EmptyState'

const RoundWinnersTable = memo(function RoundWinnersTable({ winners }) {
  if (!winners || winners.length === 0) {
    return (
      <EmptyState
        title="No hay ganadores aún"
        subtitle="Los ganadores aparecerán cuando se carguen los resultados de cada fecha"
      />
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            {['Fecha', 'Ganador/a', 'Pts'].map((col, i) => (
              <th
                key={col}
                style={{
                  padding: '12px 8px',
                  textAlign: i === 0 || i === 1 ? 'left' : 'center',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {winners.map(item => (
            <WinnerRow key={item.round_number} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  )
})

const WinnerRow = memo(function WinnerRow({ item }) {
  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.2s',
      }}
    >
      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={14} /> Fecha {item.round_number}
        </span>
      </td>
      <td style={{ padding: '12px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {item.winners.map(w => (
            <span
              key={w.id}
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Medal size={14} color="#f9a825" /> {w.full_name || w.username}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
          }}
        >
          {item.total_points}
          <span style={{ fontSize: '0.75rem', marginLeft: '2px' }}>pts</span>
        </span>
      </td>
    </tr>
  )
})

export default RoundWinnersTable
