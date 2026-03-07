import Card from '../Card'
import SectionHeader from '../SectionHeader'
import TiebreakItem from './TiebreakItem'
import SpecialRulesBox from './SpecialRulesBox'
import { tiebreakCriteria, specialRule } from '../info.config'

export default function TiebreakSection() {
  return (
    <Card backgroundColor="rgba(59, 130, 246, 0.05)" borderColor="var(--color-info)">
      <SectionHeader
        icon="⚽"
        title="REGLAMENTO DE DESEMPATE Y PREMIOS"
        color="var(--color-info)"
        centered
      />

      {/* Criterios de desempate */}
      <div style={{ marginBottom: '20px' }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: '700',
            color: 'var(--color-info)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📌</span>
          <span>Criterio de desempate</span>
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingLeft: '8px',
          }}
        >
          {tiebreakCriteria.map(criterion => (
            <TiebreakItem
              key={criterion.title}
              order={criterion.order}
              title={criterion.title}
              description={criterion.description}
            />
          ))}
        </div>
      </div>

      {/* Regla especial */}
      <SpecialRulesBox
        icon={specialRule.icon}
        title={specialRule.title}
        description={specialRule.description}
        note={specialRule.note}
      />
    </Card>
  )
}
