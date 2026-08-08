import { useState, useMemo } from 'react'
import { useParams, useLocation, Navigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ProtoMark from '../components/ProtoMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SCHEMAS, ATTRIBUTES, SECTION_ICONS, PROTO_META, PROTO_GROUPS, TIMEZONES, isOpenByDefault, titleize, categoryOf } from '../data/protocolSchema.js'

const LOCATIONS = ['ROOT (No parent group)', 'TANFLOW CORE', 'BTS LAB', 'LOCAL TOOLS']
const GUI_CLIENTS = PROTO_GROUPS[2].items
const up = (s) => s.toUpperCase()
const optNorm = (o) => (typeof o === 'string' ? { v: o, l: o } : { v: o[0], l: o[1] })
const filled = (v) => v !== undefined && v !== null && String(v).trim() !== ''
const railLbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }

function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input className="inp" type={show ? 'text' : 'password'} value={value || ''} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 34 }} />
      <button type="button" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 8, color: 'var(--faint)', display: 'inline-flex' }}><Icon name="eye" size={15} /></button>
    </div>
  )
}

// One schema field → a .field cell.
function FieldEl({ f, val, set, suppressReq }) {
  const req = f.req && !suppressReq
  const label = (
    <label className="hrow" style={{ gap: 6, justifyContent: 'space-between' }}>
      <span>{up(f.label)}{req && <span style={{ color: 'var(--bad)' }}> *</span>}</span>
      {f.sensitive && <span className="hrow" style={{ gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: 0, textTransform: 'none', color: 'var(--faint)' }}><Icon name="lock" size={10} />Encrypted</span>}
    </label>
  )
  const help = f.help && <div className="f-help">{f.help}</div>
  const full = f.type === 'MULTILINE' || f.full
  const wrap = (ctrl) => <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>{label}{ctrl}{help}</div>

  if (f.type === 'BOOLEAN') return (
    <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>
      {label}
      <label className="hrow" style={{ gap: 10, cursor: 'pointer', height: 30, alignItems: 'center' }}>
        <span className={`toggle ${val === true ? 'on' : ''}`} onClick={() => set(f.id, val !== true)} />
        <span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>{titleize(f.label)}</span>
      </label>
      {help}
    </div>
  )
  if (f.type === 'ENUM' || f.type === 'TERMINAL_COLOR_SCHEME') return wrap(
    <select className="sel" value={val || ''} onChange={(e) => set(f.id, e.target.value)}>
      <option value="">-- Select --</option>
      {f.options.map((o) => { const { v, l } = optNorm(o); return <option key={v} value={v}>{l}</option> })}
    </select>
  )
  if (f.type === 'TIMEZONE') return wrap(
    <select className="sel" value={val || ''} onChange={(e) => set(f.id, e.target.value)}>
      <option value="">-- Select --</option>{TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  )
  if (f.type === 'MULTILINE') return wrap(
    <textarea className={`inp ${f.mono ? 'mono' : ''}`} value={val || ''} onChange={(e) => set(f.id, e.target.value)} placeholder={titleize(f.label)} rows={4} style={{ height: 'auto', padding: '9px 11px', resize: 'vertical', lineHeight: 1.5, fontSize: f.mono ? '11.5px' : '12.75px', whiteSpace: 'pre' }} />
  )
  if (f.type === 'PASSWORD') return wrap(<PwInput value={val} onChange={(e) => set(f.id, e.target.value)} placeholder={titleize(f.label)} />)
  if (f.type === 'NUMERIC') return wrap(<input className="inp" type="number" value={val ?? ''} onChange={(e) => set(f.id, e.target.value)} placeholder={f.ph || titleize(f.label)} />)
  return wrap(<input className={`inp ${f.mono ? 'mono' : ''}`} value={val || ''} onChange={(e) => set(f.id, e.target.value)} placeholder={titleize(f.label)} />)
}

// Responsive field grid — adapts column count to the available width.
const Grid = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(232px, 1fr))', gap: '16px 18px', alignItems: 'start' }}>{children}</div>

