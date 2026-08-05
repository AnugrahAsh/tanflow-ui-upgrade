import { useState } from 'react'
import Icon from './Icon.jsx'

// Names and saves the current filter set as a reusable view.
export default function SaveViewModal({ summary, placeholder = 'e.g. Dormant privileged — my org', onSave, onClose }) {
  const [name, setName] = useState('')
  const ok = name.trim().length > 0
  const save = () => { if (ok) onSave(name.trim()) }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(520px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="star" size={17} style={{ color: 'var(--mut)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Save view</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Captures search, filter chips, segment and sort</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div className="field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>View name</label>
            <input className="inp" autoFocus placeholder={placeholder} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 10 }}>Current: {summary}</div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!ok} style={!ok ? { opacity: .55, cursor: 'not-allowed' } : undefined} onClick={save}><Icon name="check" />Save view</button>
          </div>
        </div>
      </div>
    </div>
  )
}
