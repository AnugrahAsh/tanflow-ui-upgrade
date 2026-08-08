import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import ImportConnections from '../components/ImportConnections.jsx'
import AdvancedFilters from '../components/AdvancedFilters.jsx'
import ConnectionDrawer from './ConnectionDrawer.jsx'

const SOURCES = [
  ['TANFLOW CORE', 'TANFLOWAD01', 'RDP', 'sessions', '192.168.1.80', 'Prod', 'vaulted', 'Live', 'Medium', 'Live now', 20, 100, 'Platform Ops'],
  ['TANFLOW CORE', 'BTSPLPAMPRODB01', 'MYSQL', 'db', 'btsplpamprodb01:3306', 'Prod', 'vaulted', 'Idle', 'High', '2 mos ago', 1, 96, 'Data Platform'],
  ['TANFLOW CORE', 'Tanflow Docs Portal', 'HTTPS', 'globe', 'docs.tanflow.io', 'Prod', 'direct', 'Idle', 'Low', '2 mos ago', 24, 93, 'Digital Experience'],
  ['TANFLOW CORE', 'TANFLOWAPP01', 'SSH', 'commands', '146.56.51.196', 'Prod', 'vaulted', 'Idle', 'Low', '21 days ago', 16, 99, 'Platform Ops'],
  ['BTS LAB', 'BTSPAMDEMO01', 'SSH', 'commands', '10.0.0.150', 'Demo', 'vaulted', 'Live', 'Medium', 'Live now', 12, 100, 'PAM Engineering'],
  ['BTS LAB', 'BTSIAMRETEST01', 'SSH', 'commands', '10.0.0.107', 'Test', 'direct', 'Idle', 'Low', '3 days ago', 4, 94, 'IAM QA'],
  ['BTS LAB', 'BTSIAMRETEST02', 'SSH', 'commands', '10.0.0.156', 'Test', 'direct', 'Idle', 'Low', '5 days ago', 2, 92, 'IAM QA'],
  ['BTS LAB', 'BTSIDAMDEMO01', 'SSH', 'commands', '10.0.0.231', 'Demo', 'direct', 'Idle', 'Low', '1 wk ago', 3, 95, 'PAM Engineering'],
  ['BTS LAB', 'BTSIDAMDEMODB01', 'POSTGRESQL', 'db', 'btsidamdemodb01:5432', 'Demo', 'direct', 'Idle', 'Medium', '1 wk ago', 6, 96, 'Data Platform'],
  ['BTS LAB', 'BTSPAMDEMO02', 'SSH', 'commands', '10.0.0.154', 'Demo', 'direct', 'Idle', 'Low', '2 wks ago', 5, 92, 'PAM Engineering'],
  ['BTS LAB', 'BTSPAMDEV01', 'SSH', 'commands', '10.0.0.57', 'Dev', 'direct', 'Idle', 'Low', '2 wks ago', 8, 97, 'PAM Engineering'],
  ['BTS LAB', 'BTSPLVAPTBD01', 'POSTGRESQL', 'db', 'btsplvaptbd01:5432', 'Test', 'vaulted', 'Idle', 'Medium', '1 mo ago', 2, 98, 'Data Platform'],
  ['BTS LAB', 'BTSPLVAPTSRV01', 'SSH', 'commands', '80.225.251.38', 'Test', 'direct', 'Unreachable', 'Low', '1 mo ago', 3, 72, 'Security Testing'],
  ['BTS LAB', 'testconnection', 'SSH', 'commands', '10.10.10.10', 'Test', 'direct', 'Unreachable', 'Low', '2 mos ago', 1, 66, 'Security Testing'],
  ['BTS LAB', 'TESTORACLE', 'ORACLE', 'db', 'testoracle:1521', 'Test', 'direct', 'Unreachable', 'High', 'never', 0, 61, 'Data Platform'],
  ['LOCAL TOOLS', 'LOCALSUPPORTDB', 'POSTGRESQL', 'db', 'localhost:5432', 'Local', 'vaulted', 'Idle', 'Low', '3 days ago', 4, 100, 'Support'],
  ['LOCAL TOOLS', 'PGADMIN WORKBENCH', 'DB CLIENT', 'db', 'pgadmin.tanflow.local', 'Local', 'direct', 'Idle', 'Low', '1 wk ago', 2, 96, 'Support'],
]
const INITIAL = SOURCES.map(([group, name, proto, icon, host, env, cred, status, risk, used, sessions, health, owner]) => ({ group, name, proto, icon, host, env, cred, status, risk, used, sessions, health, owner, enabled: true }))
const EMPTY_ADV = { env: new Set(), cred: new Set(), status: new Set(), risk: new Set() }
const PROTO_KEY = { SSH: 'ssh', RDP: 'rdp', MYSQL: 'mysql', POSTGRESQL: 'pgsql', ORACLE: 'oracle', HTTPS: 'web-app', 'DB CLIENT': 'pgadmin' }
const PROTO_STYLE = { SSH: ['#FDF0E1', '#B4690E'], RDP: ['#E8F0FF', '#2563EB'], HTTPS: ['#F0EAFE', '#7C3AED'], MYSQL: ['#E6F5EF', '#0E9F6E'], POSTGRESQL: ['#E6F5EF', '#0E9F6E'], ORACLE: ['#FDECEC', '#C21E2E'], 'DB CLIENT': ['#EEF0F3', '#4B5563'] }
const ENVIRONMENTS = ['Prod', 'Demo', 'Test', 'Dev', 'Local']

