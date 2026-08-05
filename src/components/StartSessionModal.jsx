import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { sessionPath } from '../lib/session.js'

// Shared "Start session" modal used by My Connections and All Connections.
// Launches the full-screen Session Console through the gateway.
const PROTO_STYLE = {
  SSH: { tint: '#FDF0E1', color: '#B4690E' }, RDP: { tint: '#E8F0FF', color: '#2563EB' }, HTTPS: { tint: '#F0EAFE', color: '#7C3AED' },
  MYSQL: { tint: '#E6F5EF', color: '#0E9F6E' }, POSTGRESQL: { tint: '#E6F5EF', color: '#0E9F6E' }, ORACLE: { tint: '#E6F5EF', color: '#0E9F6E' }, 'DB CLIENT': { tint: '#EEF0F3', color: '#4B5563' },
}
const WINDOWS = ['15 min', '30 min', '45 min', '2 hrs']
const PURPOSES = ['Testing & accessibility', 'Incident response', 'Routine maintenance', 'Deployment / release', 'Audit & review']

const ProtoTile = ({ icon, proto, size = 38 }) => {
  const s = PROTO_STYLE[proto] || { tint: 'var(--surface-2)', color: 'var(--mut)' }
  return <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={Math.round(size * 0.52)} style={{ color: s.color }} /></span>
}

export default function StartSessionModal({ target, onClose }) {
  const { toast, go } = useApp()
  const prod = String(target.env || '').toUpperCase() === 'PROD'
  const policy = target.policy || 'Prod-Deny baseline'
  const [acct, setAcct] = useState('root')
  const [win, setWin] = useState('30 min')
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const valid = !prod || (ticket.trim() && reason.trim())
  const launch = () => { toast('ok', 'Session launching', `${target.name} — ${win} JIT window opened via the gateway (demo).`); onClose(); go(sessionPath(target)) }
  const ACCOUNTS = [['root', '2 hrs ago'], ['svc-deploy', '6 hrs ago']]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}><ProtoTile icon={target.icon} proto={target.proto} size={38} />
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>Start session</div><div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{target.name} · {target.proto} · {target.host}</div></div></div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)', marginBottom: 16 }}>
            <Icon name="shieldCheck" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.5 }}>This session will be <b>fully recorded</b> and evaluated against the <b>{policy} command policy</b>. Gateway: eu-central-1.</div>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 8 }}>Privileged account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {ACCOUNTS.map(([a, rot]) => (
              <label key={a} style={{ display: 'flex', gap: 11, padding: '12px 14px', border: `1px solid ${acct === a ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: acct === a ? 'var(--sh-focus)' : 'none' }}>
                <input type="radio" name="acct" checked={acct === a} onChange={() => setAcct(a)} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
                <div><div className="hrow" style={{ gap: 7 }}><Icon name="unlock" size={13} style={{ color: 'var(--accent)' }} /><span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{a}</span></div>
                  <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>Vaulted · rotated {rot} · JIT checkout</div></div>
              </label>
            ))}
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 8 }}>Access window <span style={{ color: 'var(--mut)', fontWeight: 400 }}>(auto-terminates)</span></div>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 18 }}>
            {WINDOWS.map((w) => (
              <button key={w} onClick={() => setWin(w)} style={{ padding: '8px 16px', fontSize: '12.75px', fontWeight: 600, cursor: 'pointer', background: win === w ? 'var(--accent-bg)' : 'transparent', color: win === w ? 'var(--accent)' : 'var(--ink-2)', borderRight: w !== '2 hrs' ? '1px solid var(--line-2)' : 'none' }}>{w}</button>
            ))}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Purpose <span style={{ color: 'var(--mut)', fontWeight: 400 }}>(audit trail)</span></label>
            <select className="sel" value={purpose} onChange={(e) => setPurpose(e.target.value)}>{PURPOSES.map((p) => <option key={p}>{p}</option>)}</select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="field"><label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>Change / incident ticket {prod && <span style={{ color: 'var(--bad)' }}>*</span>}</label><input className="inp" placeholder="e.g. CHG-88214" value={ticket} onChange={(e) => setTicket(e.target.value)} /></div>
            <div className="field"><label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>Reason for access {prod && <span style={{ color: 'var(--bad)' }}>*</span>}</label><input className="inp" placeholder="Business justification" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>

          {prod && (
            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--warn-bg)', border: '1px solid rgba(224,150,0,.35)', borderRadius: 'var(--r-sm)', marginTop: 14 }}>
              <Icon name="warnTri" size={15} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}><b style={{ color: 'var(--ink)' }}>Production target.</b> Ticket and reason are required and this checkout is logged for SOX evidence.</div>
            </div>
          )}

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!valid} onClick={launch} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="play" />Launch session</button>
          </div>
        </div>
      </div>
    </div>
  )
}
