import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import ImportConnections from '../components/ImportConnections.jsx'
import AdvancedFilters from '../components/AdvancedFilters.jsx'
import ConnectionDrawer from './ConnectionDrawer.jsx'
import { sessionPath } from '../lib/session.js'

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())
const PROTO_STYLE = {
  SSH: { tint: '#FDF0E1', color: '#B4690E' }, RDP: { tint: '#E8F0FF', color: '#2563EB' }, HTTPS: { tint: '#F0EAFE', color: '#7C3AED' },
  MYSQL: { tint: '#E6F5EF', color: '#0E9F6E' }, POSTGRESQL: { tint: '#E6F5EF', color: '#0E9F6E' }, ORACLE: { tint: '#E6F5EF', color: '#0E9F6E' }, 'DB CLIENT': { tint: '#EEF0F3', color: '#4B5563' },
}
const C = (name, proto, icon, host, env, cred, used, sessions, status, risk, extra = {}) => ({ name, proto, icon, host, env, cred, used, sessions, status, risk, ...extra })
const GROUPS = [
  { name: 'TANFLOW CORE', live: 1, conns: [
    C('TANFLOWAD01', 'RDP', 'sessions', '192.168.1.80', 'Prod', 'vaulted', 'Live now', 20, 'Live', 'Medium', { star: true, liveDot: true, watching: 1 }),
    C('BTSPLPAMPRODBD01', 'MYSQL', 'db', 'btsplpamprodbd01:3306', 'Prod', 'vaulted', '2 mos ago', 1, 'Idle', 'High'),
    C('Tanflow Docs Portal', 'HTTPS', 'globe', 'docs.tanflow.io', 'Prod', 'direct', '2 mos ago', 24, 'Idle', 'Low'),
    C('TANFLOWAPP01', 'SSH', 'commands', '146.56.51.196', 'Prod', 'vaulted', '21 days ago', 16, 'Idle', 'Low'),
  ] },
  { name: 'BTS LAB', live: 1, conns: [
    C('BTSPAMDEMO01', 'SSH', 'commands', '10.0.0.150', 'Demo', 'vaulted', 'Live now', 12, 'Live', 'Medium', { star: true, liveDot: true, watching: 2 }),
    C('BTSIAMRETEST01', 'SSH', 'commands', '10.0.0.107', 'Test', 'direct', '3 days ago', 4, 'Idle', 'Low'),
    C('BTSIAMRETEST02', 'SSH', 'commands', '10.0.0.156', 'Test', 'direct', '5 days ago', 2, 'Idle', 'Low'),
    C('BTSIDAMDEMO01', 'SSH', 'commands', '10.0.0.231', 'Demo', 'direct', '1 wk ago', 3, 'Idle', 'Low'),
    C('BTSIDAMDEMODB01', 'POSTGRESQL', 'db', 'btsidamdemodb01:5432', 'Demo', 'direct', '1 wk ago', 6, 'Idle', 'Medium'),
    C('BTSPAMDEMO02', 'SSH', 'commands', '10.0.0.154', 'Demo', 'direct', '2 wks ago', 5, 'Idle', 'Low'),
    C('BTSPAMDEV01', 'SSH', 'commands', '10.0.0.57', 'Dev', 'direct', '2 wks ago', 8, 'Idle', 'Low'),
    C('BTSPLVAPTBD01', 'POSTGRESQL', 'db', 'btsplvaptbd01:5432', 'Test', 'vaulted', '1 mo ago', 2, 'Idle', 'Medium'),
    C('BTSPLVAPTSRV01', 'SSH', 'commands', '80.225.251.38', 'Test', 'direct', '1 mo ago', 3, 'Unreachable', 'Low'),
    C('testconnection', 'SSH', 'commands', '10.10.10.10', 'Test', 'direct', '2 mos ago', 1, 'Unreachable', 'Low'),
    C('TESTORACLE', 'ORACLE', 'db', 'testoracle:1521', 'Test', 'direct', 'never', 0, 'Unreachable', 'High', { warn: true }),
  ] },
  { name: 'LOCAL TOOLS', live: 0, conns: [
    C('LOCALSUPPORTDB', 'POSTGRESQL', 'db', 'localhost:5432', 'Local', 'vaulted', '3 days ago', 4, 'Idle', 'Low'),
    C('PGADMIN WORKBENCH', 'DB CLIENT', 'db', 'pgadmin.tanflow.local', 'Local', 'direct', '1 wk ago', 2, 'Idle', 'Low'),
  ] },
]
const PROTO_CHIPS = [['SSH', 9, 'commands'], ['PostgreSQL', 3, 'db'], ['RDP', 1, 'sessions'], ['MySQL', 1, 'db'], ['DB Client', 1, 'db'], ['HTTPS', 1, 'globe'], ['Oracle', 1, 'db']]
const LIVE = [
  { name: 'Marcus Bennett', sess: 'root@BTSPAMDEMO01', time: '00:42:18' },
  { name: 'Tribhuwan Rao', sess: 'Administrator@TANFLOWAD01', time: '00:12:04' },
]
const EMPTY_ADV = { env: new Set(), cred: new Set(), status: new Set(), risk: new Set() }

