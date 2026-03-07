const SpecialRulesBox = ({ icon, title, description, note }) => {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: '8px',
        border: '2px solid rgba(239, 68, 68, 0.2)',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <div>
          <strong
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-error)',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            {title}
          </strong>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
            {description}
          </div>
          {note && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginTop: '8px',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>➡️</span>
              <span>{note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpecialRulesBox
