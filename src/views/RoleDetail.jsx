import { useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { roleById, permCount } from '../data/rolesData.js'
import { USERS } from '../data/mockData.js'

const TABS = [['info', 'alerts', 'Role information'], ['users', 'users', 'Members'], ['activity', 'audit', 'Activity']]
const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }

// Module name → the icon already used for that area elsewhere in the console.
const MODULE_ICON = {
  Connections: 'sso', 'Connection Groups': 'folder', 'Sharing Profiles': 'share2', Users: 'users',
  'User Groups': 'groups', 'Time-Based Policies': 'calendar', 'Password Vault': 'vault', Sessions: 'sessions',
  Audit: 'audit', 'Change Management': 'edit', Roles: 'roles', Reports: 'reports', Recordings: 'recordings',
  Commands: 'commands', Secrets: 'lock', Monitor: 'eye',
}
// Classify a permission so destructive grants are visually distinct.
const VERB = [
  [/delete|terminate|revoke|remove/i, { icon: 'trash', tone: 'bad', kind: 'Destructive' }],
  [/create|add/i, { icon: 'plus', tone: 'acc', kind: 'Create' }],
  [/update|manage|assign|edit/i, { icon: 'edit', tone: 'acc', kind: 'Modify' }],
  [/read|list|view|observe|join/i, { icon: 'eye', tone: 'mut', kind: 'Read' }],
]
const classify = (a) => (VERB.find(([re]) => re.test(a)) || [null, { icon: 'check', tone: 'mut', kind: 'Other' }])[1]
const TONE = {
  acc: { c: 'var(--accent)', bg: 'var(--accent-bg)', b: 'var(--accent-line)' },
  bad: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' },
  mut: { c: 'var(--mut)', bg: 'var(--surface-2)', b: 'var(--line)' },
}

const POOL = [
  ...USERS.slice(0, 14).map((u) => ({ key: 'u-' + u.id, name: u.name, email: u.email, username: u.email.split('@')[0], type: 'User' })),
  { key: 'g-sec', name: 'Security Engineering', username: 'security-engineering', email: '18 members', type: 'Group' },
  { key: 'g-soc', name: 'SOC Tier-2 Analysts', username: 'soc-tier-2', email: '12 members', type: 'Group' },
  { key: 'g-dba', name: 'Domain Admins', username: 'domain-admins', email: '9 members', type: 'Group' },
]

const ACTIVITY = [
  ['Role assigned', 'Dev Aabhroy added by Tribhuwan Rao', '2 hrs ago', 'plus', 'acc'],
  ['Permission reviewed', 'Quarterly certification — retained in full', 'Q2 2026', 'certs', 'mut'],
  ['Role assigned', 'Chen Wei added by Tribhuwan Rao', '5 days ago', 'plus', 'acc'],
  ['Role removed', 'L. Osei removed — left the department', '2 wks ago', 'trash', 'bad'],
  ['Role created', 'Provisioned as a built-in tier', 'Mar 2021', 'shieldCheck', 'mut'],
]