const StatCard = ({ icon, num, label }) => (
  <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={20} style={{ color: 'var(--accent)' }} /></span>
    <div><div style={{ fontSize: 24, fontWeight: 750, color: 'var(--ink)', lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginTop: 5 }}>{label}</div></div>
  </div>
)
const Star = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="#F5A623" stroke="#F5A623" style={{ flex: 'none' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
const ProtoTile = ({ icon, proto, size = 30 }) => {
  const s = PROTO_STYLE[proto] || { tint: 'var(--surface-2)', color: 'var(--mut)' }
  return <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={Math.round(size * 0.52)} style={{ color: s.color }} /></span>
}
const CredBadge = ({ cred }) => cred === 'vaulted'
  ? <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '2px 8px' }}><Icon name="unlock" size={11} />Vaulted</span>
  : <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color: 'var(--warn-core)', border: '1px solid rgba(224,150,0,.4)', borderRadius: 999, padding: '2px 8px' }}><Icon name="lock" size={11} />Direct cred</span>

export default function Connections() {
  const { go, toast, openDrawer } = useApp()
  const [q, setQ] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [advOpen, setAdvOpen] = useState(false)
  const [view, setView] = useState('grid')
  const [fav, setFav] = useState(false)
  const [vaultedOnly, setVaultedOnly] = useState(false)
  const [adv, setAdv] = useState(EMPTY_ADV)

  const total = GROUPS.reduce((n, g) => n + g.conns.length, 0)
  const advCount = adv.env.size + adv.cred.size + adv.status.size + adv.risk.size
  const anyFilter = q || fav || vaultedOnly || advCount > 0

  const matches = (c) => {
    if (q && !(c.name + c.host + c.proto).toLowerCase().includes(q.toLowerCase())) return false
    if (fav && !c.star) return false
    if (vaultedOnly && c.cred !== 'vaulted') return false
    if (adv.env.size && !adv.env.has(c.env)) return false
    if (adv.cred.size && !adv.cred.has(c.cred === 'vaulted' ? 'Vaulted' : 'Direct credential')) return false
    if (adv.status.size && !adv.status.has(c.status)) return false
    if (adv.risk.size && !adv.risk.has(c.risk)) return false
    return true
  }
  const filtered = GROUPS.map((g) => ({ ...g, rows: g.conns.filter(matches) })).filter((g) => g.rows.length)
  const shownCount = filtered.reduce((n, g) => n + g.rows.length, 0)
  const clearAll = () => { setQ(''); setFav(false); setVaultedOnly(false); setAdv(EMPTY_ADV) }
  const openConn = (c, group) => openDrawer(<ConnectionDrawer conn={{ ...c, group: titleCase(group) }} />)

  const fbtn = (on) => on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined
  const vbtn = (on) => on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined

  const Card = ({ c, group }) => (
    <div className="card" style={{ borderLeft: c.status === 'Live' ? '3px solid var(--ok)' : undefined, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => openConn(c, group)}>
      <div className="card-pad" style={{ paddingBottom: 12, flex: 1 }}>
        <div className="hrow" style={{ gap: 12, marginBottom: 12 }}>
          <ProtoTile icon={c.icon} proto={c.proto} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hrow" style={{ gap: 7 }}>{c.star && <Star />}<span style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>{c.warn && <Icon name="warnTri" size={14} style={{ color: 'var(--bad)', flex: 'none' }} />}</div>
            <div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>{c.proto} · {c.host}</div>
          </div>
        </div>
        <div className="hrow" style={{ gap: 7, flexWrap: 'wrap' }}>
          <span className="tag">{c.env}</span>
          <CredBadge cred={c.cred} />
          {c.status === 'Live' && <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Live · {c.watching} watching</span>}
        </div>
      </div>
      <div className="hrow" style={{ justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--hair)' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{c.status === 'Live' ? 'Live now' : c.used} · {c.sessions} sessions</span>
        <button className="btn btn-pri btn-sm" onClick={(e) => { e.stopPropagation(); go(sessionPath(c)) }}><Icon name="play" size={12} />Connect</button>
      </div>
    </div>
  )

  return (
    <>
      <PageHead
        title="All Connections"
        sub="Create, organize, and manage every connection across your environment."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => setImportOpen(true)}><Icon name="upload" />Import</button>
            <button className="btn btn-sec" onClick={() => go('connection-groups')}><Icon name="folder" />Connection groups</button>
            <button className="btn btn-pri" onClick={() => go('select-protocol')}><Icon name="plus" />Create Connection</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 160px 1fr', gap: 16, marginBottom: 16 }}>
        <StatCard icon="link" num={total} label="Connections" />
        <StatCard icon="folder" num={GROUPS.length} label="Groups" />
        <StatCard icon="shieldCheck" num="7" label="Protocols" />
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PROTO_CHIPS.map(([n, ct, ic]) => (
              <span key={n} className="hrow" style={{ gap: 7, padding: '6px 11px', border: '1px solid var(--line)', borderRadius: 999, fontSize: '12.5px', color: 'var(--ink-2)' }}>
                <Icon name={ic} size={13} style={{ color: 'var(--mut)' }} />{n}<span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mut)', background: 'var(--surface-2)', borderRadius: 999, padding: '1px 7px' }}>{ct}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 250 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search name, host, owner…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-sec btn-sm" style={fbtn(fav)} onClick={() => setFav((v) => !v)}><Icon name="star" size={13} />Favorites</button>
          <button className="btn btn-sec btn-sm" style={vbtn(vaultedOnly)} onClick={() => setVaultedOnly((v) => !v)}><Icon name="lock" size={13} />Vaulted</button>
          <button className="btn btn-sec btn-sm" style={advCount ? vbtn(true) : undefined} onClick={() => setAdvOpen(true)}><Icon name="filter" size={13} />Advanced{advCount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '0 6px', marginLeft: 2 }}>{advCount}</span>}</button>
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shownCount} of {total} targets</span>
          <button className="btn btn-sec btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent-line)' }}><Icon name="folder" size={13} />Group</button>
          <button className="icon-btn" title="Settings"><Icon name="settings" size={15} /></button>
          <button className="icon-btn" title="Export"><Icon name="download" size={15} /></button>
          <button className="icon-btn" title="Grid view" style={view === 'grid' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('grid')}><Icon name="grid" size={15} /></button>
          <button className="icon-btn" title="List view" style={view === 'list' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('list')}><Icon name="list" size={15} /></button>
        </div>

        <div className="hrow" style={{ gap: 12, padding: '10px 16px', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 7, fontSize: '12px', fontWeight: 700, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />{LIVE.length} LIVE</span>
          {LIVE.map((s) => (
            <div key={s.sess} className="hrow" style={{ gap: 8, padding: '4px 10px', border: '1px solid var(--line)', borderRadius: 999 }}>
              <Avatar name={s.name} cls="av-sm" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{s.name}</span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--mut)' }}>{s.sess}</span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-2)' }}>{s.time}</span>
              <button className="mini-btn" title="Watch" onClick={() => go('sessions')}><Icon name="eye" size={13} /></button>
              <button className="mini-btn danger" title="Terminate" onClick={() => toast('warn', 'Terminate', 'Session termination requested (demo).')}><Icon name="ban" size={13} /></button>
            </div>
          ))}
        </div>

        {shownCount === 0 ? (
          <div className="empty" style={{ padding: '64px 20px' }}>
            <div className="e-ic"><Icon name="search" size={22} /></div>
            <div className="e-t">No targets match</div>
            <div className="e-s">Adjust filters, or register the target as a new connection.</div>
            <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
              <button className="btn btn-sec btn-sm" onClick={clearAll}><Icon name="refresh" size={13} />Clear filters</button>
              <button className="btn btn-pri btn-sm" onClick={() => go('select-protocol')}><Icon name="plus" size={13} />New connection</button>
            </div>
          </div>
        ) : filtered.map((g) => (
          <div key={g.name}>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '9px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hair)' }}>
              <span className="hrow" style={{ gap: 8 }}><Icon name="folder" size={14} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink-2)' }}>{g.name}</span></span>
              <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{g.conns.length} targets{g.live ? ` · ${g.live} live` : ''}</span>
            </div>
            {view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16, padding: 16 }}>
                {g.rows.map((c) => <Card key={c.name} c={c} group={g.name} />)}
              </div>
            ) : (
              g.rows.map((c) => (
                <div key={c.name} onClick={() => openConn(c, g.name)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px 230px', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid var(--hair)', cursor: 'pointer' }}>
                  <div className="hrow" style={{ gap: 12, minWidth: 0 }}>
                    <ProtoTile icon={c.icon} proto={c.proto} />
                    {c.star && <Star />}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    {c.liveDot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', flex: 'none' }} />}
                    {c.warn && <Icon name="warnTri" size={14} style={{ color: 'var(--bad)', flex: 'none' }} />}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--mut)' }}>{c.proto}</span>
                  <span className="hrow mono" style={{ gap: 7, fontSize: '12px', color: 'var(--ink-2)', justifyContent: 'flex-end' }}><Icon name="server" size={13} style={{ color: 'var(--faint)' }} />{c.host}</span>
                </div>
              ))
            )}
          </div>
        ))}

        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', flexWrap: 'wrap', borderTop: shownCount === 0 ? 'none' : '1px solid var(--hair)' }}>
          <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: 11 targets still use direct credentials — 1 is production. One click queues them for vault onboarding.</span>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Vault onboarding', '11 targets queued for vault onboarding (demo).')}><Icon name="lock" size={13} />Queue vault onboarding</button>
        </div>
      </div>

      {importOpen && <ImportConnections onClose={() => setImportOpen(false)} />}
      {advOpen && <AdvancedFilters value={adv} onApply={setAdv} onClose={() => setAdvOpen(false)} />}
    </>
  )
}
