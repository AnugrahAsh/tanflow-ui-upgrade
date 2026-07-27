import { useState, useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, Badge, RiskPill, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fmt } from '../lib/format.js'
import { USERS } from '../data/mockData.js'
import UserDrawer from './UserDrawer.jsx'

const CHIPS = [
  ['priv', 'vault', 'Privileged'],
  ['nomfa', 'mfa', 'MFA gaps'],
  ['dormant', 'clock', 'Dormant'],
]
const SEGMENTS = ['All', 'Active', 'Attention']

export default function Users() {
  const { openDrawer, toast } = useApp()
  const [q, setQ] = useState('')
  const [chip, setChip] = useState(null)
  const [seg, setSeg] = useState('All')

  const rows = useMemo(() => {
    let r = USERS
    if (q) { const query = q.toLowerCase(); r = r.filter((u) => u.name.toLowerCase().includes(query) || u.email.includes(query) || u.dept.toLowerCase().includes(query)) }
    if (chip === 'priv') r = r.filter((u) => u.priv)
    if (chip === 'nomfa') r = r.filter((u) => !u.mfa)
    if (chip === 'dormant') r = r.filter((u) => u.status === 'Dormant')
    if (seg !== 'All') r = r.filter((u) => (seg === 'Active' ? u.status === 'Active' : u.status !== 'Active'))
    return r
  }, [q, chip, seg])

  const stop = (e, fn) => { e.stopPropagation(); fn() }

  return (
    <>
      <PageHead
        title="Users"
        sub="Every workforce, partner and service identity — correlated across Active Directory, Workday, SAP and 42 connected systems."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="upload" />Import</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Create identity', 'Guided identity creation with birthright preview (demo).')}><Icon name="plus" />New identity</button>
          </>
        }
      />

      <div className="kpi-row cols-5">
        <KpiTile label="Total identities" icon="users" val="48,213" delta={1.2} foot="30-day growth" />
        <KpiTile label="Privileged" icon="vault" val="3,842" foot="8% of directory" />
        <KpiTile label="Service accounts" icon="server" val="6,120" foot="1,204 vaulted" />
        <KpiTile label="Dormant > 90 days" icon="clock" val="412" delta={-8} goodUp={false} foot="auto-disable in 14d" />
        <KpiTile label="MFA not enrolled" icon="mfa" val="1,736" delta={-22} goodUp={false} foot="grace ends Aug 1" />
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}>
            <Icon name="search" size={14} />
            <input className="inp" placeholder="Search name, email, department…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div id="u-chips" className="hrow" style={{ gap: 7 }}>
            {CHIPS.map(([key, icon, label]) => (
              <button key={key} className={`fchip ${chip === key ? 'on' : ''}`} onClick={() => setChip((c) => (c === key ? null : key))}>
                <Icon name={icon} size={12} />{label}
              </button>
            ))}
          </div>
          <div className="tb-spacer" />
          <div className="seg" id="u-seg">
            {SEGMENTS.map((s) => (
              <button key={s} className={seg === s ? 'on' : ''} onClick={() => setSeg(s)}>{s === 'Attention' ? 'Needs attention' : s}</button>
            ))}
          </div>
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export</button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="sortable">Identity</th><th className="sortable">Department</th><th>Source</th><th>MFA</th>
                <th>Privilege</th><th className="sortable">Risk</th><th>Status</th><th className="sortable">Last active</th><th style={{ width: 96 }} />
              </tr>
            </thead>
            <tbody id="u-body">
              {rows.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="empty">
                    <div className="e-ic"><Icon name="search" size={20} /></div>
                    <div className="e-t">No identities match</div>
                    <div className="e-s">Adjust filters or search across connected directories.</div>
                  </div>
                </td></tr>
              ) : rows.slice(0, 14).map((u) => (
                <tr key={u.id} onClick={() => openDrawer(<UserDrawer user={u} />)}>
                  <td><div className="cell-user"><Avatar name={u.name} /><div><div className="td-main">{u.name}</div><div className="td-sub">{u.email}</div></div></div></td>
                  <td>{u.dept}</td>
                  <td><span className="tag">{u.src}</span></td>
                  <td>{u.mfa ? <Badge tone="ok" label="Enrolled" /> : <Badge tone="bad" label="Not enrolled" />}</td>
                  <td>{u.priv ? <Badge tone="viol" label="Privileged" dot={false} /> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                  <td><RiskPill risk={u.risk} /></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{u.last}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" title="View" onClick={(e) => stop(e, () => openDrawer(<UserDrawer user={u} />))}><Icon name="eye" size={14} /></button>
                      <button className="mini-btn" title="Edit" onClick={(e) => stop(e, () => toast('ok', 'Edit identity', 'Opens identity editor (demo).'))}><Icon name="edit" size={14} /></button>
                      <button className="mini-btn danger" title="Suspend" onClick={(e) => stop(e, () => toast('warn', 'Suspend identity', 'Requires a second approver — request sent (demo).'))}><Icon name="ban" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tbl-foot">
          <span id="u-count">{rows.length} of {fmt(48213)} identities</span>
          <div className="pager">
            <button className="pg-btn" disabled><Icon name="chevL" size={13} /></button>
            <button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button>
            <span style={{ color: 'var(--faint)' }}>…</span><button className="pg-btn">3,444</button>
            <button className="pg-btn"><Icon name="chevR" size={13} /></button>
          </div>
        </div>
      </div>
    </>
  )
}
