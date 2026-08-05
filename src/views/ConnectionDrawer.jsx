import Icon from '../components/Icon.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { sessionPath } from '../lib/session.js'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }

export default function ConnectionDrawer({ conn: c }) {
  const { toast, go, closeDrawer } = useApp()
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
              <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '2px 9px' }}><Icon name="unlock" size={12} />Vaulted</span>
              {c.liveDot && <span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />Live · 1 watching</span>}
            </div>
          </div>
        </div>
        <div className="hrow" style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair)', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-pri btn-sm" onClick={() => { closeDrawer(); go(sessionPath(c)) }}><Icon name="play" />Connect</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Edit connection', `Edit ${c.name} configuration (demo).`)}><Icon name="edit" />Edit</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Credential checkout', 'MFA step-up required to reveal (demo).')}><Icon name="unlock" />Check out credential</button>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast('warn', 'Freeze', `${c.name} frozen — new sessions blocked (demo).`)}><Icon name="ban" />Freeze</button>
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
    </>
  )
}
