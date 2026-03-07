const SectionHeader = ({ icon, title, color, centered = false }) => {
  return (
    <h3
      style={{
        fontWeight: '700',
        color,
        marginBottom: '16px',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        gap: '8px',
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{title}</span>
      {centered && icon && <span>{icon}</span>}
    </h3>
  )
}

export default SectionHeader
