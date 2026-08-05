import { useState, useMemo, useRef, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { KpiTile } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { PROFILE } from '../data/mockData.js'
import StartSessionModal from '../components/StartSessionModal.jsx'
import ConnectionDrawer from './ConnectionDrawer.jsx'

const PROTO_STYLE = {
  SSH: { tint: '#FDF0E1', color: '#B4690E' }, RDP: { tint: '#E8F0FF', color: '#2563EB' }, HTTPS: { tint: '#F0EAFE', color: '#7C3AED' },
  MYSQL: { tint: '#E6F5EF', color: '#0E9F6E' }, POSTGRESQL: { tint: '#E6F5EF', color: '#0E9F6E' },
}
const PROTO_LABEL = { RDP: 'RDP', SSH: 'SSH', MYSQL: 'MySQL', POSTGRESQL: 'PostgreSQL', HTTPS: 'HTTPS' }
const C = (group, name, proto, icon, host, env, cred, o = {}) => ({ group, name, proto, icon, host, env, cred, grant: 'Standing', sessions: 0, used: '—', ...o })
const CONNS = [
  C('TANFLOW CORE', 'TANFLOWAD01', 'RDP', 'sessions', '192.168.1.80', 'PROD', 'vaulted', { pinned: true, live: true, yours: true, time: '00:12:04', grant: 'JIT · approval', used: 'Live now', sessions: 20, policy: 'Prod-Deny' }),
  C('TANFLOW CORE', 'BTSPLPAMPRODBD01', 'MYSQL', 'db', 'btsplpamprodbd01:3306', 'PROD', 'vaulted', { grant: 'Dual-control', expiring: 'in 6 days', used: '2 mos ago', sessions: 1, policy: 'Prod-Deny' }),
  C('TANFLOW CORE', 'Tanflow Docs Portal', 'HTTPS', 'globe', 'docs.tanflow.io', 'PROD', 'direct', { grant: 'Standing', used: '2 mos ago', sessions: 24, policy: 'Prod-Deny' }),
  C('TANFLOW CORE', 'TANFLOWAPP01', 'SSH', 'commands', '146.56.51.196', 'PROD', 'vaulted', { grant: 'Time-boxed', used: '21 days ago', sessions: 16, policy: 'Prod-Deny' }),
  C('BTS LAB', 'BTSPAMDEMO01', 'SSH', 'commands', '10.0.0.150', 'DEMO', 'vaulted', { pinned: true, live: true, other: 'Marcus', grant: 'Standing', used: 'Live now', sessions: 108, policy: 'Lab-Standard' }),
  C('BTS LAB', 'BTSIAMRETEST01', 'SSH', 'commands', '10.0.0.107', 'TEST', 'direct', { grant: 'Standing', used: '5 hrs ago', sessions: 96, policy: 'Lab-Standard' }),
  C('BTS LAB', 'BTSIDAMDEMODB01', 'POSTGRESQL', 'db', 'btsidamdemodb01:5432', 'DEMO', 'direct', { grant: 'JIT · approval', expiring: 'in 3 days', used: '2 mos ago', sessions: 8, policy: 'Lab-Standard' }),
  C('BTS LAB', 'BTSPAMDEV01', 'SSH', 'commands', '10.0.0.57', 'DEV', 'direct', { grant: 'Standing', used: '1 day ago', sessions: 61, policy: 'Lab-Standard' }),
  C('LOCAL TOOLS', 'LOCALSUPPORTDB', 'POSTGRESQL', 'db', 'localhost:5432', 'LOCAL', 'direct', { grant: 'Standing', used: '2 mos ago', sessions: 5, policy: 'Local' }),
]
const GROUP_ORDER = ['TANFLOW CORE', 'BTS LAB', 'LOCAL TOOLS']
const PROTOCOLS = [...new Set(CONNS.map((c) => c.proto))]
const SCOPES = ['Everything I can request', 'Standing grants', 'Time-boxed / JIT-gated']
const needsApproval = (c) => c.grant === 'JIT · approval' || c.grant === 'Dual-control'

const Chip = ({ icon, label, color, bg, border }) => (
  <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color, background: bg, border: border || '1px solid transparent', borderRadius: 'var(--r-sm)', padding: '2px 8px', whiteSpace: 'nowrap' }}>{icon && <Icon name={icon} size={11} />}{label}</span>
)
const grantChip = (c) => {
  if (c.grant === 'JIT · approval') return <Chip icon="clock" label="JIT · approval" color="#7C3AED" bg="#EDE9FE" />
  if (c.grant === 'Dual-control') return <Chip icon="shieldCheck" label="Dual-control" color="#7C3AED" bg="#EDE9FE" />
  if (c.grant === 'Time-boxed') return <Chip label="Time-boxed" color="var(--accent)" bg="var(--accent-bg)" />
  return <Chip label="Standing" color="var(--ok)" bg="var(--ok-bg)" />
}
const ProtoTile = ({ icon, proto, size = 34 }) => {
  const s = PROTO_STYLE[proto] || { tint: 'var(--surface-2)', color: 'var(--mut)' }
  return <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={Math.round(size * 0.52)} style={{ color: s.color }} /></span>
}
const Star = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="#F5A623" stroke="#F5A623" style={{ flex: 'none' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
const StarBtn = ({ filled }) => <svg viewBox="0 0 24 24" width="15" height="15" style={{ fill: filled ? '#F5A623' : 'none', stroke: filled ? '#F5A623' : 'var(--faint)', strokeWidth: 2, flex: 'none' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>

// ── Find a target modal (target-focused command palette) ─────────────────────
function FindTarget({ onPick, onClose }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 40) }, [])
  const results = useMemo(() => CONNS.filter((c) => !q || (c.name + c.host + c.proto + c.group).toLowerCase().includes(q.toLowerCase())), [q])
  useEffect(() => { setSel(0) }, [q])
  const run = (i) => { const t = results[i]; if (t) { onClose(); onPick(t) } }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel) }
    else if (e.key === 'Escape') onClose()
  }
  return (
    <div className="modal-wrap show">
      <div className="m-scrim" onClick={onClose} />
      <div className="palette">
        <div className="pal-inp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input ref={inputRef} placeholder="Find a target by name, host or protocol…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} autoComplete="off" />
          <kbd>ESC</kbd>
        </div>
        <div className="pal-list">
          {results.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}><div className="e-t">No targets found</div><div className="e-s">Try a different name, host or protocol.</div></div>
          ) : results.map((t, i) => (
            <button key={t.name} className={`pal-it ${i === sel ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => run(i)}>
              <Icon name={t.icon} size={15} /><span>{t.name}</span><span className="pi-sub mono">{PROTO_LABEL[t.proto]} · {t.host} · {t.group}</span>
            </button>
          ))}
        </div>
        <div className="pal-foot"><span><kbd>↑↓</kbd> Navigate</span><span><kbd>↵</kbd> Start session</span><span><kbd>ESC</kbd> Close</span></div>
      </div>
    </div>
  )
}

export default function MyConnections() {
  const { go, openDrawer } = useApp()
  const openConn = (c) => openDrawer(<ConnectionDrawer conn={{ ...c, liveDot: c.live }} onConnect={setTarget} />)
  const [q, setQ] = useState('')
  const [f, setF] = useState({ pinned: false, live: false, vaulted: false, approval: false })
  const [proto, setProto] = useState('All protocols')
  const [scope, setScope] = useState(SCOPES[0])
  const [grouped, setGrouped] = useState(true)
  const [view, setView] = useState('grid')
  const [target, setTarget] = useState(null)
  const [favs, setFavs] = useState(() => new Set(CONNS.filter((c) => c.pinned).map((c) => c.name)))
  const toggleFav = (name) => setFavs((prev) => { const n = new Set(prev); if (n.has(name)) n.delete(name); else n.add(name); return n })
  const [findOpen, setFindOpen] = useState(false)

  const now = new Date()
  const h = now.getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const first = (PROFILE.name || 'there').split(' ')[0]
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const match = (c) => {
    if (q && !(c.name + c.host + c.proto + c.group).toLowerCase().includes(q.toLowerCase())) return false
    if (f.pinned && !favs.has(c.name)) return false
    if (f.live && !c.live) return false
    if (f.vaulted && c.cred !== 'vaulted') return false
    if (f.approval && !needsApproval(c)) return false
    if (proto !== 'All protocols' && PROTO_LABEL[c.proto] !== proto) return false
    if (scope === 'Standing grants' && c.grant !== 'Standing') return false
    if (scope === 'Time-boxed / JIT-gated' && c.grant === 'Standing') return false
    return true
  }
  const rows = CONNS.filter(match)
  const groups = grouped ? GROUP_ORDER.map((g) => ({ name: g, items: rows.filter((c) => c.group === g) })).filter((g) => g.items.length) : [{ name: null, items: rows }]

  const K = {
    my: CONNS.length, live: CONNS.filter((c) => c.yours).length, vault: CONNS.filter((c) => c.cred === 'vaulted').length,
    approval: CONNS.filter(needsApproval).length, week: 4, expiring: CONNS.filter((c) => c.expiring).length,
  }
  const yoursLive = CONNS.find((c) => c.yours)
  const fbtn = (on) => on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined
  const vbtn = (on) => (view === on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined)

  const Card = ({ c }) => {
    const isFav = favs.has(c.name)
    return (
    <div className={`card conn-card${isFav ? ' fav' : ''}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => openConn(c)}>
      <div className="card-pad" style={{ paddingBottom: 12, flex: 1 }}>
        <div className="hrow" style={{ gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
          <ProtoTile icon={c.icon} proto={c.proto} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hrow" style={{ gap: 7 }}><span style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span></div>
            <div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>{PROTO_LABEL[c.proto]} · {c.host}</div>
          </div>
          <div className="hrow" style={{ gap: 4, flex: 'none' }}>
            <button className="icon-btn" title={isFav ? 'Remove from favorites' : 'Add to favorites'} onClick={(e) => { e.stopPropagation(); toggleFav(c.name) }}><StarBtn filled={isFav} /></button>
            <button className="icon-btn" title="View connection" onClick={(e) => { e.stopPropagation(); openConn(c) }}><Icon name="eye" size={15} /></button>
          </div>
        </div>
        <div className="hrow" style={{ gap: 6, flexWrap: 'wrap' }}>
          <Chip label={c.env} color={c.env === 'PROD' ? '#9A7B1A' : 'var(--mut)'} bg={c.env === 'PROD' ? 'var(--warn-bg)' : 'var(--surface-2)'} />
          {c.cred === 'vaulted'
            ? <Chip icon="unlock" label="Vaulted" color="var(--accent)" bg="transparent" border="1px solid var(--accent-line)" />
            : <Chip icon="lock" label="Direct cred" color="var(--warn-core)" bg="transparent" border="1px solid rgba(224,150,0,.4)" />}
          {grantChip(c)}
          {c.expiring && <Chip icon="clock" label={c.expiring} color="var(--bad)" bg="var(--bad-bg)" />}
          {c.other && <Chip icon="user" label={`${c.other} in session`} color="var(--warn-core)" bg="var(--warn-bg)" />}
        </div>
        {c.yours && <div className="hrow" style={{ gap: 6, marginTop: 10, fontSize: '12px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />Your session · {c.time}</div>}
      </div>
      <div className="hrow" style={{ justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--hair)' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{c.used} · {c.sessions} session{c.sessions === 1 ? '' : 's'}</span>
        <button className="btn btn-pri btn-sm" onClick={(e) => { e.stopPropagation(); setTarget(c) }}><Icon name="play" size={12} />Connect</button>
      </div>
    </div>
    )
  }

  return (
    <>
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{greet}, {first}</div>
          <div className="hrow" style={{ gap: 8, fontSize: '12.5px', color: 'var(--mut)', marginTop: 4, flexWrap: 'wrap' }}>
            <span>{dateStr}</span><span>·</span><span>Last sign-in Yesterday, 23:26 from <span className="mono">10.20.4.11</span></span><span>·</span>
            <span className="hrow" style={{ gap: 5, color: 'var(--ok)', fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />FIDO2 verified</span>
          </div>
        </div>
        <div className="hrow" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sec" onClick={() => go('sessions')}><Icon name="sessions" />Active sessions</button>
          <button className="btn btn-sec" onClick={() => go('recordings')}><Icon name="recordings" />My history</button>
          <button className="btn btn-sec" onClick={() => go('change-management')}><Icon name="edit" />Change requests</button>
          <button className="btn btn-pri" onClick={() => setFindOpen(true)}><Icon name="search" />Find a target</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
        <KpiTile label="My connections" icon="link" val={K.my} foot="of 17 in the estate" />
        <KpiTile label="Live now" icon="activity" val={K.live} foot="your sessions through the gateway" />
        <KpiTile label="Vault-secured" icon="unlock" val={K.vault} foot="credential never shown to you" />
        <KpiTile label="Needs approval" icon="lock" val={K.approval} foot="JIT or dual-control targets" />
        <KpiTile label="Used this week" icon="clock" val={K.week} foot="targets you have opened" />
        <KpiTile label="Grants expiring" icon="warnTri" val={K.expiring} foot="renew before they lapse" />
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 230 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search name, host, group…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-sec btn-sm" style={fbtn(f.pinned)} onClick={() => setF((s) => ({ ...s, pinned: !s.pinned }))}><Icon name="star" size={13} />Pinned</button>
          <button className="btn btn-sec btn-sm" style={fbtn(f.live)} onClick={() => setF((s) => ({ ...s, live: !s.live }))}><Icon name="activity" size={13} />Live</button>
          <button className="btn btn-sec btn-sm" style={fbtn(f.vaulted)} onClick={() => setF((s) => ({ ...s, vaulted: !s.vaulted }))}><Icon name="unlock" size={13} />Vaulted</button>
          <button className="btn btn-sec btn-sm" style={fbtn(f.approval)} onClick={() => setF((s) => ({ ...s, approval: !s.approval }))}><Icon name="lock" size={13} />Needs approval</button>
          <select className="sel" style={{ width: 140, height: 30 }} value={proto} onChange={(e) => setProto(e.target.value)}><option>All protocols</option>{PROTOCOLS.map((p) => <option key={p}>{PROTO_LABEL[p]}</option>)}</select>
          <div className="tb-spacer" />
          <select className="sel" style={{ width: 200, height: 30 }} value={scope} onChange={(e) => setScope(e.target.value)}>{SCOPES.map((s) => <option key={s}>{s}</option>)}</select>
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{rows.length} of {CONNS.length} targets</span>
          <button className="btn btn-sec btn-sm" style={grouped ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setGrouped((g) => !g)}><Icon name="folder" size={13} />Group</button>
          <button className="icon-btn" title="Grid view" style={vbtn('grid')} onClick={() => setView('grid')}><Icon name="grid" size={15} /></button>
          <button className="icon-btn" title="List view" style={vbtn('list')} onClick={() => setView('list')}><Icon name="list" size={15} /></button>
        </div>

        {yoursLive && (
          <div className="hrow" style={{ gap: 12, padding: '10px 16px', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}>
            <span className="hrow" style={{ gap: 7, fontSize: '12px', fontWeight: 700, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />1 LIVE · YOURS</span>
            <div className="hrow" style={{ gap: 8, padding: '4px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
              <Avatar name="Administrator" cls="av-sm" /><span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-2)' }}>Administrator@{yoursLive.name}</span><span className="mono" style={{ fontSize: '11px', color: 'var(--mut)' }}>{yoursLive.time}</span>
              <button className="mini-btn" title="Open" onClick={() => go('sessions')}><Icon name="external" size={13} /></button>
              <button className="mini-btn danger" title="Terminate" onClick={() => setTarget(null)}><Icon name="ban" size={13} /></button>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="empty" style={{ padding: '64px 20px' }}>
            <div className="e-ic"><Icon name="search" size={22} /></div><div className="e-t">No targets match</div>
            <div className="e-s">Adjust filters, or find a target across the estate.</div>
            <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
              <button className="btn btn-sec btn-sm" onClick={() => { setQ(''); setF({ pinned: false, live: false, vaulted: false, approval: false }); setProto('All protocols'); setScope(SCOPES[0]) }}><Icon name="refresh" size={13} />Clear filters</button>
              <button className="btn btn-pri btn-sm" onClick={() => setFindOpen(true)}><Icon name="search" size={13} />Find a target</button>
            </div>
          </div>
        ) : groups.map((g) => {
          const vaulted = g.items.filter((c) => c.cred === 'vaulted').length
          const live = g.items.filter((c) => c.live).length
          return (
            <div key={g.name || 'flat'}>
              {g.name && (
                <div className="hrow" style={{ justifyContent: 'space-between', padding: '9px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hair)' }}>
                  <span className="hrow" style={{ gap: 8 }}><Icon name="folder" size={14} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink-2)' }}>{g.name}</span></span>
                  <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{g.items.length} targets · {vaulted} vaulted{live ? ` · ${live} live` : ''}</span>
                </div>
              )}
              {view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16, padding: 16 }}>{g.items.map((c) => <Card key={c.name} c={c} />)}</div>
              ) : (
                g.items.map((c) => (
                  <div key={c.name} onClick={() => openConn(c)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 130px', alignItems: 'center', gap: 14, padding: '11px 16px', borderBottom: '1px solid var(--hair)', cursor: 'pointer' }}>
                    <div className="hrow" style={{ gap: 12, minWidth: 0 }}>
                      <ProtoTile icon={c.icon} proto={c.proto} size={30} />
                      {favs.has(c.name) && <Star />}
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{c.name}</span>
                      {c.live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', flex: 'none' }} />}
                      <span className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{PROTO_LABEL[c.proto]} · {c.host}</span>
                    </div>
                    <div className="hrow" style={{ gap: 6 }}><Chip label={c.env} color={c.env === 'PROD' ? '#9A7B1A' : 'var(--mut)'} bg={c.env === 'PROD' ? 'var(--warn-bg)' : 'var(--surface-2)'} />{grantChip(c)}</div>
                    <button className="btn btn-pri btn-sm" style={{ justifySelf: 'end' }} onClick={(e) => { e.stopPropagation(); setTarget(c) }}><Icon name="play" size={12} />Connect</button>
                  </div>
                ))
              )}
            </div>
          )
        })}

        <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
          <Icon name="shieldCheck" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Every session from this page is proxied, recorded and evaluated against command policy — nothing here connects you directly.
        </div>
      </div>

      {target && <StartSessionModal target={target} onClose={() => setTarget(null)} />}
      {findOpen && <FindTarget onPick={(t) => setTarget(t)} onClose={() => setFindOpen(false)} />}
    </>
  )
}
