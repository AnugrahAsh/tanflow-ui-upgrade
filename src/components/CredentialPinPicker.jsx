import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import DateTimePicker, { DurationChips } from './DateTimePicker.jsx'

/* §5 — pin a specific credential to a change request, so the grant issued on
   approval is exactly the account the requester asked for. */

const CANDIDATES = [
  { id: 'root@BTSPAMDEMO01', kind: 'Password', vault: true, risk: 'High', note: 'Full root — rotated every 24h' },
  { id: 'svc-deploy@BTSPAMDEMO01', kind: 'SSH key', vault: true, risk: 'Medium', note: 'Deploy automation account' },
  { id: 'ubuntu@BTSPAMDEMO01', kind: 'SSH key', vault: true, risk: 'Low', note: 'Unprivileged shell' },
]
const RISK = {
  High: { c: '#C2740B', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
  Medium: { c: '#9A7B1A', bg: '#FBF3E0', b: 'var(--warn-line)' },
  Low: { c: 'var(--mut)', bg: 'var(--surface-2)', b: 'var(--line)' },
}

export default function CredentialPinPicker({ request = 'AR-20441', onClose, onPin }) {
  const { toast } = useApp()
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState(CANDIDATES[1].id)
  const [window, setWindow] = useState('8 hours')
  const [expiry, setExpiry] = useState('')

  const rows = CANDIDATES.filter((c) => !q || (c.id + c.kind + c.note).toLowerCase().includes(q.toLowerCase()))
  const pin = () => { onPin?.(picked); toast('ok', 'Credential pinned', `${picked} pinned to ${request} for ${window} (demo).`); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="key2" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Pin a credential</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{request}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div className="search-inp" style={{ marginBottom: 12 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search accounts on this target…" value={q} onChange={(e) => setQ(e.target.value)} /></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.length === 0 ? (
              <div className="empty" style={{ padding: '32px 12px' }}><div className="e-ic"><Icon name="search" size={18} /></div><div className="e-t">No accounts match</div></div>
            ) : rows.map((c) => {
              const on = c.id === picked
              const t = RISK[c.risk]
              return (
                <label key={c.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 12px', border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`, background: on ? 'var(--accent-bg)' : 'var(--surface)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
                  <input type="radio" name="pin" checked={on} onChange={() => setPicked(c.id)} style={{ accentColor: 'var(--accent)', marginTop: 3 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="hrow" style={{ gap: 7, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{c.id}</span>
                      <span className="tag">{c.kind}</span>
                      {c.vault && <span className="tag tag-acc"><Icon name="unlock" size={9} />Vaulted</span>}
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-xs)', padding: '2px 6px' }}>{c.risk}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>{c.note}</span>
                  </span>
                </label>
              )
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 8 }}>Grant window</div>
            <DurationChips value={window} onChange={setWindow} options={['1 hour', '4 hours', '8 hours', '24 hours', 'Custom']} />
            {window === 'Custom' && <div style={{ marginTop: 12 }}><DateTimePicker label="EXPIRES AT" value={expiry} onChange={setExpiry} help="The grant is revoked automatically at this time." /></div>}
          </div>

          <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 16, padding: '12px 13px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="shieldCheck" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.55 }}>The secret is never revealed to the requester — it is injected at connect and the session is recorded.</div>
          </div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" onClick={pin}><Icon name="check" />Pin credential</button>
          </div>
        </div>
      </div>
    </div>
  )
}
