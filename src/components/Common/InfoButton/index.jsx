import { useState } from 'react'

const INFO_BUTTON_TYPES = {
  info: {
    color: 'var(--color-primary)',
    icon: 'i',
  },
  error: {
    color: '#ef4444',
    icon: 'X',
  },
  warning: {
    color: '#f59e0b',
    icon: '⚠️',
  },
  success: {
    color: '#10b981',
    icon: '✓',
  },
}

const TOOLTIP_POSITIONS = {
  right: {
    top: '-5px',
    left: '43px',
  },
  left: {
    top: '-5px',
    right: '43px',
  },
  top: {
    bottom: '43px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: '43px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}

const InfoButton = ({ message, type = 'info', position = 'right', ariaLabel = 'Información' }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const config = INFO_BUTTON_TYPES[type] || INFO_BUTTON_TYPES.info
  const tooltipPosition = TOOLTIP_POSITIONS[position] || TOOLTIP_POSITIONS.right

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setIsInfoOpen(!isInfoOpen)
        }}
        onMouseEnter={() => setIsInfoOpen(true)}
        onMouseLeave={() => setIsInfoOpen(false)}
        style={{
          padding: '6px 12px',
          borderRadius: '12px',
          width: '39px',
          minHeight: '32.5px',
          border: `2px solid ${config.color}`,
          fontSize: '0.8rem',
          fontWeight: '700',
          lineHeight: '1',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          backgroundColor: 'var(--color-surface)',
          color: config.color,
        }}
      >
        {config.icon}
      </button>
      {isInfoOpen && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...tooltipPosition,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '0.8rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}

export default InfoButton
