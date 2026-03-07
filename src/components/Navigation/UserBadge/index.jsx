export default function UserBadge({ username }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '6px',
        padding: '3px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span style={{ fontSize: '0.7rem' }}>Equipo: </span>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'var(--color-primary)',
        }}
      >
        {username}
      </span>
    </div>
  )
}
