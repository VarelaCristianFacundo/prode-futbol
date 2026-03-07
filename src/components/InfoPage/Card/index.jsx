const Card = ({ backgroundColor, borderColor, children }) => {
  return (
    <div
      className="card"
      style={{
        marginBottom: '24px',
        backgroundColor,
        border: `2px solid ${borderColor}`,
        padding: '16px',
        borderRadius: '12px',
      }}
    >
      {children}
    </div>
  )
}

export default Card
