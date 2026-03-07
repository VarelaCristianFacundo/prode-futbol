import { useState, useMemo, lazy, Suspense } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ALL_TABS } from './tabs.config'
import { hasViewSections, getViewSections, getDefaultSection } from './pages-with-sections.config'
import NavHeader from './NavHeader'
import NavTabs from './NavTabs'

// Lazy loading de componentes de contenido
const PredictionForm = lazy(() => import('../PredictionForm'))
const AllPredictions = lazy(() => import('../AllPredictions'))
const Leaderboard = lazy(() => import('../LeaderBoard'))
const InfoPage = lazy(() => import('../InfoPage'))
const MatchManager = lazy(() => import('../MatchManager'))
const RoundManager = lazy(() => import('../RoundManager'))
const PersonalStats = lazy(() => import('../PersonalStats'))

export default function Navigation() {
  const [activeTab, setActiveTab] = useState('tournament')
  // Estado genérico para trackear secciones activas de cualquier vista
  const [activeSections, setActiveSections] = useState({ tournament: 'predictions' })
  const [allPredictionsSelection, setAllPredictionsSelection] = useState({
    roundNumber: null,
    userId: '',
  })
  const { profile, isAdmin, signOut } = useAuth()

  // Filtrar tabs visibles según permisos
  const visibleTabs = useMemo(() => ALL_TABS.filter(tab => !tab.adminOnly || isAdmin()), [isAdmin])

  // Handler para navegación desde menú hamburguesa
  const handleNavigationFromMenu = viewType => {
    setActiveTab(viewType)
    // Inicializar sección por defecto si la vista tiene secciones y aún no está inicializada
    if (hasViewSections(viewType) && !activeSections[viewType]) {
      setActiveSections(prev => ({
        ...prev,
        [viewType]: getDefaultSection(viewType),
      }))
    }
  }

  // Determinar qué tabs mostrar según la vista activa (tabs principales o secciones)
  const tabsToShow = useMemo(() => {
    const viewSections = getViewSections(activeTab)
    return viewSections || visibleTabs
  }, [activeTab, visibleTabs])

  // Determinar tab activo actual (puede ser sección o tab principal)
  const currentActiveTab = activeSections[activeTab] || activeTab

  // Verificar si debemos mostrar tabs
  const shouldShowTabs = visibleTabs.some(tab => tab.id === activeTab) || hasViewSections(activeTab)

  // Handler para cambiar tabs (genérico para tabs principales o secciones)
  const handleTabChange = tabId => {
    if (hasViewSections(activeTab)) {
      // Si la vista actual tiene secciones, cambiar la sección activa
      setActiveSections(prev => ({ ...prev, [activeTab]: tabId }))
    } else {
      // Sino, cambiar el tab principal
      setActiveTab(tabId)
    }
  }

  const renderContent = () => {
    // Si es una vista con secciones (tournament, info, admin), renderizar según la sección activa
    if (hasViewSections(activeTab)) {
      const currentSection = activeSections[activeTab] || getDefaultSection(activeTab)

      // Tournament sections
      if (activeTab === 'tournament') {
        switch (currentSection) {
          case 'predictions':
            return (
              <Suspense fallback={<LoadingSpinner />}>
                <PredictionForm roundNumber={1} />
              </Suspense>
            )
          case 'all-predictions':
            return (
              <Suspense fallback={<LoadingSpinner />}>
                <AllPredictions
                  initialRound={allPredictionsSelection.roundNumber}
                  initialUser={allPredictionsSelection.userId}
                />
              </Suspense>
            )
          case 'leaderboard':
            return (
              <Suspense fallback={<LoadingSpinner />}>
                <Leaderboard
                  onViewPredictions={({ userId, roundNumber }) => {
                    setAllPredictionsSelection({ roundNumber, userId })
                    setActiveSections(prev => ({ ...prev, tournament: 'all-predictions' }))
                  }}
                />
              </Suspense>
            )
          default:
            return null
        }
      }

      // Info sections
      if (activeTab === 'info') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <InfoPage activeSection={currentSection} />
          </Suspense>
        )
      }

      // Stats sections
      if (activeTab === 'stats') {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PersonalStats activeSection={currentSection} />
          </Suspense>
        )
      }

      // Admin sections
      if (activeTab === 'admin') {
        if (!isAdmin()) return null
        return (
          <Suspense fallback={<LoadingSpinner />}>
            {currentSection === 'admin-matches' ? <MatchManager /> : <RoundManager />}
          </Suspense>
        )
      }
    }

    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header - Mobile First */}
      <nav
        style={{
          backgroundColor: 'var(--color-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <div className="container">
          <NavHeader profile={profile} onNavigate={handleNavigationFromMenu} signOut={signOut} />

          {/* Tabs - Responsive - Muestra tabs de navegación o secciones de InfoPage */}
          {shouldShowTabs && (
            <NavTabs
              tabs={tabsToShow}
              activeTab={currentActiveTab}
              setActiveTab={handleTabChange}
            />
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`} id={`panel-${activeTab}`}>
          {renderContent()}
        </div>
      </div>

      <NavigationStyles />
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '40px',
      }}
      aria-label="Cargando contenido"
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  )
}

function NavigationStyles() {
  return (
    <style>
      {`
        @media (max-width: 1199px) {
          .mobile-hidden { display: none !important; }
          .mobile-visible { display: inline !important; }
          .desktop-flex { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .tab-label-desktop { display: none; }
          .tab-label-mobile { display: inline !important; }
          .tab-button {
            min-width: 90px;
          }
          .desktop-title { display: none !important; }
          .mobile-title { display: inline !important; }

          /* Cuando hay más de 3 tabs, mostrar solo iconos */
          .tabs-compact .tab-label-mobile { display: none !important; }
          .tabs-compact .tab-button {
            min-width: 60px;
            padding: 8px 4px;
          }
          .tabs-compact .tab-button span:first-child {
            font-size: 1.5rem;
          }
        }

        @media (min-width: 1200px) {
          .mobile-hidden { display: inline !important; }
          .mobile-visible { display: none !important; }
          .desktop-flex { display: flex !important; align-items: center; }
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
          .tab-label-desktop { display: inline; }
          .tab-label-mobile { display: none !important; }
          .tab-button {
            flex-direction: row !important;
            gap: 8px !important;
          }
          .desktop-title { display: inline !important; }
          .mobile-title { display: none !important; }
        }

        .tab-button:hover {
          background-color: var(--color-surface-highlight);
          transform: translateY(-1px);
        }

        .tab-button:active {
          transform: translateY(0);
        }

        .tabs-container::-webkit-scrollbar {
          height: 4px;
        }

        .tabs-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .tabs-container::-webkit-scrollbar-thumb {
          background: var(--color-text-disabled);
          border-radius: 4px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  )
}
