import { memo } from 'react'

const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', label = 'Cargando...' }) {
  const sizeConfig = {
    sm: { width: 24, height: 24, border: '3px' },
    md: { width: 56, height: 56, border: '4px' },
  }

  const { width, height, border } = sizeConfig[size] || sizeConfig.md

  return (
    <div
      style={{
        textAlign: 'center',
        padding: size === 'md' ? '48px 16px' : '16px',
      }}
    >
      <div
        style={{
          width,
          height,
          margin: '0 auto 20px',
          border: `${border} solid rgba(30, 127, 67, 0.1)`,
          borderTop: `${border} solid var(--color-primary)`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {label && (
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: size === 'md' ? '1rem' : '0.85rem',
            fontWeight: '500',
          }}
        >
          {label}
        </p>
      )}
    </div>
  )
})

export default LoadingSpinner
