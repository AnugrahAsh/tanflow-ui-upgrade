import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { sessionPath } from '../lib/session.js'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }

// Maps a connection's display protocol to its Create-Connection schema key.
const PROTO_KEY = {
  RDP: 'rdp', SSH: 'ssh', VNC: 'vnc', TELNET: 'telnet', KUBERNETES: 'kubernetes', KUBECTL: 'kubernetes',
  MYSQL: 'mysql', POSTGRESQL: 'pgsql', PGSQL: 'pgsql', ORACLE: 'oracle', MSSQL: 'mssql', MONGODB: 'mongodb', REDIS: 'redis', MARIADB: 'mariadb',
  HTTPS: 'web-app', HTTP: 'web-app', 'WEB-APP': 'web-app', 'DB CLIENT': 'pgadmin',
}
const protoKey = (p) => PROTO_KEY[(p || '').toUpperCase()] || (p || '').toLowerCase()

export default function ConnectionDrawer({ conn: c, onConnect }) {
  const { toast, go, closeDrawer } = useApp()
  const navigate = useNavigate()
  const editConn = () => { closeDrawer(); navigate(`/create-connection/${protoKey(c.proto)}`, { state: { edit: { name: c.name, host: c.host, env: c.env, group: c.group, cred: c.cred, proto: c.proto } } }) }
  const [freezeOpen, setFreezeOpen] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const acct = c.name.toLowerCase()
  const TARGET = [
    ['Connection group', c.group || 'Tanflow Core'],
    ['Environment', c.env || 'Prod'],
    ['Owner', 'Platform Ops · tribhuwan.rao'],
    ['Session recording', 'Always on · retained 400 days'],
    ['Command policy', 'Prod-Deny baseline · 214 rules'],
    ['Access route', 'JIT checkout · 45-min window'],
  ]
  const VAULTED = [
    [`root@${acct}`, 'rotated 2 hrs ago · next rotation in 22h'],
    [`svc-deploy@${acct}`, 'rotated 6 hrs ago · next rotation in 22h'],
  ]
  const SESSIONS = [
    { name: 'Marcus Bennett', dur: '00:42:18', time: 'Live now', live: true },
    { name: 'Tribhuwan Rao', dur: '00:12:04', time: 'Yesterday' },
    { name: 'Erik Lindqvist', dur: '01:03:22', time: '3 days ago' },
  ]

  return (
    <>
      <div className="drawer-h">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={c.icon || 'commands'} size={20} style={{ color: 'var(--accent)' }} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.015em' }}>{c.name}</div>
            <div className="mono" style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 2 }}>{c.proto} · {c.host}</div>
            <div className="hrow" style={{ marginTop: 9, flexWrap: 'wrap', gap: 7 }}>
              <span className="tag">{c.env || 'Prod'}</span>
              <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><Icon name="unlock" size={12} />Vaulted</span>
              {c.liveDot && <span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />Live · 1 watching</span>}
              {frozen && <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--bad)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><Icon name="ban" size={12} />Frozen</span>}
            </div>
          </div>
        </div>
        <div className="hrow" style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair)', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-pri btn-sm" onClick={() => { closeDrawer(); onConnect ? onConnect(c) : go(sessionPath(c)) }}><Icon name="play" />Connect</button>
          <button className="btn btn-sec btn-sm" onClick={editConn}><Icon name="edit" />Edit</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Credential checkout', 'MFA step-up required to reveal (demo).')}><Icon name="unlock" />Check out credential</button>
          {frozen
            ? <button className="btn btn-sec btn-sm" style={{ marginLeft: 'auto', color: 'var(--ok)', borderColor: 'var(--ok-line)' }} onClick={() => { setFrozen(false); toast('ok', 'Target unfrozen', `${c.name} unfrozen — new sessions allowed (demo).`) }}><Icon name="check" />Unfreeze</button>
            : <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setFreezeOpen(true)}><Icon name="ban" />Freeze</button>}
        </div>
      </div>

      <div className="drawer-body">
        <div style={{ ...label, margin: '16px 0 4px' }}>Target</div>
        <div className="dl">
          {TARGET.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>))}
        </div>

        <div style={{ ...label, margin: '20px 0 6px' }}>Vaulted accounts</div>
        {VAULTED.map(([a, meta]) => (
          <div key={a} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
            <div style={{ minWidth: 0 }}><div className="mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent)' }}>{a}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{meta}</div></div>
            <span className="link" onClick={() => toast('ok', 'Checkout', `Credential for ${a} checked out — MFA step-up (demo).`)}>Checkout</span>
          </div>
        ))}

        <div style={{ ...label, margin: '20px 0 6px' }}>Recent sessions</div>
        {SESSIONS.map((s) => (
          <div key={s.name} className="hrow" style={{ gap: 11, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
            <Avatar name={s.name} cls="av-sm" />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Duration {s.dur} · recorded</div></div>
            <span style={{ fontSize: '11.5px', color: s.live ? 'var(--ok)' : 'var(--mut)', fontWeight: s.live ? 600 : 400, whiteSpace: 'nowrap' }}>{s.time}</span>
          </div>
        ))}
      </div>

      {freezeOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={() => setFreezeOpen(false)} />
          <div className="card" style={{ position: 'relative', width: 'min(440px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
            <div className="card-pad">
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div className="hrow" style={{ gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--bad-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="warnTri" size={19} style={{ color: 'var(--bad)' }} /></span>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Freeze {c.name}?</div>
                </div>
                <button className="icon-btn" onClick={() => setFreezeOpen(false)} aria-label="Close"><Icon name="x" size={16} /></button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.55 }}>New sessions to this target are blocked until unfrozen. Live sessions continue and remain recorded.</div>
              <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button className="btn btn-sec" onClick={() => setFreezeOpen(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => { setFrozen(true); setFreezeOpen(false); toast('warn', 'Target frozen', `${c.name} frozen — new sessions blocked until unfrozen (demo).`) }}><Icon name="warnTri" />Freeze target</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
