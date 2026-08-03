import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ProtoMark from '../components/ProtoMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SCHEMAS, ATTRIBUTES, SECTION_ICONS, PROTO_META, PROTO_GROUPS, TIMEZONES, isOpenByDefault, titleize, categoryOf } from '../data/protocolSchema.js'

const LOCATIONS = ['ROOT (No parent group)', 'TANFLOW CORE', 'BTS LAB', 'LOCAL TOOLS']
const GUI_CLIENTS = PROTO_GROUPS[2].items
const up = (s) => s.toUpperCase()
const optNorm = (o) => (typeof o === 'string' ? { v: o, l: o } : { v: o[0], l: o[1] })

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
  const label = <label>{up(f.label)}{req && <span style={{ color: 'var(--bad)' }}> *</span>}</label>
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

const Grid = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px 18px', alignItems: 'start' }}>{children}</div>
const Head = ({ icon, title, right }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, margin: '22px 0 12px' }}>
    <div className="hrow" style={{ gap: 8 }}><Icon name={icon} size={15} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</span></div>
    {right}
  </div>
)

// Renders a section's field grid (respecting dependsOn) or a custom section.
function Section({ sec, vals, set, suppressUsername }) {
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
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 2 }}>
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

function Accordion({ sections, vals, set, suppressUsername }) {
  const [open, setOpen] = useState(() => new Set(sections.filter((s) => isOpenByDefault(s.key)).map((s) => s.key)))
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  return (
    <>
      <Head icon="sliders" title="Protocol Parameters" right={
        <div className="hrow" style={{ gap: 14, fontSize: '12px', fontWeight: 600 }}>
          <span className="link" onClick={() => setOpen(new Set(sections.map((s) => s.key)))}>Expand all</span>
          <span className="link" onClick={() => setOpen(new Set())}>Collapse all</span>
        </div>
      } />
      {sections.map((sec) => {
        const isOpen = open.has(sec.key)
        return (
          <div key={sec.key} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 10, overflow: 'hidden' }}>
            <button onClick={() => toggle(sec.key)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'var(--surface-2)', cursor: 'pointer' }}>
              <span className="hrow" style={{ gap: 9 }}><Icon name={SECTION_ICONS[sec.key] || 'folder'} size={15} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{titleize(sec.key)}</span><span className="tag tag-acc">{sectionCount(sec)}</span></span>
              <Icon name="chevD" size={16} style={{ color: 'var(--mut)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
            </button>
            {isOpen && <div style={{ padding: 16, borderTop: '1px solid var(--hair)' }}><Section sec={sec} vals={vals} set={set} suppressUsername={suppressUsername} /></div>}
          </div>
        )
      })}
    </>
  )
}

const Toggle = ({ on, set, label, help }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 7 }}>{label}</div>
    <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
      <span className={`toggle ${on ? 'on' : ''}`} onClick={set} />
      <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{titleize(label)}</span>
        {help && <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{help}</span>}</span>
    </label>
  </div>
)

