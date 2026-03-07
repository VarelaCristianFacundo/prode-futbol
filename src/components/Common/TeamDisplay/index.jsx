export default function TeamDisplay({ team, size = 'md', showNameBelow = false }) {
  const sizes = {
    sm: { width: '24px', height: '24px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '48px', height: '48px' },
    xl: { width: '64px', height: '64px' },
  }

  const textSizes = {
    sm: '0.75rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
  }

  if (!team) return <span style={{ color: 'var(--color-text-secondary)' }}>-</span>

  if (showNameBelow) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {team.logo_url && (
          <img
            src={team.logo_url}
            alt={team.name}
            style={{
              ...sizes[size],
              objectFit: 'contain',
            }}
            onError={e => {
              // console.error('Error loading image:', team.logo_url, 'for team:', team.name)
              e.target.style.display = 'none'
            }}
          />
        )}
        <span
          style={{
            fontSize: textSizes[size],
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.2',
            maxWidth: '80px',
          }}
        >
          {team.name}
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {team.logo_url && (
        <img
          src={team.logo_url}
          alt={team.name}
          style={{
            ...sizes[size],
            objectFit: 'contain',
          }}
          onError={e => {
            // Fallback si la imagen no carga
            // console.error('Error loading image:', team.logo_url, 'for team:', team.name)
            e.target.style.display = 'none'
          }}
        />
      )}
      <span
        style={{
          fontSize: textSizes[size],
          fontWeight: '600',
        }}
      >
        {team.name}
      </span>
    </div>
  )
}
