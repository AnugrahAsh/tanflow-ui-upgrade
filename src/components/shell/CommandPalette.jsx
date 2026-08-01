import { useState, useMemo, useEffect, useRef } from 'react'
import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { NAV } from '../../router/nav.js'
import { USERS, SESSIONS } from '../../data/mockData.js'
import UserDrawer from '../../views/UserDrawer.jsx'

const ACTIONS = [
  ['Rotate all credentials in a safe', 'vault'],
  ['Launch certification campaign', 'certs'],
  ['Add SoD rule', 'policies'],
  ['Register SAML application', 'sso'],
]

export default function CommandPalette() {
  const { paletteOpen, closePalette, go, openDrawer } = useApp()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)

  const items = useMemo(() => {
    const list = []
    NAV.forEach((g) => g.items.forEach(([id, label]) => list.push({ grp: 'Navigate', icon: id, label, sub: g.grp, act: () => go(id) })))
    USERS.slice(0, 10).forEach((u) => list.push({ grp: 'Identities', icon: 'user', label: u.name, sub: u.email, act: () => { go('users'); openDrawer(<UserDrawer user={u} />) } }))
    SESSIONS.forEach((s) => list.push({ grp: 'Live Sessions', icon: 'sessions', label: `${s.id} — ${s.acct}@${s.target}`, sub: s.user, act: () => go('sessions') }))
    ACTIONS.forEach(([label, id]) => list.push({ grp: 'Actions', icon: 'zap', label, sub: 'Quick action', act: () => go(id) }))
    return list
  }, [go, openDrawer])

  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    return items.filter((i) => !query || i.label.toLowerCase().includes(query) || i.sub.toLowerCase().includes(query)).slice(0, 14)
  }, [q, items])

  useEffect(() => { setSel(0) }, [q])
  useEffect(() => {
    if (paletteOpen) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [paletteOpen])

  const run = (i) => { const it = filtered[i]; if (it) { closePalette(); it.act() } }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel) }
  }

  // Grouped rendering with running index across groups.
  let cursor = -1
  let lastGrp = ''

  return (
    <div className={`modal-wrap ${paletteOpen ? 'show' : ''}`} id="palette-wrap">
      <div className="m-scrim" onClick={closePalette} />
      <div className="palette">
        <div className="pal-inp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            placeholder="Search or jump to… (users, sessions, vaults, policies)"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="pal-list" id="pal-list">
          {filtered.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}>
              <div className="e-t">No matches</div>
              <div className="e-s">Try users, sessions, vault, policies…</div>
            </div>
          ) : filtered.map((i) => {
            cursor++
            const idx = cursor
            const showGrp = i.grp !== lastGrp
            lastGrp = i.grp
            return (
              <div key={idx}>
                {showGrp && <div className="pal-grp">{i.grp}</div>}
                <button
                  className={`pal-it ${idx === sel ? 'sel' : ''}`}
                  onMouseEnter={() => setSel(idx)}
                  onClick={() => run(idx)}
                >
                  <Icon name={i.icon} size={15} /><span>{i.label}</span><span className="pi-sub">{i.sub}</span>
                </button>
              </div>
            )
          })}
        </div>
        <div className="pal-foot"><span><kbd>↑↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>ESC</kbd> Close</span></div>
      </div>
    </div>
  )
}
