export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
      <h2
        style={{
          fontWeight: '700',
          color: 'var(--color-primary)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span>{title}</span>
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{subtitle}</p>
    </div>
  )
}