// Renders a section's field grid (respecting dependsOn) or a custom section.
function SectionBody({ sec, vals, set, suppressUsername }) {
  const visible = (f) => !f.dependsOn || vals[f.dependsOn] === true
  if (sec.custom === 'typescript') return (
    <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
      <span className={`toggle ${vals['enable-typescript'] === true ? 'on' : ''}`} onClick={() => set('enable-typescript', vals['enable-typescript'] !== true)} />
      <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Enable Typescript</span>
        <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>Logs all terminal input and output (commands and responses) to a text file for audit.</span></span>
    </label>
  )
  if (sec.custom === 'recording') {
    const on = vals['enable-recording'] === true
    return (
      <>
        <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
          <span className={`toggle ${on ? 'on' : ''}`} onClick={() => set('enable-recording', !on)} />
          <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Enable Recording</span>
            <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>Records the full session including keystrokes for later playback.</span></span>
        </label>
        {on && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 13, paddingLeft: 14, borderLeft: '2px solid var(--accent-line)' }}>
            {sec.subs.map((s) => (
              <label key={s.id} className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                <span className={`toggle ${vals[s.id] === true ? 'on' : ''}`} onClick={() => set(s.id, vals[s.id] !== true)} />
                <span><span style={{ fontSize: '12.75px', fontWeight: 600, color: 'var(--ink)' }}>{s.label}</span>
                  <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{s.help}</span></span>
              </label>
            ))}
          </div>
        )}
      </>
    )
  }
  return <Grid>{sec.fields.filter(visible).map((f) => <FieldEl key={f.id} f={f} val={vals[f.id]} set={set} suppressReq={suppressUsername && f.id === 'username'} />)}</Grid>
}

const sectionCount = (sec) => sec.custom === 'recording' ? sec.subs.length + 2 : sec.custom === 'typescript' ? 1 : sec.fields.length
const reqOf = (sec, usernameOptional) => (sec.fields || []).filter((f) => f.req && !(usernameOptional && f.id === 'username'))

