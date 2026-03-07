import { memo } from 'react'

const ErrorMessage = memo(function ErrorMessage({ error, onRetry }) {
  return (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        backgroundColor: 'var(--color-error-light)',
        border: '1px solid var(--color-error)',
        borderRadius: '12px',
        color: 'var(--color-error)',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
      <p style={{ marginBottom: '16px', fontWeight: '600' }}>{error || 'Ha ocurrido un error'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-error)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  )
})

export default ErrorMessage
