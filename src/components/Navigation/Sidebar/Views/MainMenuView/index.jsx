import logOut from '../../../../../assets/logout.svg'
import styles from './MainMenuView.module.css'

export default function MainMenuView({ menuItems, onSelectItem, isLoggingOut = false }) {
  return (
    <div className={styles.container}>
      <div className={styles.menuList}>
        {menuItems.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} className={styles.divider}>
                <span className={styles.dividerLabel}>{item.label}</span>
              </div>
            )
          }

          if (item.type === 'logout') {
            return (
              <button
                key={item.id}
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={() => onSelectItem(item)}
                type="button"
                disabled={isLoggingOut}
              >
                <span className={styles.menuIcon}>
                  {isLoggingOut ? (
                    <div className={styles.spinner} />
                  ) : (
                    <img src={logOut} alt="Cerrar sesión" className={styles.logoutIcon} />
                  )}
                </span>
                <div className={styles.menuContent}>
                  <div className={styles.menuLabel}>
                    {isLoggingOut ? 'Cerrando sesión...' : item.label}
                  </div>
                  {!isLoggingOut && item.description && (
                    <div className={styles.menuDescription}>{item.description}</div>
                  )}
                </div>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              className={styles.menuItem}
              onClick={() => onSelectItem(item)}
              type="button"
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <div className={styles.menuContent}>
                <div className={styles.menuLabel}>{item.label}</div>
                {item.description && (
                  <div className={styles.menuDescription}>{item.description}</div>
                )}
              </div>
              <span className={styles.menuArrow}>›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
