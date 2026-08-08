import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import StatusBar from './StatusBar.jsx'
import Drawer from './Drawer.jsx'
import Flyout from './Flyout.jsx'
import Toaster from './Toaster.jsx'
import CommandPalette from './CommandPalette.jsx'
import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { ROUTE_META } from '../../router/nav.js'

function ShortcutsModal({ onClose }) {
  const shortcuts = [
    ['Ctrl / ⌘ + K', 'Open command palette'],
    ['?', 'Show keyboard shortcuts'],
    ['Esc', 'Close menus, drawers and dialogs'],
    ['↑ / ↓', 'Move through command palette results'],
    ['Enter', 'Open selected command-palette result'],
  ]
  return <div className="modal-wrap show" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div className="m-scrim" onClick={onClose} /><section className="palette" style={{ width: 460 }}><div className="hrow" style={{ justifyContent: 'space-between', padding: '15px 16px', borderBottom: '1px solid var(--line)' }}><div className="hrow" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="commands" size={16} /></span><div><div style={{ fontSize: 15, fontWeight: 700 }}>Keyboard shortcuts</div><div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>Navigate the console without leaving the keyboard.</div></div></div><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button></div><div style={{ padding: '4px 16px 12px' }}>{shortcuts.map(([keys, label]) => <div key={label} className="hrow" style={{ justifyContent: 'space-between', gap: 16, padding: '11px 0', borderBottom: '1px solid var(--hair)' }}><span style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{label}</span><kbd style={{ color: 'var(--ink-2)', background: 'var(--surface-3)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', padding: '3px 7px', fontSize: '11px' }}>{keys}</kbd></div>)}</div></section></div>
}

export default function AppShell() {
  const { openPalette, closeOverlays, flyout, closeFlyout, go } = useApp()
  const [navMin, setNavMin] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
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
      const editable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable
      if (e.key === '?' && !editable) { e.preventDefault(); setShortcutsOpen(true) }
      if (e.key === 'Escape') { setShortcutsOpen(false); closeOverlays() }
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
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
      <Flyout />
      <Toaster />
    </>
  )
}
