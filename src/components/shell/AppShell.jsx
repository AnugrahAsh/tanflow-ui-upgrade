import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import StatusBar from './StatusBar.jsx'
import Drawer from './Drawer.jsx'
import Flyout from './Flyout.jsx'
import Toaster from './Toaster.jsx'
import CommandPalette from './CommandPalette.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { ROUTE_META } from '../../router/nav.js'

export default function AppShell() {
  const { openPalette, closeOverlays, flyout, closeFlyout, go } = useApp()
  const [navMin, setNavMin] = useState(false)
  const location = useLocation()
  const current = location.pathname.split('/')[1] || 'overview'
  const meta = ROUTE_META[current]
  const contentRef = useRef(null)

  // Document title follows the active route.
  useEffect(() => { if (meta) document.title = `${meta.label} · Tanflow` }, [meta])

  // Reset scroll on view change.
  useEffect(() => { if (contentRef.current) contentRef.current.scrollTop = 0 }, [current])

  // Global shortcuts: ⌘K / Ctrl+K opens palette, Escape closes overlays.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette() }
      if (e.key === 'Escape') closeOverlays()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPalette, closeOverlays])

  // Click outside an open flyout closes it (toggle buttons stopPropagation).
  useEffect(() => {
    if (!flyout) return
    const onClick = (e) => { if (!e.target.closest('.flyout')) closeFlyout() }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [flyout, closeFlyout])

  return (
    <>
      <div className={`app ${navMin ? 'nav-min' : ''}`} id="app">
        <TopBar />
        <Sidebar onToggleNav={() => setNavMin((m) => !m)} />
        <div className="main-col">
          <main className="content" id="content" ref={contentRef}>
            <div className="content-inner">
              <nav className="crumbs" aria-label="Breadcrumb">
                {meta && (
                  <>
                    {meta.group !== 'Home' && (
                      <><span className="c-root" onClick={() => go('overview')}>Home</span><span className="c-sep">/</span></>
                    )}
                    <span>{meta.group}</span><span className="c-sep">/</span><span className="c-cur">{meta.label}</span>
                  </>
                )}
              </nav>
              <div id="view" key={location.pathname}><Outlet /></div>
            </div>
          </main>
        </div>
        <StatusBar />
      </div>

      <Drawer />
      <CommandPalette />
      <Flyout />
      <Toaster />
    </>
  )
}
