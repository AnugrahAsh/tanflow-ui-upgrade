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

// inline monospace token used in the import requirements list
const Code = ({ children }) => (
  <code style={{ fontFamily: 'var(--mono)', fontSize: '11.25px', background: 'var(--surface-3)', color: 'var(--ink-2)', padding: '1px 5px', borderRadius: 3 }}>{children}</code>
)
const Help = ({ title }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--faint)', flex: 'none' }}>
    <title>{title}</title><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
)

// ── Import slide-over (kept in this file, per request) ────────────────────────
function ImportUsers({ onClose }) {
  const { toast } = useApp()
  const [replace, setReplace] = useState(false)
  const [reset, setReset] = useState(false)
  const chk = { display: 'flex', alignItems: 'center', gap: 9, fontSize: '13px', color: 'var(--ink-2)', cursor: 'pointer' }
  const box = { accentColor: 'var(--accent)', width: 16, height: 16 }
  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <aside className="drawer show" role="dialog" aria-modal="true" aria-label="Import users">
        <button className="icon-btn drawer-close" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        <div className="drawer-h">
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.01em', padding: '4px 0 14px' }}>Import Users</div>
        </div>
        <div className="drawer-body">
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
            <div className="hrow" style={{ gap: 8, marginBottom: 10, fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>
              <Icon name="reports" size={16} />File Requirements
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.85 }}>
              <li>Supports <b>CSV, JSON, and YAML</b> formats</li>
              <li>Required: <Code>username</Code> (or <Code>name</Code>) and <Code>email</Code></li>
              <li>Groups: use <Code>user_groups</Code> or <Code>groups</Code> (semicolon-separated in CSV)</li>
              <li>Attributes: <Code>attr_</Code> prefix in CSV, <Code>attributes</Code> object in JSON/YAML</li>
              <li>Assign roles: <Code>roles</Code> column/field (semicolon-separated in CSV)</li>
              <li>Organization: <Code>organization</Code> and <Code>organizational_role</Code> fields</li>
              <li>New groups and roles are created automatically with default settings</li>
              <li>Check <b>Replace existing</b> to update users with the same username</li>
              <li>Check <b>Reset permissions</b> to clear old access before applying new ones</li>
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Sample downloaded', 'A sample import file has been downloaded (demo).')}>
              <Icon name="download" />Download Sample<Icon name="chevD" size={13} />
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 7 }}>Upload File (CSV, JSON, YAML, YML)</div>
            <input type="file" accept=".csv,.json,.yaml,.yml" className="inp" style={{ height: 'auto', padding: '7px 10px', lineHeight: 1.4 }} />
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={chk}>
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} style={box} />
              Replace/Update existing users <Help title="Overwrite users that already exist with the same username." />
            </label>
            <label style={chk}>
              <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} style={box} />
              Reset permissions <Help title="Clear existing READ permissions before applying the imported ones." />
            </label>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, flex: 'none' }}>
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn btn-pri" onClick={() => { toast('ok', 'Import started', 'Your users file is being processed (demo).'); onClose() }}>
            <Icon name="upload" />Import
          </button>
        </div>
      </aside>
    </>
  )
}

export default function Users() {
  const { openDrawer, toast, go } = useApp()
  const [q, setQ] = useState('')
  const [chip, setChip] = useState(null)
  const [seg, setSeg] = useState('All')
  const [importOpen, setImportOpen] = useState(false)

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
            <button className="btn btn-sec" onClick={() => setImportOpen(true)}><Icon name="upload" />Import</button>
            <button className="btn btn-pri" onClick={() => go('create-user')}><Icon name="plus" />New identity</button>
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
                      <button className="mini-btn" title="Edit" onClick={(e) => stop(e, () => go('edit-user/' + u.id))}><Icon name="edit" size={14} /></button>
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

      {importOpen && <ImportUsers onClose={() => setImportOpen(false)} />}
    </>
  )
}
