import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

// ── small building blocks (design-system tokens only, no new global CSS) ──────
const Section = ({ title, children, first }) => (
  <div style={{ marginTop: first ? 0 : 22 }}>
    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>{title}</div>
    {children}
  </div>
)
const SubLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }}>{children}</div>
)
const Req = () => <span style={{ color: 'var(--bad)' }}> *</span>
function Field({ label, required, help, full, children }) {
  return (
    <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label>{label}{required && <Req />}</label>
      {children}
      {help && <div className="f-help">{help}</div>}
    </div>
  )
}
const Check = ({ label, checked, onChange, disabled }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '13px', color: disabled ? 'var(--faint)' : 'var(--ink-2)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
    {label}{disabled && <Icon name="ban" size={13} />}
  </label>
)
function SelectItem({ label, disabled, selected, onToggle }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: disabled ? 'var(--surface-2)' : 'var(--surface)', color: disabled ? 'var(--faint)' : 'var(--ink-2)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
      <input type="checkbox" checked={selected} onChange={onToggle} disabled={disabled} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
      {disabled && <Icon name="ban" size={14} />}
    </label>
  )
}
const CircleIcon = ({ minus }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />{!minus && <path d="M12 8v8" />}
  </svg>
)

const PARENT_GROUPS = [{ n: 'test ug 1' }, { n: 'testing', disabled: true }]
const CONNECTIONS = ['BTSIDAMDB01', 'BTSPLAPAM01', 'BTSSAPWINPOC01', 'HRMS APPLICATION', 'MySQL', 'MYSQL WORKBENCH']

const TABS = [
  ['details', 'roles', 'Group Details'],
  ['members', 'groups', 'Members & Hierarchy'],
  ['connections', 'sso', 'Connection Access'],
]

export default function CreateUserGroup() {
  const { go, toast } = useApp()
  const [tab, setTab] = useState('details')
  const [name, setName] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [parents, setParents] = useState(() => new Set())
  const [conns, setConns] = useState(() => new Set())

  const toggle = (setter) => (key) => setter((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
  const toggleParent = toggle(setParents)
  const toggleConn = toggle(setConns)

  const create = () => { toast('ok', 'User group created', `${name || 'New group'} created — shared permissions and access applied (demo).`); go('groups') }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('groups')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="Create User Group" sub="Create a new user group to manage shared permissions and access." />

      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-pad">
          {tab === 'details' && (
            <Section title="Group Details" first>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', alignItems: 'end' }}>
                <Field label="GROUP NAME" required>
                  <input className="inp" placeholder="Enter a unique group name" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <div style={{ height: 30, display: 'flex', alignItems: 'center' }}>
                  <Check label="Group Disabled" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
                </div>
              </div>
            </Section>
          )}

          {tab === 'members' && (
            <Section title="Parent Groups (This group is a member of)" first>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <SubLabel>Select items</SubLabel>
                <div className="search-inp" style={{ width: 320 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search…" /></div>
              </div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>Groups marked with a <Icon name="ban" size={13} /> icon are disabled.</div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 14, minHeight: 220, background: 'var(--surface-2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PARENT_GROUPS.map((g) => (
                    <SelectItem key={g.n} label={g.n} disabled={g.disabled} selected={parents.has(g.n)} onToggle={() => toggleParent(g.n)} />
                  ))}
                </div>
              </div>
              <div className="hrow" style={{ justifyContent: 'center', marginTop: 12 }}>
                <div className="pager">
                  <button className="pg-btn" disabled><Icon name="chevL" size={13} /></button>
                  <span style={{ fontSize: 12, color: 'var(--mut)', padding: '0 4px' }}>Page 1</span>
                  <button className="pg-btn" disabled><Icon name="chevR" size={13} /></button>
                </div>
              </div>
            </Section>
          )}

          {tab === 'connections' && (
            <>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginBottom: 16 }}>Grant access to specific connections or groups of connections. Members of this group inherit this access in addition to their own direct grants.</div>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div className="search-inp" style={{ width: 320 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search connections & groups…" /></div>
                <div className="hrow" style={{ gap: 8 }}>
                  <button className="btn btn-sec btn-sm"><CircleIcon minus />Collapse</button>
                  <button className="btn btn-sec btn-sm"><CircleIcon />Expand</button>
                </div>
              </div>
              <SubLabel>Direct Connections</SubLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                {CONNECTIONS.map((c) => (
                  <SelectItem key={c} label={c} selected={conns.has(c)} onToggle={() => toggleConn(c)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-sec" onClick={() => go('groups')}>Cancel</button>
        <button className="btn btn-pri" onClick={create}><Icon name="check" />Create User Group</button>
      </div>
    </>
  )
}
