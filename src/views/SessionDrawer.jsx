import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }
const MfaTone = { FIDO2: { c: 'var(--ok)', bg: 'var(--ok-bg)' }, TOTP: { c: 'var(--accent)', bg: 'var(--accent-bg)' } }
const ApprTone = { JIT: { c: 'var(--accent)', bg: 'var(--accent-bg)' }, 'Dual-control': { c: '#7C3AED', bg: '#EDE9FE' }, Auto: { c: 'var(--mut)', bg: 'var(--surface-2)' } }
const Tag = ({ label, tone }) => <span style={{ fontSize: '11px', fontWeight: 600, color: tone.c, background: tone.bg, borderRadius: 6, padding: '2px 8px' }}>{label}</span>

export default function SessionDrawer({ session: s, onShadow, onTerminate }) {
  const { toast } = useApp()
  const timeline = [
    { color: 'var(--accent)', title: 'Session authorized', sub: `${s.approval} path · MFA ${s.mfa}`, time: '00:00' },
    { color: 'var(--ok)', title: 'Connected via gateway', sub: `${s.source} → ${s.target} (${s.proto})`, time: '00:04' },
    { color: 'var(--warn-core)', title: 'Sensitive object accessed', sub: `matched policy “${s.policy}”`, time: '00:11' },
    ...(s.blocked ? [{ color: 'var(--bad)', title: 'Command blocked', sub: `${s.blocked} statement(s) denied by policy`, time: '00:19' }] : []),
    { color: 'var(--accent)', title: 'Live', sub: `${s.commands || 0} commands · ${s.watchers} watching`, time: 'now' },
  ]
  const cmds = [['SELECT COUNT(*) FROM FIN.PAYMENT_BATCH', 'Allowed'], ['ALTER SYSTEM SET log_archive_dest_2=…', 'Allowed']]

  return (
    <>
      <div className="drawer-h">
        <div className="hrow" style={{ gap: 12, paddingBottom: 10 }}>
          <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sessions" size={19} style={{ color: 'var(--accent)' }} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hrow" style={{ gap: 8 }}><span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{s.id}</span><span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Live</span></div>
            <div style={{ fontSize: '12.75px', color: 'var(--ink-2)', marginTop: 1 }}>{s.name} · {s.role}</div>
          </div>
        </div>
        <div className="hrow" style={{ gap: 7, flexWrap: 'wrap', paddingBottom: 12 }}>
          <Tag label={`${s.risk} ${s.score}/100`} tone={{ c: 'var(--bad)', bg: 'var(--bad-bg)' }} />
          <Tag label={s.approval} tone={ApprTone[s.approval]} /><Tag label={s.mfa} tone={MfaTone[s.mfa]} /><Tag label={s.env} tone={{ c: '#9A7B1A', bg: 'var(--warn-bg)' }} />
        </div>
        <div className="hrow" style={{ gap: 8, paddingBottom: 14, borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <button className="btn btn-pri btn-sm" onClick={onShadow}><Icon name="eye" />Shadow</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('warn', 'Input locked', `${s.id} keyboard frozen — session preserved (demo).`)}><Icon name="lock" />Lock input</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Joined', `You are now co-watching ${s.id} (demo).`)}><Icon name="eye" />Join as watcher</button>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={onTerminate}><Icon name="ban" />Terminate</button>
        </div>
      </div>

      <div className="drawer-body">
        <div className="dl" style={{ marginTop: 14 }}>
          <div className="dl-k">Account</div><div className="dl-v mono">{s.acct}</div>
          <div className="dl-k">Target</div><div className="dl-v mono">{s.target}</div>
          <div className="dl-k">Protocol</div><div className="dl-v"><span className="tag">{s.proto}</span></div>
          <div className="dl-k">Source</div><div className="dl-v"><span className="mono">{s.source}</span> <span className="tag" style={{ fontSize: '9.5px' }}>IN</span></div>
          <div className="dl-k">Started</div><div className="dl-v">{s.started} · {s.duration} elapsed</div>
          <div className="dl-k">Purpose</div><div className="dl-v">{s.purpose}</div>
          <div className="dl-k">Recording</div><div className="dl-v"><span className="hrow" style={{ gap: 6, color: 'var(--ok)', fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Recording</span></div>
          <div className="dl-k">Watchers</div><div className="dl-v num">{s.watchers}</div>
        </div>

        <div style={{ ...label, margin: '20px 0 10px' }}>Session timeline</div>
        {timeline.map((t, i) => (
          <div key={t.title} className="hrow" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: t.color, flex: 'none', marginTop: 3 }} />
              {i < timeline.length - 1 && <span style={{ flex: 1, width: 2, background: 'var(--hair)', margin: '3px 0' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 10 }}><span style={{ fontSize: '13px', fontWeight: 650 }}>{t.title}</span><span className="num" style={{ fontSize: '11px', color: 'var(--mut)' }}>{t.time}</span></div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{t.sub}</div>
            </div>
          </div>
        ))}

        <div style={{ ...label, margin: '18px 0 8px' }}>Recent commands</div>
        {cmds.map(([c, v]) => (
          <div key={c} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
            <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
            <span className="tag" style={{ color: 'var(--ok)', background: 'var(--ok-bg)', borderColor: 'transparent', flex: 'none' }}>{v}</span>
          </div>
        ))}
      </div>
    </>
  )
}
