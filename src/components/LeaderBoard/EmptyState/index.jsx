import { memo } from 'react'

const EmptyState = memo(function EmptyState({
  title = 'No hay datos disponibles',
  subtitle = 'Los puntos se calculan al cargar resultados',
  icon = '📊',
}) {
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{icon}</div>
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
          fontWeight: '600',
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
    </div>
  )
})

export default EmptyState