export default function CreateConnection() {
  const { go, toast } = useApp()
  const { protocol } = useParams()
  const cat = categoryOf(protocol)
  const schema = SCHEMAS[protocol]
  const [tab, setTab] = useState('config')
  const [vals, setVals] = useState({})
  const [name, setName] = useState('')
  const [location, setLocation] = useState(LOCATIONS[0])
  const [vault, setVault] = useState(false)
  const [client, setClient] = useState(cat === 'C' ? protocol : GUI_CLIENTS[0])
  const [flags, setFlags] = useState({ reset: false, record: false, url: '' })
  const set = (id, v) => setVals((p) => ({ ...p, [id]: v }))
  const meta = PROTO_META[protocol]
  if (!meta) return <Navigate to="/select-protocol" replace />

  const create = () => {
    if (!name.trim()) { toast('bad', 'Missing name', 'Connection name is required.'); return }
    toast('ok', 'Connection created', `${name} (${meta.name}) registered behind the gateway (demo).`)
    go('connections')
  }

  const Header = ({ icon, title }) => (
    <div className="hrow" style={{ gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
      <button className="btn btn-sec btn-sm" onClick={() => go('select-protocol')} style={{ marginTop: 2 }}><Icon name="arrowLeft" size={15} />Back</button>
      <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={21} style={{ color: 'var(--accent)' }} /></span>
      <div><div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 2 }}>Configure a new target for users to connect to.</div></div>
    </div>
  )
  const Footer = () => (
    <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16, padding: '13px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-sm)' }}>
      <button className="btn btn-sec" onClick={() => go('connections')}>Cancel</button>
      <button className="btn btn-pri" onClick={create}><Icon name="check" />Create Connection</button>
    </div>
  )

  // ── Category C: DB GUI client ──────────────────────────────────────────────
  if (cat === 'C') return (
    <>
      <Header icon="db" title="New Connection" />
      <div className="card"><div className="card-pad">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create Database Client Connection</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
          <div className="field"><label>SELECT DATABASE CLIENT <span style={{ color: 'var(--bad)' }}>*</span></label>
            <select className="sel" value={client} onChange={(e) => setClient(e.target.value)}>{GUI_CLIENTS.map((c) => <option key={c} value={c}>{PROTO_META[c].name}</option>)}</select></div>
          <div className="field"><label>CONNECTION NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" placeholder="e.g. My MySQL Client" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>LOCATION</label><select className="sel" value={location} onChange={(e) => setLocation(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
          <Toggle label="Reset client state on disconnect" on={flags.reset} set={() => setFlags((f) => ({ ...f, reset: !f.reset }))} help="If enabled, your client opens with a fresh start on the next connection." />
          <Toggle label="Enable session recording" on={flags.record} set={() => setFlags((f) => ({ ...f, record: !f.record }))} help="If enabled, all sessions will be recorded and available for playback in the History section." />
        </div>
      </div></div>
      <Footer />
    </>
  )

  // ── Category D: Web App ────────────────────────────────────────────────────
  if (cat === 'D') return (
    <>
      <Header icon="globe" title="New Web App" />
      <div className="card"><div className="card-pad">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create Web App Connection</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
          <div className="field"><label>CONNECTION NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" placeholder="e.g. Internal Dashboard" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>LOCATION</label><select className="sel" value={location} onChange={(e) => setLocation(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
          <div className="field"><label>APPLICATION URL <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" type="url" placeholder="https://internal-app.example.com" value={flags.url} onChange={(e) => setFlags((f) => ({ ...f, url: e.target.value }))} /><div className="f-help">The URL the browser will open when the session starts.</div></div>
          <Toggle label="Reset state after disconnect" on={flags.reset} set={() => setFlags((f) => ({ ...f, reset: !f.reset }))} help="If enabled, browser session data is cleared on the next connection." />
          <Toggle label="Enable session recording" on={flags.record} set={() => setFlags((f) => ({ ...f, record: !f.record }))} help="If enabled, all sessions will be recorded and available for playback in the History section." />
        </div>
      </div></div>
      <Footer />
    </>
  )

  // ── Categories A / B: 2-tab shell ──────────────────────────────────────────
  return (
    <>
      <Header icon="link" title="New Connection" />
      <div className="tabs">
        <button className={`tab ${tab === 'config' ? 'on' : ''}`} onClick={() => setTab('config')}><Icon name="settings" size={14} />Configuration</button>
        <button className={`tab ${tab === 'attributes' ? 'on' : ''}`} onClick={() => setTab('attributes')}><Icon name="sliders" size={14} />Attributes</button>
      </div>

      <div className="card"><div className="card-pad">
        {tab === 'config' ? (
          <>
            <Head icon="link" title="Protocol" />
            <div className="field" style={{ maxWidth: 520 }}>
              <label>CONNECTION PROTOCOL <span style={{ color: 'var(--bad)' }}>*</span></label>
              <div className="hrow" style={{ gap: 10, height: 30, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
                <span style={{ display: 'inline-flex' }}><ProtoMark id={protocol} size={16} /></span>
                <span style={{ fontSize: '12.75px', color: 'var(--ink)', fontWeight: 500 }}>{up(meta.name)}</span>
              </div>
            </div>

            <Head icon="alerts" title="Connection Details" />
            <Grid>
              <div className="field"><label>CONNECTION NAME <span style={{ color: 'var(--bad)' }}>*</span></label><input className="inp" maxLength={128} placeholder="Enter connection name" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label>LOCATION</label><select className="sel" value={location} onChange={(e) => setLocation(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
            </Grid>

            <Head icon="shieldCheck" title="Security" />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 7 }}>Authentication Method</div>
            <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'center' }}>
              <span className={`toggle ${vault ? 'on' : ''}`} onClick={() => setVault((v) => !v)} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Password Vault</span>
              {vault && <span className="tag" style={{ color: 'var(--ok)', background: 'var(--ok-bg)', borderColor: 'transparent' }}>High Security</span>}
            </label>
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 6 }}>{vault ? 'Sensitive credentials will be encrypted by the system.' : 'Credentials will be stored as plain configuration parameters.'}</div>

            <Accordion sections={schema.sections} vals={vals} set={set} suppressUsername={schema.usernameOptional} />
          </>
        ) : (
          ATTRIBUTES.map((sec) => (
            <div key={sec.key} style={{ marginBottom: 6 }}>
              <Head icon={SECTION_ICONS[sec.key] || 'folder'} title={titleize(sec.key)} />
              <Section sec={sec} vals={vals} set={set} />
            </div>
          ))
        )}
      </div></div>
      <Footer />
    </>
  )
}
