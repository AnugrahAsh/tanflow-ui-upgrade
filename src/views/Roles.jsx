import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ROLES, permCount, roleNum } from '../data/rolesData.js'

const MembersCell = ({ members }) => {
  if (!members.length) return <span style={{ color: 'var(--faint)' }}>—</span>
  const shown = members.slice(0, 4)
  const extra = members.length - shown.length
  return (
    <div className="hrow" style={{ gap: 8 }}>
      <span className="av-stack">{shown.map((m) => <Avatar key={m.username} name={m.name} cls="av-sm" />)}</span>
      {extra > 0 && <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mut)', background: 'var(--surface-2)', borderRadius: 999, padding: '2px 7px' }}>+{extra}</span>}
      <span className="num" style={{ fontSize: '12.5px', color: 'var(--ink-2)', fontWeight: 550 }}>{members.length}</span>
    </div>
  )
}
const permOf = (r) => r.all ? 'All' : r.baseline ? null : permCount(r)

export default function Roles() {
  const { go } = useApp()
  const [q, setQ] = useState('')
  const rows = ROLES.filter((r) => !q || (r.name + r.desc).toLowerCase().includes(q.toLowerCase()))
  const assignments = ROLES.reduce((n, r) => n + r.members.length, 0)
  const fullAdmin = ROLES.filter((r) => r.fullAdmin).length

  return (
    <>
      <PageHead
        title="Roles"
        sub="Roles bundle API permissions. Members inherit them, controlling what they can read, create, update and delete across every resource."
        actions={<button className="btn btn-pri" onClick={() => go('create-role')}><Icon name="plus" />Create role</button>}
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Defined roles" icon="roles" val={ROLES.length} foot="0 custom" />
        <KpiTile label="Role assignments" icon="users" val={assignments} foot="across all members" />
        <KpiTile label="Full-administration roles" icon="shieldCheck" val={fullAdmin} foot="grant system.administer" />
        <KpiTile label="Roles with SoD conflicts" icon="policies" val="0" foot="no conflicting pairs" />
      </div>

      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="search-inp" style={{ width: 340, marginBottom: 4 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search roles…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Role</th><th>Type</th><th>Members</th><th className="td-right">Permissions</th><th>SoD</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {rows.map((r) => {
                const perm = permOf(r)
                const num = roleNum(r)
                return (
                  <tr key={r.id} onClick={() => go('role/' + num)}>
                    <td style={{ maxWidth: 560 }}>
                      <div className="td-main">{r.name}</div>
                      <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5 }}>{r.desc}</div>
                    </td>
                    <td><span className="tag">{r.type}</span></td>
                    <td><MembersCell members={r.members} /></td>
                    <td className="td-right">{perm === 'All' ? <span className="tag tag-acc">All</span> : perm == null ? <span style={{ color: 'var(--faint)' }}>—</span> : <span className="num" style={{ fontWeight: 600 }}>{perm}</span>}</td>
                    <td><Badge tone="ok" label="Clean" /></td>
                    <td><div className="row-actions">
                      <button className="mini-btn" title="View" onClick={(e) => { e.stopPropagation(); go('role/' + num) }}><Icon name="eye" size={14} /></button>
                      <button className="mini-btn" title="View" onClick={(e) => { e.stopPropagation(); go('role/' + num) }}><Icon name="edit" size={14} /></button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>{rows.length} of {ROLES.length} roles</span></div>
      </div>
    </>
  )
}