// Card-style form block used for every section on the page.
function Block({ id, icon, title, sub, count, badge, open, onToggle, children }) {
  return (
    <div id={id} className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: onToggle ? 'pointer' : 'default', textAlign: 'left' }}>
        <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={16} style={{ color: 'var(--accent)' }} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="hrow" style={{ gap: 8 }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
            {count != null && <span className="tag">{count}</span>}
            {badge}
          </span>
          {sub && <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>{sub}</span>}
        </span>
        {onToggle && <Icon name="chevD" size={16} style={{ color: 'var(--mut)', flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />}
      </button>
      {open && <div style={{ padding: '16px', borderTop: '1px solid var(--hair)' }}>{children}</div>}
    </div>
  )
}

// A target can have several identities (for example, a service account and a
// break-glass account). Each set keeps its sensitive fields isolated.
function CredentialSets({ fields, sets, activeId, onSelect, onAdd, onRemove, onUpdate, usernameOptional }) {
  const active = sets.find((s) => s.id === activeId) || sets[0]
  if (!active) return null
  const sourceLabel = active.source === 'Prompt at connect' ? 'Prompt at connect' : active.source === 'Connection parameters' ? 'Connection parameters' : 'Vault-managed'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '188px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
      <div style={{ border: '1px solid var(--line)', background: 'var(--surface-2)' }}>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 8, padding: '10px 11px', borderBottom: '1px solid var(--hair)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--mut)' }}>CREDENTIAL SETS</span>
          <button className="icon-btn" title="Add credential set" onClick={onAdd}><Icon name="plus" size={15} /></button>
        </div>
        <div style={{ padding: 6, maxHeight: 280, overflowY: 'auto' }}>
          {sets.map((set, index) => {
            const selected = set.id === active.id
            return <div key={set.id} className="hrow" style={{ gap: 2, padding: '2px 0', borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent', background: selected ? 'var(--accent-bg)' : 'transparent', color: selected ? 'var(--accent)' : 'var(--ink-2)' }}>
              <button onClick={() => onSelect(set.id)} style={{ minWidth: 0, flex: 1, display: 'block', textAlign: 'left', padding: '7px 8px' }}>
                <span className="hrow" style={{ gap: 5, fontSize: '12.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{set.isDefault && <Icon name="lock" size={11} style={{ flex: 'none' }} />}{set.label || `Credential set ${index + 1}`}</span>
                <span className="mono" style={{ display: 'block', marginTop: 2, fontSize: '10.5px', color: selected ? 'var(--accent)' : 'var(--mut)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{set.values.username || sourceLabel}</span>
              </button>
              {!set.isDefault && <button className="mini-btn danger" title={`Delete ${set.label || `credential set ${index + 1}`}`} aria-label={`Delete ${set.label || `credential set ${index + 1}`}`} onClick={() => onRemove(set.id)}><Icon name="trash" size={13} /></button>}
            </div>
          })}
        </div>
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--hair)', fontSize: '11px', color: 'var(--mut)', lineHeight: 1.45 }}>Choose which privileged identity is injected when this connection starts.</div>
      </div>

      <div>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{active.label || 'Untitled credential set'}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>Credentials are encrypted separately and can be rotated without changing the target.</div></div>
        </div>
        <Grid>
          <div className="field"><label>SET NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" value={active.label} onChange={(e) => onUpdate(active.id, 'label', e.target.value)} placeholder="e.g. Primary administrator" /></div>
          <div className="field"><label>CREDENTIAL SOURCE</label><select className="sel" value={active.source} onChange={(e) => onUpdate(active.id, 'source', e.target.value)}><option>Vault-managed</option><option>Connection parameters</option><option>Prompt at connect</option></select><div className="f-help">{active.source === 'Vault-managed' ? 'Secrets are retrieved only when the gateway starts a session.' : active.source === 'Prompt at connect' ? 'The approved user enters the secret when launching a session.' : 'Store this set with the connection configuration.'}</div></div>
          {fields.map((f) => <FieldEl key={f.id} f={f} val={active.values[f.id]} set={(_, value) => onUpdate(active.id, f.id, value)} suppressReq={usernameOptional && f.id === 'username'} />)}
        </Grid>
      </div>
    </div>
  )
}

export default function CreateConnection() {
  const { go, toast } = useApp()
  const { protocol } = useParams()
  const loc = useLocation()
  const edit = loc.state?.edit || null
  const editing = !!edit
  const cat = categoryOf(protocol)
  const schema = SCHEMAS[protocol]
  const [tab, setTab] = useState('config')
  const [vals, setVals] = useState(() => {
    if (!editing || !edit.host) return {}
    const h = edit.host, i = h.lastIndexOf(':')
    const hostname = i > 0 ? h.slice(0, i) : h
    const port = i > 0 ? h.slice(i + 1) : ''
    const hk = cat === 'B' ? 'db-hostname' : 'hostname'
    const pk = cat === 'B' ? 'db-port' : 'port'
    const base = { [hk]: hostname }
    if (port) base[pk] = port
    return base
  })
  const [name, setName] = useState(edit?.name || '')
  const [location, setLocation] = useState(() => LOCATIONS.find((l) => l === (edit?.group || '').toUpperCase()) || LOCATIONS[0])
  const [vault, setVault] = useState(edit?.cred === 'vaulted')
  const [client, setClient] = useState(cat === 'C' ? protocol : GUI_CLIENTS[0])
  const [flags, setFlags] = useState({ reset: false, record: false, url: editing && cat === 'D' && edit.host ? `https://${edit.host}` : '' })
  const set = (id, v) => setVals((p) => ({ ...p, [id]: v }))
  const meta = PROTO_META[protocol]
  const sections = schema?.sections || []
  const authSection = sections.find((s) => s.key === 'authentication')
  const [open, setOpen] = useState(() => new Set(sections.filter((s) => isOpenByDefault(s.key)).map((s) => s.key)))
  const [openAttr, setOpenAttr] = useState(() => new Set(ATTRIBUTES.map((s) => s.key)))
  const [credentialSets, setCredentialSets] = useState(() => [{ id: 'credential-1', label: 'Primary credentials', source: 'Vault-managed', values: {}, isDefault: true }])
  const [activeCredentialSet, setActiveCredentialSet] = useState('credential-1')

  // Required-field completion includes the selected credential set.
  const reqFields = useMemo(() => sections.filter((s) => s.key !== 'authentication').flatMap((s) => reqOf(s, schema?.usernameOptional)), [sections, schema])
  const authReq = useMemo(() => authSection ? reqOf(authSection, schema?.usernameOptional) : [], [authSection, schema])
  const activeCredentials = credentialSets.find((s) => s.id === activeCredentialSet) || credentialSets[0]
  const done = (name.trim() ? 1 : 0) + reqFields.filter((f) => filled(vals[f.id])).length + authReq.filter((f) => filled(activeCredentials?.values[f.id])).length
  const total = 1 + reqFields.length + authReq.length
  const pct = Math.round((done / total) * 100)

  const addCredentialSet = () => {
    const id = `credential-${Date.now()}`
    setCredentialSets((sets) => [...sets, { id, label: `Credential set ${sets.length + 1}`, source: vault ? 'Vault-managed' : 'Connection parameters', values: {}, isDefault: false }])
    setActiveCredentialSet(id)
  }
  const updateCredentialSet = (id, field, value) => setCredentialSets((sets) => sets.map((set) => set.id === id ? (field === 'label' || field === 'source' ? { ...set, [field]: value } : { ...set, values: { ...set.values, [field]: value } }) : set))
  const removeCredentialSet = (id) => {
    if (credentialSets.find((set) => set.id === id)?.isDefault) return
    const next = credentialSets.filter((set) => set.id !== id)
    setCredentialSets(next)
    if (activeCredentialSet === id) setActiveCredentialSet(next[0].id)
  }

  if (!meta) return <Navigate to="/select-protocol" replace />

  const create = () => {
    if (!name.trim()) { toast('bad', 'Missing name', 'Connection name is required.'); return }
    toast('ok', editing ? 'Connection updated' : 'Connection created', `${name} (${meta.name}) ${editing ? 'changes saved' : 'registered behind the gateway'} (demo).`)
    go('connections')
  }
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  const toggleAttr = (k) => setOpenAttr((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  const jump = (k) => {
    if (tab === 'config') setOpen((s) => new Set([...s, k])); else setOpenAttr((s) => new Set([...s, k]))
    setTimeout(() => document.getElementById(`sec-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  const title = editing ? 'Edit Connection' : cat === 'D' ? 'New Web App' : cat === 'C' ? 'New Database Client' : 'New Connection'

  /* ── sticky action bar ──────────────────────────────────────────────────── */
  const actionBar = (
    <div className="card" style={{ position: 'sticky', top: 0, zIndex: 6, marginBottom: 16, boxShadow: 'var(--sh)' }}>
      <div className="hrow" style={{ gap: 14, padding: '12px 16px', flexWrap: 'wrap' }}>
        <button className="icon-btn" title="Back" onClick={() => go(editing ? 'connections' : 'select-protocol')}><Icon name="arrowLeft" size={16} /></button>
        <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><ProtoMark id={protocol} size={20} /></span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="hrow" style={{ gap: 9, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{title}</span>
            <span className="tag tag-acc">{up(meta.name)}</span>
            {editing && <span className="tag">Editing</span>}
          </div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>{editing ? 'Update this connection’s configuration.' : 'Configure a new target for users to connect to.'}</div>
        </div>
        {cat !== 'C' && cat !== 'D' && (
          <div style={{ flex: 'none', minWidth: 150 }}>
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, fontSize: '11.25px', color: 'var(--mut)', marginBottom: 5 }}><span>Required fields</span><span style={{ fontWeight: 700, color: done === total ? 'var(--ok)' : 'var(--ink-2)' }}>{done}/{total}</span></div>
            <div className={`meter ${done === total ? 'm-ok' : ''}`}><i style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        <div className="hrow" style={{ gap: 8, flex: 'none' }}>
          <button className="btn btn-sec" onClick={() => go('connections')}>Cancel</button>
          <button className="btn btn-pri" onClick={create}><Icon name="check" />{editing ? 'Save changes' : 'Create Connection'}</button>
        </div>
      </div>
    </div>
  )

  /* ── right rail: summary ───────────────────────────────────────────────── */
  const summaryRows = [
    ['Protocol', up(meta.name)],
    ['Name', name.trim() || <span style={{ color: 'var(--faint)' }}>Not set</span>],
    ['Location', location.replace(' (No parent group)', '')],
    ...(cat === 'A' || cat === 'B' ? [['Credentials', authSection ? `${credentialSets.length} credential set${credentialSets.length === 1 ? '' : 's'}` : (vault ? 'Password Vault' : 'Plain parameters')]] : []),
    ...(cat === 'C' ? [['Client', PROTO_META[client]?.name || client]] : []),
    ...(cat === 'D' ? [['URL', flags.url.trim() || <span style={{ color: 'var(--faint)' }}>Not set</span>]] : []),
  ]
  const summaryCard = (
    <div className="card">
      <div className="card-pad">
        <div style={{ ...railLbl, marginBottom: 10 }}>Summary</div>
        {summaryRows.map(([k, v]) => (
          <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>{k}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
          </div>
        ))}
        <div className="hrow" style={{ gap: 9, alignItems: 'flex-start', marginTop: 14, padding: '11px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="shieldCheck" size={14} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: '11.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>Every session through this target is proxied by the gateway and evaluated against command policy.</div>
        </div>
      </div>
    </div>
  )

  /* ── categories C / D: single-column form + summary rail ────────────────── */
  if (cat === 'C' || cat === 'D') {
    const isWeb = cat === 'D'
    return (
      <>
        {actionBar}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 272px', gap: 16, alignItems: 'start' }}>
          <div>
            <Block id="sec-essentials" icon="alerts" title="Essentials" sub="How this target is identified in the console" open>
              <Grid>
                {!isWeb && (
                  <div className="field"><label>DATABASE CLIENT <span style={{ color: 'var(--bad)' }}>*</span></label>
                    <select className="sel" value={client} onChange={(e) => setClient(e.target.value)}>{GUI_CLIENTS.map((c) => <option key={c} value={c}>{PROTO_META[c].name}</option>)}</select></div>
                )}
                <div className="field"><label>CONNECTION NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" placeholder={isWeb ? 'e.g. Internal Dashboard' : 'e.g. My MySQL Client'} value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="field"><label>LOCATION</label><select className="sel" value={location} onChange={(e) => setLocation(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
                {isWeb && (
                  <div className="field" style={{ gridColumn: '1 / -1' }}><label>APPLICATION URL <span style={{ color: 'var(--bad)' }}>*</span></label>
                    <input className="inp" type="url" placeholder="https://internal-app.example.com" value={flags.url} onChange={(e) => setFlags((f) => ({ ...f, url: e.target.value }))} />
                    <div className="f-help">The URL the browser will open when the session starts.</div></div>
                )}
              </Grid>
            </Block>

            <Block id="sec-session" icon="recordings" title="Session behaviour" sub="What happens during and after a session" open>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <span className={`toggle ${flags.reset ? 'on' : ''}`} onClick={() => setFlags((f) => ({ ...f, reset: !f.reset }))} />
                  <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{isWeb ? 'Reset state after disconnect' : 'Reset client state on disconnect'}</span>
                    <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{isWeb ? 'Browser session data is cleared on the next connection.' : 'Your client opens with a fresh start on the next connection.'}</span></span>
                </label>
                <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <span className={`toggle ${flags.record ? 'on' : ''}`} onClick={() => setFlags((f) => ({ ...f, record: !f.record }))} />
                  <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Enable session recording</span>
                    <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>All sessions are recorded and available for playback in the History section.</span></span>
                </label>
              </div>
            </Block>
          </div>
          <div style={{ position: 'sticky', top: 86 }}>{summaryCard}</div>
        </div>
      </>
    )
  }

  /* ── categories A / B: rail + sectioned form ────────────────────────────── */
  const railSections = tab === 'config' ? sections : ATTRIBUTES
  const openSet = tab === 'config' ? open : openAttr

  return (
    <>
      {actionBar}
      <div style={{ display: 'grid', gridTemplateColumns: '228px minmax(0,1fr) 272px', gap: 16, alignItems: 'start' }}>

        {/* left rail — section navigation */}
        <div className="card" style={{ position: 'sticky', top: 86 }}>
          <div className="card-pad" style={{ paddingBottom: 10 }}>
            <div style={railLbl}>Sections</div>
          </div>
          <div style={{ paddingBottom: 8 }}>
            {tab === 'config' && (
              <button onClick={() => jump('essentials')} className="hrow" style={{ width: '100%', gap: 10, padding: '8px 14px', fontSize: '12.75px', fontWeight: 600, color: 'var(--ink-2)', textAlign: 'left' }}>
                <Icon name="alerts" size={14} style={{ color: 'var(--mut)', flex: 'none' }} /><span style={{ flex: 1 }}>Essentials</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: name.trim() ? 'var(--ok)' : 'var(--line-2)', flex: 'none' }} />
              </button>
            )}
            {railSections.map((sec) => {
              const req = reqOf(sec, schema.usernameOptional)
              const isAuth = sec.key === 'authentication'
              const ok = req.length > 0 && req.every((f) => filled((isAuth ? activeCredentials?.values : vals)[f.id]))
              return (
                <button key={sec.key} onClick={() => jump(sec.key)} className="hrow" style={{ width: '100%', gap: 10, padding: '8px 14px', fontSize: '12.75px', fontWeight: openSet.has(sec.key) ? 600 : 500, color: openSet.has(sec.key) ? 'var(--ink)' : 'var(--ink-2)', textAlign: 'left' }}>
                  <Icon name={SECTION_ICONS[sec.key] || 'folder'} size={14} style={{ color: 'var(--mut)', flex: 'none' }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isAuth ? 'Credential sets' : titleize(sec.key)}</span>
                  {req.length > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? 'var(--ok)' : 'var(--warn-core)', flex: 'none' }} />}
                </button>
              )
            })}
          </div>
          <div className="hrow" style={{ gap: 12, padding: '10px 14px', borderTop: '1px solid var(--hair)', fontSize: '11.75px', fontWeight: 600 }}>
            <span className="link" onClick={() => (tab === 'config' ? setOpen(new Set(sections.map((s) => s.key))) : setOpenAttr(new Set(ATTRIBUTES.map((s) => s.key))))}>Expand all</span>
            <span className="link" onClick={() => (tab === 'config' ? setOpen(new Set()) : setOpenAttr(new Set()))}>Collapse all</span>
          </div>
        </div>

        {/* main form column */}
        <div>
          <div className="tabs" style={{ marginBottom: 14 }}>
            <button className={`tab ${tab === 'config' ? 'on' : ''}`} onClick={() => setTab('config')}><Icon name="settings" size={14} />Configuration</button>
            <button className={`tab ${tab === 'attributes' ? 'on' : ''}`} onClick={() => setTab('attributes')}><Icon name="sliders" size={14} />Attributes</button>
          </div>

          {tab === 'config' ? (
            <>
              <Block id="sec-essentials" icon="alerts" title="Essentials" sub="How this target is identified and where it lives" open
                badge={name.trim() ? undefined : <span className="tag" style={{ color: 'var(--warn)', background: 'var(--warn-bg)', borderColor: 'var(--warn-line)' }}>Name required</span>}>
                <Grid>
                  <div className="field"><label>CONNECTION NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" maxLength={128} placeholder="Enter connection name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="field"><label>LOCATION</label><select className="sel" value={location} onChange={(e) => setLocation(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
                  <div className="field">
                    <label>PROTOCOL</label>
                    <div className="hrow" style={{ gap: 9, height: 30, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
                      <ProtoMark id={protocol} size={15} />
                      <span style={{ fontSize: '12.75px', color: 'var(--ink)', fontWeight: 500, flex: 1 }}>{up(meta.name)}</span>
                      {!editing && <span className="link" style={{ fontSize: '11.5px' }} onClick={() => go('select-protocol')}>Change</span>}
                    </div>
                  </div>
                </Grid>
              </Block>

              <Block id="sec-security" icon="shieldCheck" title="Security" sub="How credentials for this target are stored" open
                badge={vault ? <span className="tag" style={{ color: 'var(--ok)', background: 'var(--ok-bg)', borderColor: 'var(--ok-line)' }}>High security</span> : undefined}>
                <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <span className={`toggle ${vault ? 'on' : ''}`} onClick={() => setVault((v) => !v)} />
                  <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Password Vault</span>
                    <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{vault ? 'Sensitive credentials are encrypted by the system and injected at connect.' : 'Credentials are stored as plain configuration parameters.'}</span></span>
                </label>
              </Block>

              <div className="hrow" style={{ gap: 8, margin: '20px 0 12px' }}>
                <Icon name="sliders" size={14} style={{ color: 'var(--mut)' }} />
                <span style={{ ...railLbl, color: 'var(--mut)' }}>Protocol parameters</span>
                <span style={{ flex: 1, height: 1, background: 'var(--hair)' }} />
              </div>

              {sections.map((sec) => {
                const req = reqOf(sec, schema.usernameOptional)
                const isAuth = sec.key === 'authentication'
                const missing = req.filter((f) => !filled((isAuth ? activeCredentials?.values : vals)[f.id])).length
                return (
                  <Block key={sec.key} id={`sec-${sec.key}`} icon={SECTION_ICONS[sec.key] || 'folder'} title={isAuth ? 'Credential sets' : titleize(sec.key)} count={isAuth ? credentialSets.length : sectionCount(sec)}
                    badge={missing > 0 ? <span className="tag" style={{ color: 'var(--warn)', background: 'var(--warn-bg)', borderColor: 'var(--warn-line)' }}>{missing} required</span> : undefined}
                    open={open.has(sec.key)} onToggle={() => toggle(sec.key)}>
                    {isAuth
                      ? <CredentialSets fields={sec.fields} sets={credentialSets} activeId={activeCredentialSet} onSelect={setActiveCredentialSet} onAdd={addCredentialSet} onRemove={removeCredentialSet} onUpdate={updateCredentialSet} usernameOptional={schema.usernameOptional} />
                      : <SectionBody sec={sec} vals={vals} set={set} suppressUsername={schema.usernameOptional} />}
                  </Block>
                )
              })}
            </>
          ) : (
            ATTRIBUTES.map((sec) => (
              <Block key={sec.key} id={`sec-${sec.key}`} icon={SECTION_ICONS[sec.key] || 'folder'} title={titleize(sec.key)} count={sectionCount(sec)}
                open={openAttr.has(sec.key)} onToggle={() => toggleAttr(sec.key)}>
                <SectionBody sec={sec} vals={vals} set={set} />
              </Block>
            ))
          )}
        </div>

        {/* right rail — live summary */}
        <div style={{ position: 'sticky', top: 86 }}>{summaryCard}</div>
      </div>
    </>
  )
}
