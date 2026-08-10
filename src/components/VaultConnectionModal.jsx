import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

/* §6 — bind a vaulted credential to the connection it rotates on.
   Rotation needs a way in: this is where you say how the vault reaches it. */

const METHODS = [
  { id: 'ssh', icon: 'commands', name: 'SSH', desc: 'passwd / authorized_keys over SSH' },
  { id: 'winrm', icon: 'windows', name: 'WinRM', desc: 'Set-ADAccountPassword over WinRM' },
  { id: 'db', icon: 'db', name: 'Database', desc: 'ALTER USER on the engine' },
  { id: 'api', icon: 'integrations', name: 'REST API', desc: 'Vendor endpoint with a webhook' },
]

export default function VaultConnectionModal({ credential = 'root@BTSPAMDEMO01', onClose, onSave }) {
  const { toast } = useApp()
  const [method, setMethod] = useState('ssh')
  const [host, setHost] = useState('10.0.0.150')
  const [port, setPort] = useState('22')
  const [account, setAccount] = useState('svc-rotator')
  const [verify, setVerify] = useState(true)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null) // null | 'ok' | 'fail'

  const test = () => {
    setTesting(true); setResult(null)
    setTimeout(() => { setTesting(false); setResult(host.trim() ? 'ok' : 'fail') }, 900)
  }
  const save = () => {
    if (!host.trim()) { toast('warn', 'Host required', 'The vault needs an address to reach this target.'); return }
    onSave?.({ method, host, port, account })
    toast('ok', 'Rotation connection saved', `${credential} will rotate over ${METHODS.find((m) => m.id === method).name} (demo).`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="link" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Rotation connection</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{credential}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div style={{ fontSize: '12.75px', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 16 }}>
            How the vault reaches this target to change the secret. Used only for rotation — never for user sessions.
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 9 }}>Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 9, marginBottom: 18 }}>
            {METHODS.map((m) => {
              const on = m.id === method
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{ textAlign: 'left', padding: '11px 12px', borderRadius: 'var(--r-sm)', background: on ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, cursor: 'pointer' }}>
                  <span className="hrow" style={{ gap: 8 }}><Icon name={m.icon} size={14} style={{ color: on ? 'var(--accent)' : 'var(--mut)' }} /><span style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{m.name}</span></span>
                  <span style={{ display: 'block', fontSize: '11.25px', color: 'var(--mut)', marginTop: 3 }}>{m.desc}</span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14, marginBottom: 14 }}>
            <div className="field"><label>HOST <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp mono" value={host} onChange={(e) => setHost(e.target.value)} placeholder="hostname or IP" /></div>
            <div className="field"><label>PORT</label><input className="inp mono" value={port} onChange={(e) => setPort(e.target.value)} /></div>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>ROTATION ACCOUNT</label>
            <input className="inp mono" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="account the vault authenticates as" />
            <div className="f-help">Needs permission to change the target credential — not the credential itself.</div>
          </div>

          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)', marginBottom: 14 }}>
            <div><div style={{ fontSize: '12.75px', fontWeight: 600, color: 'var(--ink)' }}>Verify after rotation</div><div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Log in with the new secret before marking it live.</div></div>
            <span className={`toggle ${verify ? 'on' : ''}`} onClick={() => setVerify((v) => !v)} role="switch" aria-checked={verify} />
          </div>

          {result && (
            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '11px 13px', marginBottom: 14, borderRadius: 'var(--r-sm)', background: result === 'ok' ? 'var(--ok-bg)' : 'var(--bad-bg)', border: `1px solid ${result === 'ok' ? 'var(--ok-line)' : 'var(--bad-line)'}` }}>
              <Icon name={result === 'ok' ? 'check' : 'warnTri'} size={15} style={{ color: result === 'ok' ? 'var(--ok)' : 'var(--bad)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {result === 'ok' ? `Reached ${host}:${port} as ${account} — rotation will work.` : 'Could not reach the target. Check the host and the rotation account.'}
              </div>
            </div>
          )}

          <div className="hrow" style={{ justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
            <button className="btn btn-sec" onClick={test} disabled={testing}>{testing ? 'Testing…' : <><Icon name="activity" size={14} />Test connection</>}</button>
            <div className="hrow" style={{ gap: 8 }}>
              <button className="btn btn-sec" onClick={onClose}>Cancel</button>
              <button className="btn btn-pri" onClick={save}><Icon name="check" />Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
