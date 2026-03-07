const TiebreakItem = ({ order, title, description }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderRadius: '8px',
      }}
    >
      <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>{order}</span>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
        <strong>{title}</strong>
        {description && (
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export default TiebreakItem
