const STATUS = {
  notStarted: { bg: '#ef4444', label: '🔒 No empezó' },
  finished: { bg: 'var(--color-success)', label: '✓ Finalizado' },
  inPlay: { bg: '#f59e0b', label: '⚽ En juego' },
}

const MatchStatusBadge = ({ match }) => {
  const started = new Date() >= new Date(match.match_date)
  const key = !started ? 'notStarted' : match.is_finished ? 'finished' : 'inPlay'
  const { bg, label } = STATUS[key]

  return (
    <span
      style={{
        backgroundColor: bg,
        color: 'white',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '600',
      }}
    >
      {label}
    </span>
  )
}

export default MatchStatusBadge
