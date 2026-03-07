import { forwardRef, memo, useCallback } from 'react'

const TabButton = forwardRef(function TabButton({ tab, isActive, onClick }, ref) {
  const handleClick = useCallback(() => {
    onClick(tab.id)
  }, [tab.id, onClick])

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(tab.id)
      }
    },
    [tab.id, onClick]
  )

  return (
    <button
      ref={ref}
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="tab-button"
      style={{
        flex: '1',
        padding: '12px 8px',
        fontWeight: '600',
        fontSize: '0.9rem',
        backgroundColor: isActive ? 'var(--color-surface-highlight)' : 'transparent',
        border: 'none',
        borderBottom: isActive ? '4px solid var(--color-primary)' : '4px solid transparent',
        borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
        borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
        borderTop: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        position: 'relative',
        outline: 'none',
        outlineOffset: '0',
      }}
      aria-label={`${tab.label}, ${isActive ? 'seleccionado' : 'no seleccionado'}`}
    >
      <span
        style={{
          fontSize: '1.15rem',
          display: 'block',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden="true"
      >
        {tab.icon}
      </span>
      <span
        className="tab-label-desktop"
        style={{
          fontSize: '0.8rem',
          fontWeight: isActive ? '700' : '600',
        }}
      >
        {tab.label}
      </span>
      <span
        className="tab-label-mobile"
        style={{
          display: 'none',
          fontSize: '0.7rem',
          fontWeight: isActive ? '700' : '600',
        }}
      >
        {tab.mobileLabel || tab.label}
      </span>
    </button>
  )
})

export default memo(TabButton)
