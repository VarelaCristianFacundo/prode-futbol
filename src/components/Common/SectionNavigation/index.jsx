import styles from './SectionNavigation.module.css'

/**
 * Componente de navegación reutilizable por secciones
 * @param {Array} sections - Array de secciones con { id, label, icon }
 * @param {string} activeSection - ID de la sección activa
 * @param {Function} onSectionChange - Callback cuando cambia la sección
 * @param {boolean} showOnMobile - Si mostrar en mobile (default: true)
 * @param {string} variant - 'default' | 'compact' (default: 'default')
 */
export default function SectionNavigation({
  sections,
  activeSection,
  onSectionChange,
  showOnMobile = true,
  variant = 'default',
}) {
  return (
    <div
      className={`${styles.container} ${!showOnMobile ? styles.hideOnMobile : ''} ${styles[`variant${variant.charAt(0).toUpperCase()}${variant.slice(1)}`]}`}
    >
      {sections.map(section => (
        <button
          key={section.id}
          className={`${styles.navButton} ${activeSection === section.id ? styles.navButtonActive : ''}`}
          onClick={() => onSectionChange(section.id)}
          type="button"
        >
          <span className={styles.navIcon}>{section.icon}</span>
          <span className={styles.navLabel}>{section.label}</span>
        </button>
      ))}
    </div>
  )
}
