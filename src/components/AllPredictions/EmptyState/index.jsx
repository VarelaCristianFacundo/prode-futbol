const EmptyState = ({ icon, title, description }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>{title}</h3>
      {description && (
        <p
          style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default EmptyState