function Protocol({ item, size = 28 }) {
  const [bg, color] = PROTO_STYLE[item.proto] || ['var(--surface-3)', 'var(--mut)']
  return <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', background: bg, borderRadius: 'var(--r-sm)', color }}><Icon name={item.icon || 'server'} size={Math.round(size * .52)} /></span>
}
function Health({ item }) {
  const tone = item.health < 80 ? 'm-bad' : item.health < 95 ? 'm-warn' : 'm-ok'
  return <div className="hrow" style={{ gap: 7, minWidth: 92 }}><div className={`meter ${tone}`} style={{ flex: 1 }}><i style={{ width: `${item.health}%` }} /></div><span className="num" style={{ width: 26, fontSize: 11, color: item.health < 80 ? 'var(--bad)' : 'var(--ink-2)' }}>{item.health}%</span></div>
}
function ScopeButton({ active, icon, label, value, onClick, tone }) {
  const color = tone === 'bad' ? 'var(--bad)' : tone === 'warn' ? 'var(--warn)' : active ? 'var(--accent)' : 'var(--ink-2)'
  return <button onClick={onClick} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: '8px 9px', textAlign: 'left', borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, background: active ? 'var(--accent-bg)' : 'transparent', color, borderRadius: 'var(--r-xs)' }}><Icon name={icon} size={14} /><span style={{ flex: 1, fontSize: 12.5, fontWeight: active ? 700 : 550 }}>{label}</span><span className="num" style={{ fontSize: 11.5, color: active ? 'var(--accent)' : 'var(--mut)' }}>{value}</span></button>
}

const buildConnectionTree = (items) => {
  const root = { key: 'root', label: 'All connections', children: [], items: [] }
  items.forEach((item) => {
    const levels = (item.group || 'Ungrouped').split(/[/>]/).map((level) => level.trim()).filter(Boolean)
    let node = root
    levels.forEach((label) => {
      const key = `${node.key}/${label}`
      let child = node.children.find((entry) => entry.key === key)
      if (!child) { child = { key, label, children: [], items: [] }; node.children.push(child) }
      node = child
    })
    node.items.push(item)
  })
  const count = (node) => { node.count = node.items.length + node.children.reduce((total, child) => total + count(child), 0); return node.count }
  count(root)
  return root
}

