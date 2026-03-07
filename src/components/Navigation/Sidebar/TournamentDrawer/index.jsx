import { useEffect, useCallback } from 'react'
import styles from './TournamentDrawer.module.css'

export default function TournamentDrawer({
  isOpen,
  onClose,
  title = '⚽ Menú',
  showBackButton = false,
  onBack,
  children,
}) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll del body cuando el drawer está abierto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = useCallback(
    e => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleBackdropClick} role="presentation" />

      {/* Drawer */}
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        {/* Header */}
        <div className={styles.drawerHeader}>
          {showBackButton && (
            <button
              className={styles.backButton}
              onClick={onBack}
              aria-label="Volver"
              type="button"
            >
              ‹
            </button>
          )}
          <h2 id="drawer-title" className={styles.drawerTitle}>
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar panel"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.drawerContent}>{children}</div>
      </div>
    </>
  )
}
