const PointsSystemItem = ({ item }) => {
  const isComplexRule = !!item.rules

  return (
    <div
      style={{
        padding: isComplexRule ? '4px' : '12px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
      }}
    >
      {isComplexRule ? (
        // Regla compleja (PLENO con sub-reglas)
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '2rem',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {item.icon}
            </span>
            <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
              {item.title}
            </strong>
          </div>
          <div
            style={{
              marginLeft: '52px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {item.rules.map(rule => (
              <div key={rule.condition}>
                • {rule.condition}{' '}
                <span
                  style={{
                    color: 'var(--color-success)',
                    fontWeight: '700',
                  }}
                >
                  {rule.points}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Regla simple
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              minWidth: '40px',
              textAlign: 'center',
            }}
          >
            {item.icon}
          </span>
          <div>
            <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
              {item.title}
            </strong>
            {item.points && (
              <span
                style={{
                  marginLeft: '8px',
                  color: 'var(--color-success)',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                }}
              >
                {item.points}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PointsSystemItem
