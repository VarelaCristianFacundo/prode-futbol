import { Menu } from 'lucide-react'
import styles from './HamburgerButton.module.css'

export default function HamburgerButton({ onClick, ariaLabel = 'Abrir información del torneo' }) {
  return (
    <button
      className={styles.hamburgerButton}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      <Menu className={styles.hamburgerIcon} size={22} />
    </button>
  )
}
