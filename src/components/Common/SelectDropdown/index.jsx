import { useState, useRef, useEffect } from 'react'

const SELECT_STYLE = {
  width: '100%',
  padding: '14px 16px',
  fontSize: '1rem',
  borderRadius: '10px',
  border: '2px solid var(--color-primary)',
  cursor: 'pointer',
}

const SelectDropdown = ({
  items = [],
  selectedId,
  onSelect,
  disabled = false,
  isLoading = false,
  renderButton,
  renderOption,
  placeholder = 'Seleccionar...',
  valueKey = 'id',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const selectedItem = items.find(item => item[valueKey] === selectedId)

  // Cerrar dropdown cuando se clickea afuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = id => {
    onSelect(id)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          ...SELECT_STYLE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: disabled ? 'var(--color-surface-variant)' : 'var(--color-surface)',
          color: disabled ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {selectedItem ? (
            renderButton(selectedItem)
          ) : (
            <span style={{ color: 'var(--color-text-secondary)' }}>{placeholder}</span>
          )}
        </span>
        <span style={{ fontSize: '1.2rem', marginLeft: '8px' }}>▼</span>
      </button>

      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            borderRadius: '10px',
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {items.map(item => (
            <button
              key={item[valueKey]}
              onClick={() => handleSelect(item[valueKey])}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: 'none',
                background: selectedId === item[valueKey] ? 'var(--color-primary)' : 'transparent',
                color: selectedId === item[valueKey] ? 'white' : 'var(--color-text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 200ms',
                // borderBottom: '1px solid var(--color-border)',
                fontSize: '0.95rem',
              }}
              onMouseEnter={e => {
                if (selectedId !== item[valueKey]) {
                  e.currentTarget.style.background = 'var(--color-surface-variant)'
                }
              }}
              onMouseLeave={e => {
                if (selectedId !== item[valueKey]) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {renderOption(item)}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{ margin: '0 auto 8px', width: '16px', height: '16px' }}
          />
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Cargando...
          </p>
        </div>
      )}
    </div>
  )
}

export default SelectDropdown
