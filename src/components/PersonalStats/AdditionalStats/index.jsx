import styles from './AdditionalStats.module.css'

export const AdditionalStats = ({ stats }) => {
  const items = [
    {
      label: 'Total de Pronósticos Cargados',
      value: stats.totalPredictions,
      icon: '📝',
    },
    {
      label: 'Promedio de Puntos por Partido',
      value: stats.avgPointsPerMatch.toFixed(2),
      icon: '⭐',
    },
    {
      label: 'Partidos Finalizados',
      value: stats.finishedMatches,
      icon: '✅',
    },
  ]

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.label} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <div className={styles.content}>
              <p className={styles.label}>{item.label}</p>
              <p className={styles.value}>{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
