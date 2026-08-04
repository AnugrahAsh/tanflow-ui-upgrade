import { useState } from 'react'
import Icon from './Icon.jsx'

const GROUPS = [
  ['risk', 'Risk', ['Critical', 'High', 'Medium', 'Low']],
  ['proto', 'Protocol', ['SQL*Net', 'TDS', 'SSH', 'RDP', 'kubectl']],
  ['mfa', 'MFA', ['FIDO2', 'TOTP']],
  ['approval', 'Approval', ['JIT', 'Dual-control', 'Auto']],
]

export default function SessionFilters({ value, onApply, onClose }) {
  const [sel, setSel] = useState(() => ({ risk: new Set(value.risk), proto: new Set(value.proto), mfa: new Set(value.mfa), approval: new Set(value.approval) }))
  const toggle = (g, v) => setSel((s) => { const n = new Set(s[g]); n.has(v) ? n.delete(v) : n.add(v); return { ...s, [g]: n } })
  const reset = () => setSel({ risk: new Set(), proto: new Set(), mfa: new Set(), approval: new Set() })
  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <aside className="drawer show" role="dialog" aria-modal="true" aria-label="Advanced filters">
        <button className="icon-btn drawer-close" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        <div className="drawer-h">
          <div style={{ fontSize: 18, fontWeight: 700, padding: '4px 0 2px' }}>Advanced filters</div>
          <div style={{ fontSize: '12.5px', color: 'var(--mut)', paddingBottom: 14 }}>Narrow live sessions by risk, protocol, MFA strength and approval path.</div>
        </div>
        <div className="drawer-body">
          {GROUPS.map(([key, label, opts]) => (
            <div key={key} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>{label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {opts.map((o) => {
                  const on = sel[key].has(o)
                  return <button key={o} onClick={() => toggle(key, o)} style={{ padding: '7px 14px', borderRadius: 'var(--r-sm)', fontSize: '12.75px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, background: on ? 'var(--accent-bg)' : 'var(--surface)', color: on ? 'var(--accent)' : 'var(--ink-2)' }}>{o}</button>
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', gap: 8, flex: 'none' }}>
          <button className="btn btn-sec" style={{ flex: 1 }} onClick={reset}><Icon name="refresh" size={13} />Reset all</button>
          <button className="btn btn-pri" style={{ flex: 1 }} onClick={() => { onApply(sel); onClose() }}><Icon name="check" size={13} />Apply filters</button>
        </div>
      </aside>
    </>
  )
}
