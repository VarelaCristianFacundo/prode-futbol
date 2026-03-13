import { Target, CheckCircle, BarChart2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePersonalStats } from '../../hooks/usePersonalStats'
import { MetricCard } from './MetricCard'
import { LineChart } from './LineChart'
import { BestWorstCard } from './BestWorstCard'
import { AccuracyBreakdown } from './AccuracyBreakdown'
import { AdditionalStats } from './AdditionalStats'
import styles from './PersonalStats.module.css'

export default function PersonalStats() {
  const { user } = useAuth()
  const { stats, loading, error } = usePersonalStats(user?.id)

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.centered}>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={styles.container}>
        <div className={styles.centered}>
          <p>{error || 'Error cargando estadísticas'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <h1>Mis Estadísticas</h1>
        <p className={styles.subtitle}>Análisis detallado de tu desempeño</p>
      </div>

      {/* Sección 1: Métricas principales */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resumen de Desempeño</h2>
        <div className={styles.metricsGrid}>
          <MetricCard icon={<Target size={24} />} label="Total de Puntos" value={stats.metrics.totalPoints} />
          <MetricCard
            icon={<CheckCircle size={24} />}
            label="Porcentaje de Aciertos"
            value={stats.metrics.hitPercentage}
            unit="%"
          />
          <MetricCard
            icon={<BarChart2 size={24} />}
            label="Promedio por Fecha"
            value={stats.metrics.avgPerRound.toFixed(1)}
          />
        </div>
      </section>

      {/* Sección 2: Gráfico de evolución */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Evolución de Puntos</h2>
        <LineChart data={stats.evolutionByRound} />
        <p className={styles.sectionDescription}>
          Pasa el mouse sobre los puntos para ver detalles de cada fecha
        </p>
      </section>

      {/* Sección 3: Mejor y Peor fecha */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Desempeño Extremo</h2>
        <div className={styles.bestWorstGrid}>
          <BestWorstCard
            type="best"
            roundNumber={stats.bestRound.roundNumber}
            points={stats.bestRound.points}
          />
          <BestWorstCard
            type="worst"
            roundNumber={stats.worstRound.roundNumber}
            points={stats.worstRound.points}
          />
        </div>
      </section>

      {/* Sección 4: Desglose de aciertos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Desglose de Aciertos</h2>
        <AccuracyBreakdown breakdown={stats.accuracyBreakdown} />
      </section>

      {/* Sección 5: Datos adicionales */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Datos Adicionales</h2>
        <AdditionalStats stats={stats.additionalStats} />
      </section>
    </div>
  )
}
