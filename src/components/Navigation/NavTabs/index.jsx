import { memo, useCallback, useEffect, useRef } from 'react'
import TabButton from '../TabButton'

function NavTabs({ tabs, activeTab, setActiveTab }) {
  const tabsRef = useRef([])
  const isCompact = tabs.length > 3

  const handleKeyDown = useCallback(
    e => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab)

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTab(tabs[nextIndex].id)
        setTimeout(() => tabsRef.current[nextIndex]?.focus(), 0)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
        setActiveTab(tabs[prevIndex].id)
        setTimeout(() => tabsRef.current[prevIndex]?.focus(), 0)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setActiveTab(tabs[0].id)
        setTimeout(() => tabsRef.current[0]?.focus(), 0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setActiveTab(tabs[tabs.length - 1].id)
        setTimeout(() => tabsRef.current[tabs.length - 1]?.focus(), 0)
      }
    },
    [activeTab, tabs, setActiveTab]
  )

  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    tabsRef.current[currentIndex]?.focus()
  }, [activeTab, tabs])

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="tablist"
      aria-label="Navegación principal"
      className={`tabs-container ${isCompact ? 'tabs-compact' : ''}`}
      style={{
        display: 'flex',
        gap: '0px',
        overflowX: tabs.length > 3 ? 'visible' : 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, index) => (
        <div key={tab.id} style={{ display: 'contents' }}>
          <TabButton
            ref={el => {
              tabsRef.current[index] = el
            }}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={setActiveTab}
          />
        </div>
      ))}
    </div>
  )
}

export default memo(NavTabs)
