import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { USERS } from '../data/mockData.js'

// ── small building blocks (design-system tokens only, no new global CSS) ──────
const Section = ({ title, children, first }) => (
  <div style={{ marginTop: first ? 0 : 22 }}>
    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>{title}</div>
    {children}
  </div>
)
const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>{children}</div>
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
function PasswordField({ label, placeholder, required = true }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} required={required}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input className="inp" type={show ? 'text' : 'password'} placeholder={placeholder} style={{ paddingRight: 34 }} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility"
          style={{ position: 'absolute', right: 8, display: 'inline-flex', color: 'var(--faint)' }}>
          <Icon name="eye" size={15} />
        </button>
      </div>
    </Field>
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

const COUNTRY_CODES = ['IND +91', 'US +1', 'UK +44', 'UAE +971', 'SGP +65', 'DEU +49', 'BRA +55']
const GROUPS = [{ n: 'test ug 1' }, { n: 'testing', disabled: true }]
const CONNECTIONS = ['BTSIDAMDB01', 'BTSPLAPAM01', 'BTSSAPWINPOC01', 'HRMS APPLICATION', 'MySQL', 'MYSQL WORKBENCH']

const TABS = [
  ['identity', 'user', 'Identity & Status'],
  ['groups', 'groups', 'Group Memberships'],
  ['connections', 'sso', 'Connection Access'],
]

export default function CreateUser() {
  const { go, toast } = useApp()
  const { id } = useParams()
  const editing = id ? USERS.find((u) => u.id === id) : null
  const isEdit = !!editing
  const [tab, setTab] = useState('identity')
  const [username, setUsername] = useState(editing ? editing.email.split('@')[0] : '')
  const [restrict, setRestrict] = useState({ disabled: editing ? editing.status !== 'Active' : false, expired: false, selfChange: true })
  const [groups, setGroups] = useState(() => new Set())
  const [conns, setConns] = useState(() => new Set())

  const toggle = (setter) => (key) => setter((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
  const toggleGroup = toggle(setGroups)
  const toggleConn = toggle(setConns)

  const create = () => {
    const who = username || (editing ? editing.name : 'New user')
    toast('ok', isEdit ? 'Changes saved' : 'User created', `${who} ${isEdit ? 'updated' : 'created'} — permissions and access applied (demo).`)
    go('users')
  }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('users')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead
        title={isEdit ? 'Edit User' : 'Create User'}
        sub={isEdit ? `Update ${editing.name}'s identity, permissions and access.` : 'Add a new user. Assign permissions and connection access as needed.'}
      />

      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-pad">
          {tab === 'identity' && (
            <>
              <Section title="Profile Picture" first>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 600, flex: 'none' }}>?</div>
                  <div>
                    <button className="btn btn-sec btn-sm"><Icon name="upload" />Add photo</button>
                    <div className="f-help" style={{ marginTop: 6 }}>Optional. PNG or JPG, max 5MB. Applied when the user is created. Defaults to initials.</div>
                  </div>
                </div>
              </Section>

              <div className="divider" style={{ margin: '20px 0' }} />

              <Section title="Basic Information">
                <Grid>
                  <Field label="USERNAME" required full>
                    <input className="inp" placeholder="Enter a new, unique username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </Field>
                  <PasswordField label="PASSWORD" placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'} required={!isEdit} />
                  <PasswordField label="CONFIRM PASSWORD" placeholder={isEdit ? 'Leave blank to keep current' : 'Re-enter password'} required={!isEdit} />
                </Grid>
              </Section>

              <div className="divider" style={{ margin: '20px 0' }} />

              <Section title="Profile Attributes">
                <Grid>
                  <Field label="FULL NAME"><input className="inp" defaultValue={editing?.name || ''} /></Field>
                  <Field label="EMAIL ADDRESS"><input className="inp" type="email" defaultValue={editing?.email || ''} /></Field>
                  <Field label="PHONE NUMBER" help="Select the country code and enter the local number. Used for SMS-OTP MFA — optional unless the user enrols via SMS.">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="sel" style={{ width: 'auto', flex: 'none' }}>{COUNTRY_CODES.map((c) => <option key={c}>{c}</option>)}</select>
                      <input className="inp" placeholder="9876543210" inputMode="tel" />
                    </div>
                  </Field>
                  <Field label="ORGANIZATION"><input className="inp" defaultValue={editing ? 'Meridian Global Bank' : ''} /></Field>
                  <Field label="ORGANIZATIONAL ROLE" full><input className="inp" defaultValue={editing?.title || ''} /></Field>
                </Grid>
              </Section>

              <div className="divider" style={{ margin: '20px 0' }} />

              <Section title="Restrictions">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 40px', marginBottom: 16 }}>
                  <Check label="Login Disabled" checked={restrict.disabled} onChange={(e) => setRestrict((r) => ({ ...r, disabled: e.target.checked }))} />
                  <Check label="Password Expired" checked={restrict.expired} onChange={(e) => setRestrict((r) => ({ ...r, expired: e.target.checked }))} />
                  <Check label="Allow Self Password Change" checked={restrict.selfChange} onChange={(e) => setRestrict((r) => ({ ...r, selfChange: e.target.checked }))} />
                </div>
                <Grid>
                  <Field label="ACCESS WINDOW START"><input className="inp" type="time" /></Field>
                  <Field label="ACCESS WINDOW END"><input className="inp" type="time" /></Field>
                  <Field label="ACCOUNT VALID FROM"><input className="inp" type="date" /></Field>
                  <Field label="ACCOUNT VALID UNTIL"><input className="inp" type="date" /></Field>
                </Grid>
              </Section>
            </>
          )}

          {tab === 'groups' && (
            <>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginBottom: 16 }}>Assign this user to existing user groups. Memberships grant permissions inherited from the group.</div>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }}>Available items</div>
                <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search group memberships…" /></div>
              </div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>Groups marked with a <Icon name="ban" size={13} /> icon are disabled and cannot be assigned.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {GROUPS.map((g) => (
                  <SelectItem key={g.n} label={g.n} disabled={g.disabled} selected={groups.has(g.n)} onToggle={() => toggleGroup(g.n)} />
                ))}
              </div>
            </>
          )}

          {tab === 'connections' && (
            <>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginBottom: 16 }}>Grant direct access to specific connections or groups of connections. This is in addition to any access granted via group memberships.</div>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div className="search-inp" style={{ width: 320 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search connections & groups…" /></div>
                <button className="btn btn-sec btn-sm"><Icon name="plus" />Expand All</button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Direct Connections</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {CONNECTIONS.map((c) => (
                  <SelectItem key={c} label={c} selected={conns.has(c)} onToggle={() => toggleConn(c)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-sec" onClick={() => go('users')}>Cancel</button>
        <button className="btn btn-pri" onClick={create}><Icon name="check" />{isEdit ? 'Save Changes' : 'Create User'}</button>
      </div>
    </>
  )
}
