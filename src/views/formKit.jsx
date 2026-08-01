import { useState } from 'react'
import Icon from '../components/Icon.jsx'

// Shared form building blocks for the "create" pages — design-system tokens only.
export const Req = () => <span style={{ color: 'var(--bad)' }}> *</span>

export const SubLabel = ({ children, style }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', ...style }}>{children}</div>
)

export function Field({ label, required, help, full, children }) {
  return (
    <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label>{label}{required && <Req />}</label>
      {children}
      {help && <div className="f-help">{help}</div>}
    </div>
  )
}

export const CONNECTIONS = ['BTSIDAMDB01', 'BTSPLAPAM01', 'BTSSAPWINPOC01', 'HRMS APPLICATION', 'MySQL', 'MYSQL WORKBENCH']

const Expand = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
)

// Connection tree with checkboxes (matches the target screenshots).
export function ConnectionTree({ selected, onToggle, onClear }) {
  const [q, setQ] = useState('')
  const items = CONNECTIONS.filter((c) => !q || c.toLowerCase().includes(q.toLowerCase()))
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--hair)', background: 'var(--surface-2)' }}>
        <div className="hrow" style={{ gap: 8, fontSize: '11.5px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}><Icon name="provisioning" size={14} />Connection Tree</div>
        <div className="hrow" style={{ gap: 8 }}>
          <div className="search-inp" style={{ width: 190 }}><Icon name="search" size={13} /><input className="inp" style={{ height: 28 }} placeholder="Search connections…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="mini-btn" title="Expand all" type="button"><Expand /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12 }}>
        {items.map((c) => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: selected.has(c) ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}>
            <input type="checkbox" checked={selected.has(c)} onChange={() => onToggle(c)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            <Icon name="sessions" size={14} style={{ color: 'var(--mut)', flex: 'none' }} />
            <span style={{ flex: 1, minWidth: 0 }}>{c}</span>
          </label>
        ))}
      </div>
      <div className="hrow" style={{ justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
        <span>Selected: {selected.size} item{selected.size === 1 ? '' : 's'}</span>
        <span className="link" onClick={onClear}>Clear Selection</span>
      </div>
    </div>
  )
}
