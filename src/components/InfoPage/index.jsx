import PointsSystemSection from './PointsSystemSection'
import TiebreakSection from './TiebreakSection'
import MatchStatusSection from './MatchStatusSection'
import PageHeader from './PageHeader'
import { Info } from 'lucide-react'
import styles from './InfoPage.module.css'

export default function InfoPage({ activeSection = 'points' }) {
  const renderSection = () => {
    switch (activeSection) {
      case 'points':
        return <PointsSystemSection />
      case 'tiebreaks':
        return <TiebreakSection />
      case 'match-status':
        return <MatchStatusSection />
      default:
        return <PointsSystemSection />
    }
  }

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <PageHeader icon={<Info size={22} />} title="Información del Torneo" />

      {/* NavTabs se muestra arriba en Navigation */}

      {/* Contenido de la sección activa */}
      <div className={styles.sectionContent}>{renderSection()}</div>
    </div>
  )
}
