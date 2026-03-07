import styles from './AccuracyBreakdown.module.css'

export const AccuracyBreakdown = ({ breakdown }) => {
  const exactScores = Number(breakdown?.exactScores ?? 0)
  const winnerHits = Number(
    breakdown?.winnerHits ??
      Number(breakdown?.goalDiffCorrect ?? 0) + Number(breakdown?.winnerOnly ?? 0)
  )
  const bonusGoals = Number(breakdown?.bonusGoals ?? 0)
  const totalAnalyzed = Number(
    breakdown?.totalAnalyzed ??
      exactScores + winnerHits + bonusGoals + Number(breakdown?.errors ?? 0)
  )
  const errors = Math.max(0, totalAnalyzed - exactScores - winnerHits - bonusGoals)

  const items = [
    {
      label: 'Plenos',
      icon: '🎯',
      count: exactScores,
      color: 'var(--color-success)',
      description: 'Lo clavaste: resultado exacto (ej: 3-1 y salió 3-1)',
    },
    {
      label: 'Solo el Ganador',
      icon: '✅',
      count: winnerHits,
      color: 'var(--color-warning)',
      description: 'Acertaste quién ganó, pero no el marcador exacto',
    },
    {
      label: 'Bonus Goles',
      icon: '⚽',
      count: bonusGoals,
      color: 'var(--color-info)',
      description: 'Acertaste cuántos goles hubo en total (>2 goles)',
    },
    {
      label: 'Pifiaste',
      icon: '💥',
      count: errors,
      color: 'var(--color-error)',
      description: 'No sumaste puntos en este partido',
    },
  ]

  const total = exactScores + winnerHits + bonusGoals + errors

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {items.map(item => {
          const percentage = total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0
          return (
            <div key={item.label} className={styles.item}>
              <div className={styles.itemHeader}>
                <div className={styles.labelWrapper}>
                  <span className={styles.icon}>{item.icon}</span>
                  <div className={styles.labelBlock}>
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.description}>{item.description}</span>
                  </div>
                </div>
                <span className={styles.count}>{item.count}</span>
              </div>

              {/* Barra de progreso */}
              <div className={styles.barContainer}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                >
                  {percentage > 5 && <span className={styles.percentageInside}>{percentage}%</span>}
                </div>
                {percentage <= 5 && <span className={styles.percentageOutside}>{percentage}%</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.summary}>
        <p className={styles.totalLabel}>Total de pronósticos analizados</p>
        <p className={styles.totalValue}>{totalAnalyzed || total}</p>
      </div>
    </div>
  )
}
