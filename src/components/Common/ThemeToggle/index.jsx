import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label="Cambiar modo claro/oscuro"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className={styles.icon} size={18} color="#f59e0b" />
      ) : (
        <Moon className={styles.icon} size={18} />
      )}
    </button>
  )
}