function ConnectionTree({ items, selected, onToggleSelected, onOpen, onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(() => new Set(buildConnectionTree(items).children.map((node) => node.key)))
  const tree = buildConnectionTree(items)
  const toggle = (key) => setOpen((current) => { const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next })
  const renderNode = (node, depth = 0) => (
    <div key={node.key}>
      <button onClick={() => toggle(node.key)} className="hrow" style={{ width: '100%', gap: 8, padding: '9px 14px 9px ' + (14 + depth * 22) + 'px', textAlign: 'left', background: depth === 0 ? 'var(--surface-2)' : 'transparent', borderBottom: '1px solid var(--hair)', color: 'var(--ink-2)' }}>
        <Icon name="chevR" size={14} style={{ color: 'var(--mut)', transform: open.has(node.key) ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flex: 'none' }} /><Icon name="folder" size={14} style={{ color: 'var(--accent)', flex: 'none' }} /><span style={{ fontSize: '12px', fontWeight: 750, letterSpacing: '.04em', flex: 1 }}>{node.label}</span><span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{node.count} connection{node.count === 1 ? '' : 's'}</span>
      </button>
      {open.has(node.key) && <>
        {node.children.map((child) => renderNode(child, depth + 1))}
        {node.items.map((item) => <div key={item.name} className="hrow" onClick={() => onOpen(item)} style={{ gap: 10, minHeight: 58, padding: '8px 14px 8px ' + (44 + depth * 22) + 'px', borderBottom: '1px solid var(--hair)', cursor: 'pointer', opacity: item.enabled ? 1 : .58 }}>
          <input aria-label={`Select ${item.name}`} type="checkbox" checked={selected.has(item.name)} onClick={(e) => e.stopPropagation()} onChange={() => onToggleSelected(item.name)} style={{ accentColor: 'var(--accent)', flex: 'none' }} />
          <Protocol item={item} size={26} />
          <div style={{ minWidth: 190, flex: 1 }}><div className="td-main">{item.name}</div><div className="mono" style={{ fontSize: 11, color: 'var(--mut)', marginTop: 2 }}>{item.proto} · {item.host}</div></div>
          <span className="tag" style={item.env === 'Prod' ? { color: 'var(--warn)', background: 'var(--warn-bg)', borderColor: 'var(--warn-line)' } : undefined}>{item.env.toUpperCase()}</span>
          <span className="tag" style={item.cred === 'vaulted' ? { color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-line)' } : undefined}>{item.cred === 'vaulted' ? 'Vaulted' : 'Direct'}</span>
          <span className="hrow" style={{ gap: 6, width: 98, fontSize: '11.5px', fontWeight: 650 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: !item.enabled ? 'var(--faint)' : item.status === 'Live' ? 'var(--ok)' : item.status === 'Unreachable' ? 'var(--bad)' : 'var(--warn-core)' }} />{item.enabled ? item.status : 'Disabled'}</span>
          <span className="td-num" style={{ width: 62, fontSize: '11.5px', color: 'var(--mut)' }}>{item.sessions} sessions</span>
          <div className="hrow" onClick={(e) => e.stopPropagation()} style={{ gap: 2 }}><button className="mini-btn" title="View configuration" onClick={() => onOpen(item)}><Icon name="eye" size={14} /></button><button className="mini-btn" title="Edit connection" onClick={() => onEdit(item)}><Icon name="edit" size={14} /></button><button className="mini-btn" title="Duplicate connection" onClick={() => onDuplicate(item)}><Icon name="copy" size={14} /></button><button className="mini-btn danger" title="Delete connection" onClick={() => onDelete(item)}><Icon name="trash" size={14} /></button></div>
        </div>)}
      </>}
    </div>
  )
  if (!items.length) return <div className="empty"><div className="e-ic"><Icon name="search" /></div><div className="e-t">No managed connections match</div><div className="e-s">Reset the current scope or remove a filter to restore the registry.</div></div>
  return <div>{tree.children.map((node) => renderNode(node))}</div>
}

export default function Connections() {
  const { go, toast, openDrawer } = useApp()
  const navigate = useNavigate()
  const [items, setItems] = useState(INITIAL)
  const [q, setQ] = useState('')
  const [scope, setScope] = useState('all')
  const [protocols, setProtocols] = useState(new Set())
  const [env, setEnv] = useState('All environments')
  const [adv, setAdv] = useState(EMPTY_ADV)
  const [advOpen, setAdvOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [deleteItem, setDeleteItem] = useState(null)

  const protocolCounts = useMemo(() => Object.entries(items.reduce((out, item) => ({ ...out, [item.proto]: (out[item.proto] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]), [items])
  const counts = { all: items.length, attention: items.filter((item) => item.health < 80 || item.status === 'Unreachable').length, vaulted: items.filter((item) => item.cred === 'vaulted').length, live: items.filter((item) => item.status === 'Live').length, disabled: items.filter((item) => !item.enabled).length }
  const visible = useMemo(() => items.filter((item) => {
    if (q && !(item.name + item.host + item.owner + item.group).toLowerCase().includes(q.toLowerCase())) return false
    if (scope === 'attention' && !(item.health < 80 || item.status === 'Unreachable')) return false
    if (scope === 'vaulted' && item.cred !== 'vaulted') return false
    if (scope === 'live' && item.status !== 'Live') return false
    if (scope === 'disabled' && item.enabled) return false
    if (protocols.size && !protocols.has(item.proto)) return false
    if (env !== 'All environments' && item.env !== env) return false
    if (adv.env.size && !adv.env.has(item.env)) return false
    if (adv.cred.size && !adv.cred.has(item.cred === 'vaulted' ? 'Vaulted' : 'Direct credential')) return false
    if (adv.status.size && !adv.status.has(item.status)) return false
    if (adv.risk.size && !adv.risk.has(item.risk)) return false
    return true
  }).sort((a, b) => a.name.localeCompare(b.name)), [items, q, scope, protocols, env, adv])
  const allSelected = visible.length > 0 && visible.every((item) => selected.has(item.name))
  const advCount = adv.env.size + adv.cred.size + adv.status.size + adv.risk.size
  // The registry detail drawer is also a valid launch point. Keep its Connect
  // action aligned with the rest of the product by using ConnectionDrawer's
  // default session-path handoff.
  const openAdmin = (item) => openDrawer(<ConnectionDrawer conn={item} />)
  const edit = (item) => navigate(`/create-connection/${PROTO_KEY[item.proto] || 'ssh'}`, { state: { edit: item } })
  const toggleProtocol = (proto) => setProtocols((current) => { const next = new Set(current); next.has(proto) ? next.delete(proto) : next.add(proto); return next })
  const toggleSelected = (name) => setSelected((current) => { const next = new Set(current); next.has(name) ? next.delete(name) : next.add(name); return next })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((item) => item.name)))
  const setEnabled = (names, enabled) => { const targets = new Set(names); setItems((current) => current.map((item) => targets.has(item.name) ? { ...item, enabled } : item)); setSelected(new Set()); toast(enabled ? 'ok' : 'warn', enabled ? 'Connections enabled' : 'Connections disabled', `${targets.size} target${targets.size === 1 ? '' : 's'} updated (demo).`) }
  const duplicate = (item) => { const copy = { ...item, name: `${item.name}-COPY`, status: 'Idle', sessions: 0, enabled: false }; setItems((current) => [copy, ...current]); toast('ok', 'Connection duplicated', `${copy.name} was created disabled for review (demo).`) }
  const remove = () => { setItems((current) => current.filter((item) => item.name !== deleteItem.name)); toast('warn', 'Connection deleted', `${deleteItem.name} was removed from the registry (demo).`); setDeleteItem(null) }
  const clear = () => { setQ(''); setScope('all'); setProtocols(new Set()); setEnv('All environments'); setAdv(EMPTY_ADV) }

  return <>
    <PageHead title="Connection Registry" sub="Administrative control plane for connection inventory, vault posture, lifecycle state and access routing." actions={<><button className="btn btn-sec" onClick={() => setImportOpen(true)}><Icon name="upload" />Import</button><button className="btn btn-sec" onClick={() => go('connection-groups')}><Icon name="folder" />Groups</button><button className="btn btn-pri" onClick={() => go('select-protocol')}><Icon name="plus" />New connection</button></>} />

    <div style={{ display: 'grid', gridTemplateColumns: '238px minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
      <aside className="card" style={{ position: 'sticky', top: 10 }}>
        <div className="card-pad" style={{ paddingBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 750, letterSpacing: '.07em', color: 'var(--faint)' }}>REGISTRY SCOPE</div></div>
        <div style={{ padding: '0 7px 9px' }}>
          <ScopeButton active={scope === 'all'} icon="link" label="All managed targets" value={counts.all} onClick={() => setScope('all')} />
          <ScopeButton active={scope === 'attention'} icon="warnTri" label="Needs attention" value={counts.attention} tone="warn" onClick={() => setScope('attention')} />
          <ScopeButton active={scope === 'vaulted'} icon="unlock" label="Vault-governed" value={counts.vaulted} onClick={() => setScope('vaulted')} />
          <ScopeButton active={scope === 'live'} icon="activity" label="Live access routes" value={counts.live} onClick={() => setScope('live')} />
          <ScopeButton active={scope === 'disabled'} icon="ban" label="Disabled targets" value={counts.disabled} tone="bad" onClick={() => setScope('disabled')} />
        </div>
        <div style={{ height: 1, background: 'var(--hair)' }} />
        <div className="card-pad" style={{ paddingBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 750, letterSpacing: '.07em', color: 'var(--faint)' }}>CONNECTOR TYPES</div></div>
        <div style={{ padding: '0 7px 10px' }}>{protocolCounts.map(([proto, count]) => { const on = protocols.has(proto); return <button key={proto} onClick={() => toggleProtocol(proto)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '7px 9px', color: on ? 'var(--accent)' : 'var(--ink-2)', background: on ? 'var(--accent-bg)' : 'transparent', borderLeft: `2px solid ${on ? 'var(--accent)' : 'transparent'}`, borderRadius: 'var(--r-xs)', textAlign: 'left' }}><Protocol item={{ proto, icon: PROTO_KEY[proto] === 'web-app' ? 'globe' : proto === 'SSH' ? 'commands' : proto === 'RDP' ? 'sessions' : 'db' }} size={20} /><span style={{ flex: 1, fontSize: 12.25, fontWeight: on ? 700 : 550 }}>{proto === 'POSTGRESQL' ? 'PostgreSQL' : proto}</span><span className="num" style={{ fontSize: 11, color: on ? 'var(--accent)' : 'var(--mut)' }}>{count}</span></button> })}</div>
        <div style={{ borderTop: '1px solid var(--hair)', padding: '10px 14px' }}><button className="link" style={{ fontSize: 12 }} onClick={clear}><Icon name="refresh" size={12} />Reset registry view</button></div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <section className="card" style={{ marginBottom: 12 }}>
          <div className="card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}><div><div style={{ fontSize: 14, fontWeight: 750 }}>Operational posture</div><div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 3 }}>Health is evaluated from the latest gateway check-in and credential policy state.</div></div><button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Health sweep queued', 'A fresh check has been requested for every managed target (demo).')}><Icon name="refresh" size={13} />Run health sweep</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
              {[[counts.all, 'Managed', 'link', 'var(--accent)'], [counts.vaulted, 'Vault-governed', 'unlock', 'var(--accent)'], [counts.attention, 'Attention required', 'warnTri', 'var(--warn)'], [counts.live, 'Live routes', 'activity', 'var(--ok)']].map(([value, label, icon, color], index) => <div key={label} style={{ padding: '12px 14px', borderRight: index < 3 ? '1px solid var(--line)' : 'none' }}><div className="hrow" style={{ gap: 6, color: 'var(--mut)', fontSize: 11.25, fontWeight: 650 }}><Icon name={icon} size={13} style={{ color }} />{label}</div><div className="num" style={{ fontSize: 22, fontWeight: 750, marginTop: 5 }}>{value}</div></div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}><div style={{ border: '1px solid var(--hair)', borderLeft: '3px solid var(--ok)', padding: '9px 11px' }}><div style={{ fontSize: 11, fontWeight: 750, letterSpacing: '.06em', color: 'var(--faint)' }}>COMPLIANT INVENTORY</div><div style={{ fontSize: 12.25, color: 'var(--ink-2)', marginTop: 4 }}>{items.filter((item) => item.health >= 95 && item.enabled).length} targets report healthy and policy-compliant.</div></div><div style={{ border: '1px solid var(--hair)', borderLeft: '3px solid var(--warn-core)', padding: '9px 11px' }}><div style={{ fontSize: 11, fontWeight: 750, letterSpacing: '.06em', color: 'var(--faint)' }}>REMEDIATION QUEUE</div><div style={{ fontSize: 12.25, color: 'var(--ink-2)', marginTop: 4 }}>{counts.attention} targets need agent or reachability review.</div></div></div>
          </div>
        </section>

        <section className="card">
          <div className="card-h"><div><div className="ch-t">Managed connections</div><div className="ch-s">Select targets for lifecycle actions, or open one to manage its configuration.</div></div><div style={{ fontSize: 12, color: 'var(--mut)' }}>{visible.length} shown</div></div>
          <div className="toolbar" style={{ flexWrap: 'wrap', borderTop: '1px solid var(--hair)' }}>
            <div className="search-inp" style={{ width: 270 }}><Icon name="search" size={14} /><input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search target, host, owner or group…" /></div>
            <select className="sel" style={{ width: 154 }} value={env} onChange={(e) => setEnv(e.target.value)}><option>All environments</option>{ENVIRONMENTS.map((item) => <option key={item}>{item}</option>)}</select>
            <button className="btn btn-sec btn-sm" style={advCount ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined} onClick={() => setAdvOpen(true)}><Icon name="filter" size={13} />Advanced{advCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent)', color: '#fff', borderRadius: 'var(--r-xs)', padding: '0 5px', marginLeft: 2 }}>{advCount}</span>}</button>
            <div className="tb-spacer" /><button className="icon-btn" title="Export current results" onClick={() => toast('ok', 'Export CSV', `${visible.length} managed connections exported (demo).`)}><Icon name="download" size={15} /></button>
          </div>
          {selected.size > 0 && <div className="hrow" style={{ gap: 9, padding: '9px 16px', background: 'var(--accent-bg)', borderTop: '1px solid var(--accent-line)', borderBottom: '1px solid var(--accent-line)', flexWrap: 'wrap' }}><span style={{ color: 'var(--accent)', fontSize: 12.5, fontWeight: 750 }}>{selected.size} selected</span><span style={{ height: 18, width: 1, background: 'var(--accent-line)' }} /><button className="btn btn-sec btn-sm" onClick={() => setEnabled([...selected], true)}><Icon name="check" size={13} />Enable</button><button className="btn btn-sec btn-sm" onClick={() => setEnabled([...selected], false)}><Icon name="ban" size={13} />Disable</button><button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Rotation queued', `Credential rotation queued for ${selected.size} targets (demo).`)}><Icon name="refresh" size={13} />Rotate credentials</button><button className="link" style={{ marginLeft: 'auto' }} onClick={() => setSelected(new Set())}>Clear selection</button></div>}
          <ConnectionTree items={visible} selected={selected} onToggleSelected={toggleSelected} onOpen={openAdmin} onEdit={edit} onDuplicate={duplicate} onDelete={setDeleteItem} />
          <div className="tbl-foot"><span><Icon name="shieldCheck" size={13} /> Inventory actions are audited and policy-checked.</span><span>{counts.live} active session routes</span></div>
        </section>
      </div>
    </div>
    {advOpen && <AdvancedFilters value={adv} onApply={setAdv} onClose={() => setAdvOpen(false)} />}
    {importOpen && <ImportConnections onClose={() => setImportOpen(false)} />}
    {deleteItem && <div className="modal-wrap show"><div className="m-scrim" onClick={() => setDeleteItem(null)} /><div className="palette" style={{ width: 460 }}><div style={{ padding: 18 }}><div className="hrow" style={{ gap: 12, alignItems: 'flex-start' }}><span style={{ width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bad-bg)', color: 'var(--bad)', borderRadius: 'var(--r-sm)' }}><Icon name="warnTri" size={18} /></span><div><div style={{ fontSize: 16, fontWeight: 700 }}>Delete {deleteItem.name}?</div><div style={{ fontSize: 12.5, color: 'var(--mut)', lineHeight: 1.5, marginTop: 4 }}>Its routing and configuration will be removed. Historical session records remain retained.</div></div></div><div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}><button className="btn btn-sec" onClick={() => setDeleteItem(null)}>Cancel</button><button className="btn btn-danger" onClick={remove}><Icon name="trash" />Delete connection</button></div></div></div></div>}
  </>
}
