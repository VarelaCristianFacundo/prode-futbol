import { useState } from 'react'
import styles from './LineChart.module.css'

export const LineChart = ({ data }) => {
  const [hoveredRound, setHoveredRound] = useState(null)

  if (!data || data.length === 0) return null

  // Calcular dimensiones y escala
  const padding = { top: 40, right: 40, bottom: 60, left: 60 }
  const width = 600
  const height = 300
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxPoints = Math.max(...data.map(d => d.points))
  const minPoints = Math.min(...data.map(d => d.points))
  const range = maxPoints - minPoints || 10
  const padding_value = range * 0.1

  const maxY = maxPoints + padding_value
  const minY = Math.max(0, minPoints - padding_value)

  // Funciones de conversión
  const getX = index => padding.left + (index / (data.length - 1)) * chartWidth
  const getY = points => height - padding.bottom - ((points - minY) / (maxY - minY)) * chartHeight

  // Generar path de línea
  const pathData = data
    .map((d, i) => {
      const x = getX(i)
      const y = getY(d.points)
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  // Generar ticks de ejes
  const yTicks = []
  const tickCount = 5
  for (let i = 0; i <= tickCount; i++) {
    const value = minY + ((maxY - minY) / tickCount) * i
    yTicks.push({
      value: Math.round(value),
      y: getY(value),
    })
  }

  return (
    <div className={styles.container}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.chart}
      >
        {/* Grid de fondo */}
        {yTicks.map((tick, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              className={styles.gridLine}
            />
            <text
              x={padding.left - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.axisLabel}
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Línea del gráfico */}
        <path d={pathData} className={styles.line} />

        {/* Puntos interactivos */}
        {data.map((d, i) => {
          const x = getX(i)
          const y = getY(d.points)
          const isHovered = hoveredRound === d.roundNumber

          return (
            <g
              key={`point-${i}`}
              onMouseEnter={() => setHoveredRound(d.roundNumber)}
              onMouseLeave={() => setHoveredRound(null)}
              className={styles.pointGroup}
            >
              {/* Círculo grande (hit area) */}
              <circle cx={x} cy={y} r="8" className={styles.pointHitArea} />

              {/* Círculo visible */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                className={styles.point}
                style={{
                  transition: 'r 0.2s',
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <>
                  {/* Línea vertical */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    className={styles.tooltipLine}
                  />

                  {/* Tooltip box */}
                  <rect
                    x={x - 45}
                    y={y - 45}
                    width="90"
                    height="40"
                    rx="4"
                    className={styles.tooltipBox}
                  />
                  <text x={x} y={y - 30} textAnchor="middle" className={styles.tooltipText}>
                    Fecha {d.roundNumber}
                  </text>
                  <text x={x} y={y - 15} textAnchor="middle" className={styles.tooltipValue}>
                    {d.points} pts
                  </text>
                </>
              )}

              {/* Etiqueta de round en el eje X */}
              <text
                x={x}
                y={height - padding.bottom + 25}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                Fecha {d.roundNumber}
              </text>
            </g>
          )
        })}

        {/* Ejes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className={styles.axis}
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className={styles.axis}
        />

        {/* Etiquetas de ejes */}
        <text x={padding.left - 35} y={padding.top - 10} className={styles.axisTitle}>
          Puntos
        </text>
        <text x={width / 2} y={height - 15} textAnchor="middle" className={styles.axisTitle}>
          Número de Fecha
        </text>
      </svg>
    </div>
  )
}
