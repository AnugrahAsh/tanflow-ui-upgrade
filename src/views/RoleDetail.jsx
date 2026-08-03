import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { roleById } from '../data/rolesData.js'
import { USERS } from '../data/mockData.js'

const TABS = [['info', 'alerts', 'Role Information'], ['users', 'users', 'Users']]
const Label = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{children}</div>

// candidate pool for the "add members" picker — users + a couple of groups
const POOL = [
  ...USERS.slice(0, 14).map((u) => ({ key: 'u-' + u.id, name: u.name, email: u.email, username: u.email.split('@')[0], type: 'User' })),
  { key: 'g-sec', name: 'Security Engineering', username: 'security-engineering', email: '18 members', type: 'Group' },
  { key: 'g-soc', name: 'SOC Tier-2 Analysts', username: 'soc-tier-2', email: '12 members', type: 'Group' },
  { key: 'g-dba', name: 'Domain Admins', username: 'domain-admins', email: '9 members', type: 'Group' },
]

function RoleInfo({ role }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 28, marginBottom: 22 }}>
        <div><Label>Name</Label><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 6 }}>{role.name}</div></div>
        <div><Label>Description</Label><div style={{ fontSize: '13.5px', color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.55 }}>{role.desc}</div></div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Permissions</div>
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 230px 1fr', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
          {['SR.NO', 'MODULE NAME', 'WHAT THIS ALLOWS'].map((h) => <div key={h} style={{ padding: '11px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--mut)' }}>{h}</div>)}
        </div>
        {role.modules.map((m, mi) => (
          <div key={m.module + mi} style={{ display: 'grid', gridTemplateColumns: '90px 230px 1fr', borderTop: mi > 0 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: '1px solid var(--line)', color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>{mi + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderRight: '1px solid var(--line)', color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>{m.module}</div>
            <div>
              {m.allows.map((a, ai) => (
                <div key={a} style={{ padding: '13px 18px', borderBottom: ai < m.allows.length - 1 ? '1px dashed var(--line-2)' : 'none', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{a}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

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
          <Label>Users or groups</Label>
          <div style={{ position: 'relative', marginTop: 7 }}>
            <div style={{ border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 38 }}>
              {picked.map((p) => (
                <span key={p.key} className="hrow" style={{ gap: 6, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 6, padding: '3px 8px', fontSize: '12px', fontWeight: 600 }}>
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

function RoleUsers({ members, onAddClick }) {
  const [q, setQ] = useState('')
  const shown = members.filter((m) => !q || (m.name + m.username + m.email).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="card"><div className="card-pad">
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>Show <b style={{ color: 'var(--ink-2)' }}>10</b> entries</span>
        <div className="tb-spacer" />
        <div className="search-inp" style={{ width: 240 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button className="icon-btn" title="Grid"><Icon name="grid" size={15} /></button>
        <button className="icon-btn" title="Columns"><Icon name="list" size={15} /></button>
        <button className="btn btn-pri btn-sm" onClick={onAddClick}><Icon name="plus" size={13} />Add</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th style={{ width: 30 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></th><th>Username</th><th>Full name</th><th>Email</th><th>Type</th></tr></thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 0 }}>
                <div className="empty" style={{ padding: '56px 20px' }}>
                  <div className="e-ic"><Icon name="users" size={22} /></div>
                  <div className="e-t">No members yet</div>
                  <div className="e-s">No members hold this role yet.</div>
                </div>
              </td></tr>
            ) : shown.map((m) => (
              <tr key={m.username}>
                <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }} onClick={(e) => e.stopPropagation()} /></td>
                <td className="td-mono">{m.username}</td>
                <td className="td-main">{m.name}</td>
                <td className="td-mono" style={{ color: 'var(--mut)' }}>{m.email}</td>
                <td><span className="tag">{m.type || 'Local'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div></div>
  )
}

export default function RoleDetail() {
  const { go } = useApp()
  const { id } = useParams()
  const role = roleById(id)
  const [tab, setTab] = useState('info')
  const [members, setMembers] = useState(role ? role.members : [])
  const [addOpen, setAddOpen] = useState(false)
  if (!role) return <Navigate to="/roles" replace />

  return (
    <>
      <div className="hrow" style={{ gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
        <button className="btn btn-sec btn-sm" onClick={() => go('roles')} style={{ marginTop: 2 }}><Icon name="arrowLeft" size={15} />Back</button>
        <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={role.icon} size={21} style={{ color: 'var(--accent)' }} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>{role.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 2, lineHeight: 1.5 }}>{role.desc}</div>
        </div>
        <span style={{ flex: 'none', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: 4, padding: '5px 10px' }}>BUILTIN (VIEW-ONLY)</span>
      </div>

      <div className="tabs">
        {TABS.map(([tid, icon, label]) => (
          <button key={tid} className={`tab ${tab === tid ? 'on' : ''}`} onClick={() => setTab(tid)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      {tab === 'info' ? <div className="card card-pad"><RoleInfo role={role} /></div> : <RoleUsers members={members} onAddClick={() => setAddOpen(true)} />}

      {addOpen && <AddMembersModal role={role} existing={members} onAdd={(added) => setMembers((prev) => [...prev, ...added])} onClose={() => setAddOpen(false)} />}
    </>
  )
}
