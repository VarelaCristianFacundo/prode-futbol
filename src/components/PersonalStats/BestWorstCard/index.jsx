import styles from './BestWorstCard.module.css'

export const BestWorstCard = ({ type = 'best', roundNumber, points }) => {
  const isBest = type === 'best'
  const icon = isBest ? '🏆' : '😢'
  const label = isBest ? 'Mejor Fecha' : 'Peor Fecha'
  return (
    <div className={`${styles.card} ${styles[type]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.roundNumber}>Fecha {roundNumber}</p>
        <p className={styles.points}>{points} puntos</p>
      </div>
    </div>
  )
}
