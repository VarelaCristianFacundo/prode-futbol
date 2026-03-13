import { Lock, CircleDot, CheckCircle } from 'lucide-react'

const STATUS = {
  notStarted: { bg: '#ef4444', label: 'No empezó', Icon: Lock },
  finished: { bg: 'var(--color-success)', label: 'Finalizado', Icon: CheckCircle },
  inPlay: { bg: '#f59e0b', label: 'En juego', Icon: CircleDot },
}

const MatchStatusBadge = ({ match }) => {
  const started = new Date() >= new Date(match.match_date)
  const key = !started ? 'notStarted' : match.is_finished ? 'finished' : 'inPlay'
  const { bg, label, Icon } = STATUS[key]

  return (
    <span
      style={{
        backgroundColor: bg,
        color: 'white',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  )
}

export default MatchStatusBadge
