import Card from '../Card'
import SectionHeader from '../SectionHeader'
import styles from './MatchStatusSection.module.css'

export default function MatchStatusSection() {
  return (
    <Card backgroundColor="rgba(249, 168, 37, 0.05)" borderColor="var(--color-warning)">
      <SectionHeader
        icon="📌"
        title="Partidos Aplazados o Suspendidos"
        color="var(--color-warning)"
      />

      <p className={styles.description}>
        Por motivos externos (clima, logística, incidentes, etc.), algunos partidos pueden no
        jugarse en la fecha programada.
      </p>

      <div className={styles.importantRule}>
        <div className={styles.ruleHeader}>
          <span className={styles.ruleIcon}>⚠️</span>
          <h4 className={styles.ruleTitle}>Regla Importante</h4>
        </div>
        <p className={styles.ruleText}>
          Si un partido aplazado <strong>no se juega antes del inicio de la siguiente fecha</strong>
          , será eliminado del torneo y no sumará puntos para ningún participante. Esto garantiza la
          fluidez y continuidad de la competencia.
        </p>
      </div>
    </Card>
  )
}
