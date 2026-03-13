import { memo } from 'react'
import UserBadge from '../UserBadge'
import ThemeToggle from '../../Common/ThemeToggle'
import styles from './NavHeader.module.css'
import Sidebar from '../Sidebar'
import NavTabs from '../NavTabs'

function NavHeader({ profile, onNavigate, signOut, tabs, activeTab, setActiveTab }) {
  return (
    <header>
      <div className={styles.prodeHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logoContainer}><img src="/icono.png" alt="logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} /></div>
          <div className={styles.brandInfo}>
            <h1>Prode Tsoft</h1>
            <UserBadge username={profile?.username} />
          </div>
        </div>

        {tabs && tabs.length > 0 && (
          <div className={styles.headerCenter}>
            <NavTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}

        <div className={styles.headerRight}>
          <ThemeToggle />
          <Sidebar onNavigate={onNavigate} onSignOut={signOut} />
        </div>
      </div>

      {/* Mobile: tabs shown below the header row */}
      {tabs && tabs.length > 0 && (
        <div className={styles.mobileTabs}>
          <NavTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
    </header>
  )
}

export default memo(NavHeader)
