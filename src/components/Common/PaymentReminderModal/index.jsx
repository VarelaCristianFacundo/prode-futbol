import { useEffect } from 'react'
import { Banknote } from 'lucide-react'
import styles from './PaymentReminderModal.module.css'

/**
 * Modal de recordatorio de pago
 * Se muestra una vez al entrar a pronósticos si la fecha está abierta
 * El usuario puede marcar "Ya pagué" o "Recordarme después"
 */
const PaymentReminderModal = ({ isOpen, onClose, roundNumber }) => {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        handleRemindLater()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll del body cuando la modal está abierta
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleAlreadyPaid = () => {
    // Guardar en localStorage que ya pagó esta fecha
    localStorage.setItem(`payment_reminder_round_${roundNumber}`, 'paid')
    onClose()
  }

  const handleRemindLater = () => {
    // Guardar en sessionStorage para no mostrar en esta sesión
    sessionStorage.setItem(`payment_reminder_round_${roundNumber}`, 'later')
    onClose()
  }

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      handleRemindLater()
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className={styles.header}>
          <Banknote className={styles.icon} size={32} />
          <h2 id="modal-title" className={styles.title}>
            ¡No te olvides de abonar la fecha!
          </h2>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.message}>
            Para que tu participación quede confirmada, acordate de realizar el pago antes del
            cierre.
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleAlreadyPaid}
            type="button"
          >
            <span>Ya pagué ✓</span>
          </button>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={handleRemindLater}
            type="button"
          >
            <span>Recordarme después</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentReminderModal
