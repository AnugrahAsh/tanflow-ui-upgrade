import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { Avatar } from '../primitives.jsx'
import { useApp } from '../../context/AppContext.jsx'

// Small filled/outline star marker used for pinned/favourited entries.
function Star({ ghost, size = 14 }) {
  return (
    <svg className={`sd-star ${ghost ? 'ghost' : ''}`} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// Sidebar navigation model (mirrors the reference layout). Items with a `route`
// navigate to an existing view; the rest highlight in place.
const SECTIONS = [
  { title: 'DASHBOARD', items: [
    { label: 'My Connections', icon: 'grid', route: 'my-connections' },
    { label: 'Active Sessions', icon: 'sessions', route: 'sessions' },
    { label: 'History', icon: 'recordings', route: 'recordings' },
  ] },
  { title: 'CONNECTIONS', items: [
    { label: 'All Connections', icon: 'sso', route: 'connections' },
    { label: 'Connection Groups', icon: 'folder', route: 'connection-groups' },
    { label: 'Sharing Profiles', icon: 'share2', route: 'sharing-profiles' },
  ] },
  { title: 'USERS', items: [
    { label: 'All Users', icon: 'users', route: 'users' },
    { label: 'User Groups', icon: 'groups', route: 'groups' },
    { label: 'Roles', icon: 'roles', route: 'roles' },
  ] },
  { title: 'ACCESS MANAGEMENT', items: [
    { label: 'Time-Based Access', icon: 'calendar', route: 'time-based-access' },
    { label: 'Change Management', icon: 'edit', route: 'change-management' },
  ] },
  { title: 'SECURITY', items: [
    { label: 'MFA', icon: 'fingerprint', route: 'mfa' },
    { label: 'LDAP Integration', icon: 'directory', route: 'ldap' },
    { label: 'Password Vault', icon: 'vault', route: 'vault' },
    { label: 'Command Restrictions', icon: 'commands', route: 'commands' },
  ] },
  { title: 'EXTERNAL ACCESS', items: [
    { label: 'Monitor', icon: 'eye', route: 'monitor' },
  ] },
  { title: 'REPORTS', items: [
    { label: 'All Reports', icon: 'reports', route: 'reports' },
  ] },
  { title: 'SETTINGS', items: [
    { label: 'Settings', icon: 'settings', route: 'settings' },
    { label: 'SSO Providers', icon: 'sso', route: 'sso-providers' },
    { label: 'Email Management', icon: 'mail', route: 'email-management' },
    { label: 'SMS Management', icon: 'phone', route: 'sms-management' },
    { label: 'Profile', icon: 'user', route: 'my-profile' },
    { label: 'License', icon: 'certs', route: 'license' },
  ] },
]

const ALL_ITEMS = SECTIONS.flatMap((sec) => sec.items)
const DEFAULT_FAVS = ['sessions', 'connections']
const itemAt = (id) => { const [s, i] = id.split('-').map(Number); return SECTIONS[s]?.items[i] }

// Clickable favourite toggle shown on every item — gold when favourited,
// faint and reveal-on-hover otherwise.
function FavStar({ active, onToggle }) {
  return (
    <span
      role="button"
      tabIndex={-1}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      className={`sd-star sd-star-btn ${active ? 'fav' : 'ghost'}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </span>
  )
}

export default function Sidebar({ onToggleNav }) {
  const { go, toggleFlyout } = useApp()
  const location = useLocation()
  const current = location.pathname.replace('/', '') || 'overview'
  const [query, setQuery] = useState('')
  const [closed, setClosed] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [favs, setFavs] = useState(() => {
    try { const s = localStorage.getItem('tanflow.favs'); return new Set(s ? JSON.parse(s) : DEFAULT_FAVS) } catch { return new Set(DEFAULT_FAVS) }
  })
  useEffect(() => { try { localStorage.setItem('tanflow.favs', JSON.stringify([...favs])) } catch { /* ignore */ } }, [favs])
  const toggleFav = (route) => setFavs((prev) => { const n = new Set(prev); if (n.has(route)) n.delete(route); else n.add(route); return n })

  // Keep the highlighted item in sync with the active route. If the current
  // selection already matches the route (e.g. a duplicate entry the user
  // clicked), keep it; otherwise select the first item bound to that route.
  useEffect(() => {
    let first = null
    SECTIONS.forEach((sec, s) => sec.items.forEach((it, i) => {
      if (first === null && it.route === current) first = `${s}-${i}`
    }))
    setActiveId((prev) => (prev && itemAt(prev)?.route === current ? prev : first))
  }, [current])

  const toggleSec = (title) => setClosed((c) => ({ ...c, [title]: !c[title] }))
  const q = query.trim().toLowerCase()

  const onItem = (id, it) => {
    setActiveId(id)
    if (it.route) go(it.route)
  }

  const favList = ALL_ITEMS.filter((it) => favs.has(it.route) && (!q || it.label.toLowerCase().includes(q)))
  const favClosed = !q && !!closed.FAVORITES
  let anyShown = favList.length > 0
  const sections = SECTIONS.map((sec, s) => {
    const items = sec.items
      .map((it, i) => ({ it, id: `${s}-${i}` }))
      .filter(({ it }) => !q || it.label.toLowerCase().includes(q))
    if (q && items.length === 0) return null
    const isClosed = !q && !!closed[sec.title]
    if (items.length) anyShown = true
    return (
      <div className="sd-sec" key={sec.title}>
        <button
          className={`sd-sec-h ${isClosed ? 'closed' : ''}`}
          onClick={() => !sec.pinned && toggleSec(sec.title)}
          aria-expanded={!isClosed}
          style={sec.pinned ? { cursor: 'default' } : undefined}
        >
          {sec.pinned && <Star size={12} />}
          <span className="sd-sec-lbl">{sec.title}</span>
          {!sec.pinned && <Icon name="chevD" size={13} className="sd-sec-chev" />}
        </button>
        {!isClosed && items.map(({ it, id }) => (
          <button key={id} className={`sd-item ${activeId === id ? 'on' : ''}`} onClick={() => onItem(id, it)}>
            <span className="sd-ico"><Icon name={it.icon} size={17} />{it.dot && <span className="sd-dot" />}</span>
            <span className="sd-label">{it.label}</span>
            {it.badge ? <span className="sd-badge">{it.badge}</span> : null}
            {it.route && <FavStar active={favs.has(it.route)} onToggle={() => toggleFav(it.route)} />}
          </button>
        ))}
      </div>
    )
  })

  return (
    <aside className="side">
      <div className="sd-filter">
        <div className="sd-filter-inp">
          <Icon name="search" size={15} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter navigation" aria-label="Filter navigation" />
        </div>
      </div>
      <nav className="sd-nav">
        {anyShown ? (
          <>
            {favList.length > 0 && (
              <div className="sd-sec">
                <button className={`sd-sec-h ${favClosed ? 'closed' : ''}`} onClick={() => toggleSec('FAVORITES')} aria-expanded={!favClosed}>
                  <Star size={12} />
                  <span className="sd-sec-lbl">FAVORITES</span>
                  <Icon name="chevD" size={13} className="sd-sec-chev" />
                </button>
                {!favClosed && favList.map((it) => (
                  <button key={`fav-${it.route}`} className={`sd-item ${current === it.route ? 'on' : ''}`} onClick={() => go(it.route)}>
                    <span className="sd-ico"><Icon name={it.icon} size={17} /></span>
                    <span className="sd-label">{it.label}</span>
                    <FavStar active onToggle={() => toggleFav(it.route)} />
                  </button>
                ))}
              </div>
            )}
            {sections}
          </>
        ) : <div className="sd-empty">No matches</div>}
      </nav>
      <div className="sd-foot">
        <div className="sd-user" onClick={() => toggleFlyout('user')} title="Anika Rao — Global Security Admin">
          <Avatar name="Anika Rao" color="#3E4784" />
          <div className="sd-u-meta">
            <div className="sd-u-name">Anika Rao</div>
            <div className="sd-u-role">Global Security Admin</div>
          </div>
        </div>
        <button className="sd-collapse" onClick={onToggleNav} title="Collapse navigation" aria-label="Collapse navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5M18 17l-5-5 5-5" /></svg>
        </button>
      </div>
    </aside>
  )
}
