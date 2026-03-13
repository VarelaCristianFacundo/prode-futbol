import { memo } from 'react'
import { CircleDot } from 'lucide-react'
import UserBadge from '../UserBadge'
import ThemeToggle from '../../Common/ThemeToggle'
import styles from './NavHeader.module.css'
import Sidebar from '../Sidebar'

function NavHeader({ profile, onNavigate, signOut }) {
  return (
    <header className={styles.prodeHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.logoContainer}><CircleDot size={24} /></div>
        <div className={styles.brandInfo}>
          <h1>Prode Tsoft</h1>
          <UserBadge username={profile?.username} />
        </div>
      </div>

      <div className={styles.headerRight}>
        <ThemeToggle />
        <Sidebar onNavigate={onNavigate} onSignOut={signOut} />
      </div>
    </header>
  )
}

export default memo(NavHeader)
