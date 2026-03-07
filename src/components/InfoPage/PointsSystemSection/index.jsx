import Card from '../Card'
import SectionHeader from '../SectionHeader'
import PointsSystemItem from './PointSystemItem'
import { pointsSystemData } from '../info.config'

export default function PointsSystemSection() {
  return (
    <Card backgroundColor="rgba(30, 127, 67, 0.05)" borderColor="var(--color-primary)">
      <SectionHeader icon="📊" title="Sistema de Puntos" color="var(--color-primary)" />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {pointsSystemData.map(item => (
          <PointsSystemItem key={item.id} item={item} />
        ))}
      </div>
    </Card>
  )
}
