import { useState, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { MENU_ITEMS } from './menu.config'
import HamburgerButton from './HamburgerButton'
import TournamentDrawer from './TournamentDrawer'
import MainMenuView from './Views/MainMenuView'

export default function Sidebar({ onNavigate, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isAdmin } = useAuth()

  // Filtrar items del menú según permisos
  const visibleMenuItems = useMemo(
    () => MENU_ITEMS.filter(item => !item.adminOnly || isAdmin()),
    [isAdmin]
  )

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  const handleSelectItem = async item => {
    // Manejar logout
    if (item.type === 'logout' && onSignOut) {
      setIsLoggingOut(true)
      try {
        await onSignOut()
      } finally {
        setIsLoggingOut(false)
        setIsOpen(false)
      }
      return
    }

    // Cerrar drawer y navegar
    setIsOpen(false)

    // Navegar a la vista seleccionada
    if (item.viewType && onNavigate) {
      onNavigate(item.viewType)
    }
  }

  return (
    <>
      <HamburgerButton onClick={handleOpen} />
      <TournamentDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title="Menú"
        showBackButton={false}
      >
        <MainMenuView
          menuItems={visibleMenuItems}
          onSelectItem={handleSelectItem}
          isLoggingOut={isLoggingOut}
        />
      </TournamentDrawer>
    </>
  )
}
