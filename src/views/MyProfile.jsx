import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { SubLabel } from './formKit.jsx'
import { useApp } from '../context/AppContext.jsx'
import { PROFILE } from '../data/mockData.js'
import AvatarCropModal from '../components/AvatarCropModal.jsx'

// ── page-local detail ────────────────────────────────────────────────────────
const STATS = [
  ['Roles', 'roles', '1', 'ADMIN'],
  ['Group Memberships', 'groups', '3', 'across 2 sources'],
  ['Direct Connections', 'sso', '6', '4 protocols'],
  ['Active Sessions', 'sessions', '2', '1 privileged'],
  ['MFA', 'mfa', 'FIDO2', 'phishing-resistant'],
]
const GROUPS = [
  ['Security Engineering', 'Inherited permissions'],
  ['SOC Tier-2 Analysts', 'Inherited permissions'],
  ['Domain Admins', 'Inherited permissions'],
]
const RECENT_SIGNINS = [
  ['FIDO2 passkey', 'London, GB', 'Now', 'var(--ok)'],
  ['Tanflow Verify push', 'London, GB', '3 hrs ago', 'var(--ok)'],
  ['Password + Email OTP', 'London, GB', 'Yesterday', 'var(--mut)'],
]
const CONNECTIONS = [
  { name: 'BTSPAMDEMO01', proto: 'SSH', icon: 'commands' }, { name: 'TANFLOWAD01', proto: 'RDP', icon: 'sessions' },
  { name: 'BTSIDAMDEMODB01', proto: 'PostgreSQL', icon: 'db' }, { name: 'BTSPLPAMPRODBD01', proto: 'MySQL', icon: 'db' },
  { name: 'HRMS APPLICATION', proto: 'HTTPS', icon: 'globe' }, { name: 'TANFLOWAPP01', proto: 'SSH', icon: 'commands' },
]
const RESTRICTIONS = [
  { icon: 'globe', label: 'Timezone', value: PROFILE.timezone, sub: 'Active time reference' },
  { icon: 'clock', label: 'Daily Access', value: PROFILE.dailyAccess, sub: 'Allowed login window' },
  { icon: 'calendar', label: 'Valid From', value: PROFILE.validFrom, sub: 'Account activation date' },
  { icon: 'ban', label: 'Valid Until', value: PROFILE.validUntil, sub: 'Account expiration date' },
  { icon: 'adaptive', label: 'IP Restriction', value: 'None', sub: 'Allowed source ranges' },
  { icon: 'sessions', label: 'Concurrent Sessions', value: 'Unlimited', sub: 'Simultaneous live sessions' },
]
const TABS = [['roles', 'shieldCheck', 'Roles & Groups'], ['connections', 'sso', 'Connections'], ['restrictions', 'clock', 'Account Restrictions']]
const maskEmail = (e) => { const [u, d] = e.split('@'); return `${u[0]}***${u[u.length - 1]}@${d}` }

const CameraIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
  </svg>
)
const IcoTile = ({ name, size = 15, tint = 'var(--accent-bg)', color = 'var(--accent)', box = 32 }) => (
  <span style={{ width: box, height: box, borderRadius: 'var(--r-sm)', background: tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
    <Icon name={name} size={size} style={{ color }} />
  </span>
)
const RoleChip = ({ label }) => (
  <span className="hrow" style={{ gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--bad-bg)', color: 'var(--bad)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.02em' }}>
    <Icon name="shieldCheck" size={13} />{label}
  </span>
)
const InfoItem = ({ icon, value, label }) => (
  <div className="hrow" style={{ gap: 10, alignItems: 'center' }}>
    <Icon name={icon} size={17} style={{ color: 'var(--mut)', flex: 'none' }} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--mut)' }}>{label}</div>
    </div>
  </div>
)
const SecRow = ({ label, children }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
    <span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>{label}</span>
    <span className="hrow" style={{ gap: 7, fontSize: '12.75px', color: 'var(--ink)', fontWeight: 550 }}>{children}</span>
  </div>
)

// ── edit details modal ───────────────────────────────────────────────────────
const TZS = ['Server Default', 'UTC', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'America/New_York', 'Asia/Singapore']
function EditDetailsModal({ onClose }) {
  const { toast } = useApp()
  const [form, setForm] = useState({ name: PROFILE.name, email: PROFILE.email, department: 'Security Engineering', phone: PROFILE.phone, timezone: PROFILE.timezone })
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const save = () => { toast('ok', 'Profile updated', `${form.name}'s details saved (demo).`); onClose() }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 9 }}><Icon name="edit" size={17} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 16, fontWeight: 700 }}>Edit Details</span></div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
            <div className="field"><label>FULL NAME</label><input className="inp" value={form.name} onChange={set('name')} /></div>
            <div className="field"><label>USERNAME</label><input className="inp" value={`@${PROFILE.handle}`} disabled style={{ opacity: 0.6 }} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>EMAIL</label><input className="inp" value={form.email} onChange={set('email')} /></div>
            <div className="field"><label>DEPARTMENT</label><input className="inp" value={form.department} onChange={set('department')} /></div>
            <div className="field"><label>PHONE</label><input className="inp" value={form.phone} onChange={set('phone')} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>TIMEZONE</label>
              <select className="sel" value={form.timezone} onChange={set('timezone')}>{TZS.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" onClick={save}><Icon name="check" />Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── change password modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const { toast } = useApp()
  const [method, setMethod] = useState('manual')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [temp, setTemp] = useState(true)
  const reqs = [
    ['At least 8 characters', pw.length >= 8],
    ['One uppercase letter (A-Z)', /[A-Z]/.test(pw)],
    ['One lowercase letter (a-z)', /[a-z]/.test(pw)],
    ['One number (0-9)', /[0-9]/.test(pw)],
    ['One special character', /[^A-Za-z0-9]/.test(pw)],
  ]
  const valid = method === 'email' || (reqs.every((r) => r[1]) && pw === confirm)
  const submit = () => {
    toast('ok', 'Password changed', method === 'email' ? `Reset link sent to ${maskEmail(PROFILE.email)} (demo).` : 'New password set — you will be prompted at next login (demo).')
    onClose()
  }
  const optCard = (id, title, desc) => (
    <label style={{ display: 'flex', gap: 11, padding: '13px 14px', border: `1px solid ${method === id ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: method === id ? 'var(--sh-focus)' : 'none' }}>
      <input type="radio" name="pwmethod" checked={method === id} onChange={() => setMethod(id)} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
      <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{title}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{desc}</div></div>
    </label>
  )
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(540px, 96vw)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="hrow" style={{ gap: 9 }}><Icon name="unlock" size={18} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 16, fontWeight: 700 }}>Change Password — @{PROFILE.handle}</span></div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {optCard('manual', 'Set a password manually', 'You choose the password and share it with the user.')}
            {optCard('email', 'Send a reset link by email', `A reset link will be emailed to ${maskEmail(PROFILE.email)}.`)}
          </div>
          {method === 'manual' && (
            <>
              <div style={{ marginTop: 18 }}>
                <SubLabel style={{ marginBottom: 6 }}>New Password</SubLabel>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input className="inp" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} style={{ paddingRight: 34 }} placeholder="Enter a new password" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle" style={{ position: 'absolute', right: 8, color: 'var(--faint)', display: 'inline-flex' }}><Icon name="eye" size={15} /></button>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reqs.map(([label, ok]) => (
                    <div key={label} className="hrow" style={{ gap: 8, fontSize: '12px', color: ok ? 'var(--ok)' : 'var(--mut)' }}>
                      {ok ? <Icon name="check" size={13} /> : <span style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid var(--line-2)', flex: 'none' }} />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <SubLabel style={{ marginBottom: 6 }}>Confirm New Password</SubLabel>
                <input className="inp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter the new password" />
                {confirm && confirm !== pw && <div style={{ fontSize: '11.5px', color: 'var(--bad)', marginTop: 5 }}>Passwords do not match.</div>}
              </div>
              <label className="hrow" style={{ gap: 10, marginTop: 18, cursor: 'pointer' }}>
                <span className={`toggle ${temp ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setTemp((t) => !t) }} />
                <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Temporary password</span>
                  <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)' }}>The user must set their own password on next login.</span></span>
              </label>
            </>
          )}
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!valid} onClick={submit} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="unlock" />Change Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyProfile() {
  const { go, toast } = useApp()
  const [tab, setTab] = useState('roles')
  const [pwOpen, setPwOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const conns = CONNECTIONS.filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase()) || c.proto.toLowerCase().includes(filter.toLowerCase()))

  return (
    <>
      <PageHead title="My Profile" sub="Your account details, permissions, groups, and access windows." />

      {/* ── header identity card ── */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="hrow" style={{ gap: 18, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: 72, height: 72, flex: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: PROFILE.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>{PROFILE.initials}</div>
              <button className="icon-btn" title="Change photo" onClick={() => setPhotoOpen(true)}
                style={{ position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', color: '#fff', boxShadow: '0 0 0 3px var(--surface)' }}><CameraIcon /></button>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="hrow" style={{ gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.015em' }}>{PROFILE.name}</span>
                <span style={{ fontSize: '13.5px', color: 'var(--mut)' }}>@{PROFILE.handle}</span>
                <RoleChip label="ADMIN" />
                <Badge tone="ok" label="Active" />
              </div>
              <div style={{ display: 'flex', gap: 30, marginTop: 14, flexWrap: 'wrap' }}>
                <InfoItem icon="mail" value={PROFILE.email} label="Email" />
                <InfoItem icon="building" value="Security Engineering" label="Department" />
                <InfoItem icon="calendar" value="Mar 2021" label="Member since" />
                <InfoItem icon="activity" value="Now · London, GB · FIDO2" label="Last sign-in" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 'none' }}>
            <button className="btn btn-sec" onClick={() => setEditOpen(true)}><Icon name="edit" />Edit Details</button>
            <button className="btn btn-sec" style={{ color: 'var(--accent)', borderColor: 'var(--accent-line)' }} onClick={() => setPwOpen(true)}><Icon name="unlock" />Change Password</button>
          </div>
        </div>
      </div>

      {/* ── stat tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 18 }}>
        {STATS.map(([label, icon, val, foot]) => <KpiTile key={label} label={label} icon={icon} val={val} foot={foot} />)}
      </div>

      {/* ── tabs ── */}
      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── left main panel ── */}
        <div>
          {tab === 'roles' && (
            <div className="card card-pad">
              <div className="hrow" style={{ gap: 8 }}><span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Roles</span><span className="tag tag-acc">1</span></div>
              <div className="hrow" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}><RoleChip label="ADMIN" /></div>

              <div className="hrow" style={{ gap: 8, marginTop: 24 }}><Icon name="groups" size={16} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Group Memberships</span><span className="tag tag-acc">3</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                {GROUPS.map(([name, sub]) => (
                  <div key={name} className="hrow" style={{ gap: 12, padding: '13px 15px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                    <IcoTile name="groups" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'connections' && (
            <div className="card card-pad">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Direct Connections</div>
              <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 14 }}>Connections granted directly to your account</div>
              <div className="search-inp" style={{ marginBottom: 14 }}>
                <Icon name="search" size={14} />
                <input className="inp" placeholder="Filter connections by name or protocol…" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {conns.map((c) => (
                  <div key={c.name} style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }} onClick={() => go('connections')}>
                    <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                      <IcoTile name={c.icon} size={17} tint="var(--surface-2)" color="var(--ink-2)" />
                      <span className="tag" style={{ fontSize: '9.5px', letterSpacing: '.05em' }}>{c.proto}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div className="hrow" style={{ gap: 6, marginTop: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} /><span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Direct Connection</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'restrictions' && (
            <div className="card card-pad">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Account restrictions &amp; limits</div>
              <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>Access windows, validity and concurrency enforced on your account</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {RESTRICTIONS.map((r) => (
                  <div key={r.label} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 16 }}>
                    <IcoTile name={r.icon} box={34} size={16} />
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginTop: 12, letterSpacing: '-.01em' }}>{r.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mut)', marginTop: 2 }}>{r.label}</div>
                    <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 4 }}>{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── security & sign-in sidebar ── */}
        <div className="card card-pad">
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Security &amp; Sign-in</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 8 }}>Authentication and account safety</div>
          <SecRow label="Multi-factor"><Icon name="mfa" size={14} style={{ color: 'var(--accent)' }} />FIDO2 passkey</SecRow>
          <SecRow label="Password"><Badge tone="ok" label="Valid" dot={false} /></SecRow>
          <SecRow label="Last changed">34 days ago</SecRow>
          <SecRow label="Self-service change"><Badge tone="info" label="Allowed" dot={false} /></SecRow>
          <SecRow label="Timezone">Server Default</SecRow>

          <SubLabel style={{ marginTop: 18, marginBottom: 6 }}>Recent sign-ins</SubLabel>
          {RECENT_SIGNINS.map(([method, loc, time, dot]) => (
            <div key={method + time} className="hrow" style={{ gap: 10, padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flex: 'none', marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{method}</div>
                <div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{loc}</div>
              </div>
              <span style={{ fontSize: '11.25px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{time}</span>
            </div>
          ))}
        </div>
      </div>

      {photoOpen && <AvatarCropModal name={PROFILE.name} onClose={() => setPhotoOpen(false)} />}
      {editOpen && <EditDetailsModal onClose={() => setEditOpen(false)} />}
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </>
  )
}