/* ── Role information ────────────────────────────────────────────────────── */
function RoleInfo({ role, members, perms, destructive }) {
  const Field = ({ k, v, full }) => (
    <div style={full ? { gridColumn: '1 / -1' } : undefined}>
      <div style={lbl}>{k}</div>
      <div style={{ fontSize: '13.25px', color: 'var(--ink)', marginTop: 6, lineHeight: 1.55 }}>{v}</div>
    </div>
  )
  const modules = role.all ? 'Every module in the console' : role.modules.map((m) => m.module).join(' · ')

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-h">
        <div><div className="ch-t">Role information</div><div className="ch-s">What this role is, and how far it reaches</div></div>
      </div>
      <div className="card-pad">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px 26px' }}>
          <Field k="Role name" v={<b style={{ fontSize: '15px', fontWeight: 700 }}>{role.name}</b>} />
          <Field k="Role key" v={<span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{role.id}</span>} />
          <Field k="Tier" v={role.type} />
          <Field k="Origin" v={<span className="hrow" style={{ gap: 6 }}><Icon name="lock" size={12} style={{ color: 'var(--mut)' }} />Built-in · not editable</span>} />

          <Field k="Description" full v={<span style={{ color: 'var(--ink-2)' }}>{role.desc}</span>} />

          <Field k="Members holding it" v={members.length === 0
            ? <span style={{ color: 'var(--mut)' }}>None yet</span>
            : <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>} />
          <Field k="Modules governed" v={role.all ? 'All modules' : `${role.modules.length} of the console`} />
          <Field k="Permissions granted" v={`${perms} individual permissions`} />
          <Field k="Destructive rights" v={destructive === 0
            ? <span style={{ color: 'var(--ok)' }}>None — read and write only</span>
            : <span style={{ color: 'var(--bad)', fontWeight: 600 }}>{destructive} that delete or terminate</span>} />

          <Field k="Created" v="Mar 2021" />
          <Field k="Last certified" v="Q2 2026 · retained in full" />

          <Field k="Reach" full v={<span style={{ color: 'var(--ink-2)', fontSize: '12.75px' }}>{modules}</span>} />
        </div>

        {role.all && (
          <div className="hrow" style={{ gap: 11, alignItems: 'flex-start', marginTop: 20, padding: '13px 14px', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="warnTri" size={16} style={{ color: 'var(--bad)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              This is a full-administration role. Everyone holding it can reach every module — grant it sparingly and certify it every quarter.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Permissions ─────────────────────────────────────────────────────────── */
function Permissions({ role }) {
  const [q, setQ] = useState('')
  const [only, setOnly] = useState(null) // null | 'Destructive' | 'Create' | 'Modify' | 'Read'

  const modules = useMemo(() => role.modules
    .map((m) => ({
      ...m,
      rows: m.allows
        .map((a) => ({ text: a, ...classify(a) }))
        .filter((r) => (!only || r.kind === only) && (!q || (m.module + r.text).toLowerCase().includes(q.toLowerCase()))),
    }))
    .filter((m) => m.rows.length), [role, q, only])

  const counts = role.modules.flatMap((m) => m.allows.map(classify)).reduce((acc, c) => ({ ...acc, [c.kind]: (acc[c.kind] || 0) + 1 }), {})
  const chip = (k) => ({ background: only === k ? 'var(--accent-bg)' : 'var(--surface)', borderColor: only === k ? 'var(--accent)' : 'var(--line-2)', color: only === k ? 'var(--accent)' : 'var(--ink-2)' })

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 250 }}><Icon name="search" size={14} /><input className="inp" placeholder="Filter modules or permissions…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {['Create', 'Read', 'Modify', 'Destructive'].map((k) => counts[k] ? (
            <button key={k} className="btn btn-sec btn-sm" style={chip(k)} onClick={() => setOnly((v) => (v === k ? null : k))}>
              {k}<span style={{ fontSize: '10.5px', fontWeight: 700, opacity: .75, marginLeft: 4 }}>{counts[k]}</span>
            </button>
          ) : null)}
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{modules.length} of {role.modules.length} modules</span>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="card"><div className="empty" style={{ padding: '56px 20px' }}>
          <div className="e-ic"><Icon name="search" size={22} /></div>
          <div className="e-t">Nothing matches</div>
          <div className="e-s">No module or permission matches that filter.</div>
        </div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 14 }}>
          {modules.map((m) => (
            <div key={m.module} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="hrow" style={{ gap: 11, padding: '12px 14px', borderBottom: '1px solid var(--hair)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={MODULE_ICON[m.module] || 'folder'} size={16} style={{ color: 'var(--accent)' }} />
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{m.module}</span>
                <span className="tag">{m.rows.length}</span>
              </div>
              <div style={{ padding: '4px 14px 10px', flex: 1 }}>
                {m.rows.map((r) => {
                  const t = TONE[r.tone]
                  return (
                    <div key={r.text} className="hrow" style={{ gap: 10, padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 'var(--r-xs)', background: t.bg, border: `1px solid ${t.b}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                        <Icon name={r.icon} size={11} style={{ color: t.c }} />
                      </span>
                      <span style={{ fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.45 }}>{r.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ── Members ─────────────────────────────────────────────────────────────── */
function Members({ members, onAddClick, onRemove }) {
  const { toast } = useApp()
  const [q, setQ] = useState('')
  const shown = members.filter((m) => !q || (m.name + m.username + m.email).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="card">
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="search-inp" style={{ width: 250 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search members…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="tb-spacer" />
        <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shown.length} of {members.length} members</span>
        <button className="icon-btn" title="Export" onClick={() => toast('ok', 'Export', `${shown.length} members exported (demo).`)}><Icon name="download" size={15} /></button>
        <button className="btn btn-pri btn-sm" onClick={onAddClick}><Icon name="plus" size={13} />Add members</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Member</th><th>Username</th><th>Email</th><th>Type</th><th style={{ width: 60 }} /></tr></thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 0 }}>
                <div className="empty" style={{ padding: '56px 20px' }}>
                  <div className="e-ic"><Icon name="users" size={22} /></div>
                  <div className="e-t">{members.length ? 'No members match' : 'No members yet'}</div>
                  <div className="e-s">{members.length ? 'Try a different name or email.' : 'Nobody holds this role. Add users or groups to grant it.'}</div>
                  {!members.length && <button className="btn btn-pri btn-sm" style={{ marginTop: 14 }} onClick={onAddClick}><Icon name="plus" size={13} />Add members</button>}
                </div>
              </td></tr>
            ) : shown.map((m) => (
              <tr key={m.username}>
                <td><div className="hrow" style={{ gap: 10 }}><Avatar name={m.name} cls="av-sm" /><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{m.name}</span></div></td>
                <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{m.username}</td>
                <td className="mono" style={{ fontSize: '12px', color: 'var(--mut)' }}>{m.email}</td>
                <td><span className="tag">{m.type || 'Local'}</span></td>
                <td><div className="row-actions"><button className="mini-btn danger" title="Remove from role" onClick={() => onRemove(m)}><Icon name="trash" size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Activity ────────────────────────────────────────────────────────────── */
function Activity() {
  return (
    <div className="card">
      <div className="card-h"><div><div className="ch-t">Role activity</div><div className="ch-s">Assignments and certification events for this role</div></div></div>
      <div className="card-pad" style={{ paddingTop: 6 }}>
        {ACTIVITY.map(([title, sub, when, icon, tone], i) => {
          const t = TONE[tone]
          return (
            <div key={i} className="hrow" style={{ gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--hair)' : 'none' }}>
              <span style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: t.bg, border: `1px solid ${t.b}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name={icon} size={13} style={{ color: t.c }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 1 }}>{sub}</div>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--faint)', flex: 'none', whiteSpace: 'nowrap' }}>{when}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Add members ─────────────────────────────────────────────────────────── */
function AddMembersModal({ role, existing, onAdd, onClose }) {
  const { toast } = useApp()
  const [picked, setPicked] = useState([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const cands = POOL.filter((c) => !existing.some((m) => m.username === c.username) && !picked.some((p) => p.key === c.key) && c.name.toLowerCase().includes(q.toLowerCase()))
  const add = () => {
    onAdd(picked.map((p) => ({ name: p.name, username: p.username, email: p.email, type: p.type })))
    toast('ok', 'Members added', `${picked.length} member${picked.length === 1 ? '' : 's'} added to ${role.name} (demo).`)
    onClose()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(520px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 10 }}><Icon name={role.icon} size={18} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 16, fontWeight: 700 }}>Add members to “{role.name}”</span></div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={lbl}>Users or groups</div>
          <div style={{ position: 'relative', marginTop: 7 }}>
            <div style={{ border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 38 }}>
              {picked.map((p) => (
                <span key={p.key} className="hrow" style={{ gap: 6, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 'var(--r-xs)', padding: '3px 8px', fontSize: '12px', fontWeight: 600 }}>
                  {p.name}<button onClick={() => setPicked((a) => a.filter((x) => x.key !== p.key))} style={{ display: 'inline-flex', color: 'var(--accent)' }}><Icon name="x" size={12} /></button>
                </span>
              ))}
              <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder={picked.length ? '' : 'Search users and groups…'} style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--ink)', height: 26 }} />
              <Icon name="chevD" size={15} style={{ color: 'var(--faint)' }} />
            </div>
            {open && cands.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-lg)', maxHeight: 220, overflowY: 'auto', zIndex: 5 }}>
                {cands.map((c) => (
                  <button key={c.key} onClick={() => { setPicked((a) => [...a, c]); setQ('') }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer', textAlign: 'left' }}>
                    <span className="hrow" style={{ gap: 9, minWidth: 0 }}><Icon name={c.type === 'Group' ? 'groups' : 'user'} size={14} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span><span className="mono" style={{ fontSize: '11px', color: 'var(--mut)' }}>{c.email}</span></span>
                    <span className="tag">{c.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!picked.length} onClick={add} style={!picked.length ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="plus" />Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function RoleDetail() {
  const { go, toast } = useApp()
  const { id } = useParams()
  const role = roleById(id)
  const [tab, setTab] = useState('info')
  const [members, setMembers] = useState(role ? role.members : [])
  const [addOpen, setAddOpen] = useState(false)
  if (!role) return <Navigate to="/roles" replace />

  const perms = permCount(role)
  const destructive = role.modules.flatMap((m) => m.allows).filter((a) => classify(a).kind === 'Destructive').length
  const removeMember = (m) => {
    setMembers((prev) => prev.filter((x) => x.username !== m.username))
    toast('warn', 'Member removed', `${m.name} no longer holds ${role.name} (demo).`)
  }

  const Stat = ({ icon, val, label, tone }) => (
    <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: (TONE[tone] || TONE.acc).bg, border: `1px solid ${(TONE[tone] || TONE.acc).b}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <Icon name={icon} size={17} style={{ color: (TONE[tone] || TONE.acc).c }} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 21, fontWeight: 750, color: 'var(--ink)', lineHeight: 1 }}>{val}</div>
        <div style={{ ...lbl, marginTop: 5 }}>{label}</div>
      </div>
    </div>
  )

  const SUMMARY = [
    ['Tier', role.type],
    ['Scope', role.all ? 'All modules' : `${role.modules.length} module${role.modules.length === 1 ? '' : 's'}`],
    ['Editable', 'No — built-in role'],
    ['Last certified', 'Q2 2026 · retained in full'],
    ['Created', 'Mar 2021'],
  ]

  return (
    <>
      {/* sticky identity + actions */}
      <div className="card" style={{ position: 'sticky', top: 0, zIndex: 6, marginBottom: 16, boxShadow: 'var(--sh)' }}>
        <div className="hrow" style={{ gap: 14, padding: '12px 16px', flexWrap: 'wrap' }}>
          <button className="icon-btn" title="Back to roles" onClick={() => go('roles')}><Icon name="arrowLeft" size={16} /></button>
          <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Icon name={role.icon} size={19} style={{ color: 'var(--accent)' }} />
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="hrow" style={{ gap: 9, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{role.name}</span>
              <span className="tag">{role.type}</span>
              <span className="tag tag-acc"><Icon name="lock" size={9} />Built-in</span>
              {role.all && <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--bad)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-xs)', padding: '2px 7px' }}>FULL ADMINISTRATION</span>}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5, maxWidth: 760 }}>{role.desc}</div>
          </div>
          <div className="hrow" style={{ gap: 8, flex: 'none' }}>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Duplicate role', `Creates an editable copy of ${role.name} (demo).`)}><Icon name="copy" />Duplicate</button>
            <button className="btn btn-sec" style={{ opacity: .6, cursor: 'not-allowed' }} title="Built-in roles cannot be edited"><Icon name="edit" />Edit</button>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
        <Stat icon="users" val={members.length} label="Members" tone="acc" />
        <Stat icon="folder" val={role.all ? 'All' : role.modules.length} label="Modules governed" tone="acc" />
        <Stat icon="check" val={perms} label="Permissions granted" tone="mut" />
        <Stat icon="warnTri" val={destructive} label="Destructive rights" tone={destructive ? 'bad' : 'mut'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 288px', gap: 16, alignItems: 'start' }}>
        <div>
          <div className="tabs" style={{ marginBottom: 14 }}>
            {TABS.map(([tid, icon, label]) => (
              <button key={tid} className={`tab ${tab === tid ? 'on' : ''}`} onClick={() => setTab(tid)}>
                <Icon name={icon} size={14} />{label}
                {tid === 'users' && <span className="tag" style={{ marginLeft: 6 }}>{members.length}</span>}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <>
              <RoleInfo role={role} members={members} perms={perms} destructive={destructive} />

              <div className="hrow" style={{ gap: 10, margin: '4px 0 12px' }}>
                <Icon name="sliders" size={15} style={{ color: 'var(--mut)', flex: 'none' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Permissions</span>
                <span className="tag">{perms}</span>
                <span style={{ fontSize: '12.25px', color: 'var(--mut)' }}>everything this role is allowed to do</span>
                <span style={{ flex: 1, height: 1, background: 'var(--hair)' }} />
              </div>

              <Permissions role={role} />
            </>
          )}
          {tab === 'users' && <Members members={members} onAddClick={() => setAddOpen(true)} onRemove={removeMember} />}
          {tab === 'activity' && <Activity />}
        </div>

        {/* summary rail */}
        <div style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card card-pad">
            <div style={{ ...lbl, marginBottom: 10 }}>Role summary</div>
            {SUMMARY.map(([k, v]) => (
              <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
                <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div style={{ ...lbl, marginBottom: 10 }}>Who holds it</div>
            {members.length === 0 ? (
              <div style={{ fontSize: '12.25px', color: 'var(--mut)', lineHeight: 1.55 }}>Nobody holds this role yet.</div>
            ) : (
              <>
                <div className="hrow" style={{ gap: -6, marginBottom: 10 }}>
                  {members.slice(0, 6).map((m, i) => (
                    <span key={m.username} style={{ marginLeft: i ? -8 : 0, border: '2px solid var(--surface)', borderRadius: '50%', display: 'inline-flex' }}><Avatar name={m.name} cls="av-sm" /></span>
                  ))}
                  {members.length > 6 && <span style={{ marginLeft: -8, width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-3)', border: '2px solid var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--mut)' }}>+{members.length - 6}</span>}
                </div>
                <span className="link" style={{ fontSize: '12.25px' }} onClick={() => setTab('users')}>View all {members.length} members</span>
              </>
            )}
          </div>

          <div className="card card-pad">
            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon name="lock" size={15} style={{ color: 'var(--mut)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '11.75px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
                Built-in roles are fixed so upgrades can rely on them. Duplicate this role to create an editable copy.
              </div>
            </div>
          </div>
        </div>
      </div>

      {addOpen && <AddMembersModal role={role} existing={members} onAdd={(added) => setMembers((prev) => [...prev, ...added])} onClose={() => setAddOpen(false)} />}
    </>
  )
}
