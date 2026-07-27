import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const ROWS = [
  ['Temenos Managed Services', 'e.ferreira', 'Core Banking (T24)', 'Standing', 'Sep 30, 2026'],
  ['AuditCo LLP', 'j.callahan', 'Evidence workspace (RO)', 'Time-boxed', 'Jul 28, 2026'],
  ['Meridian Insurance', 's.demir', 'Shared Claims API', 'Standing', 'Reviewed Jul 1'],
  ['Contractor 8841', 'r.vargas', 'sql-dev-04', 'Time-boxed', 'Expires 11h'],
  ['Gov Regulator Portal', 'eidas-bridge', 'Regulatory extract', 'Standing', 'Continuous'],
]

export default function AccessReport() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Access Report"
        sub="Who — internal or external — can reach what, and under which policy. Point-in-time, exportable, audit-ready."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="calendar" />As of: Today</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Export', 'Access report generated as signed PDF + CSV (demo).')}><Icon name="download" />Export report</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Entities with access" icon="users" val="1,942" foot="internal + external" />
        <KpiTile label="External parties" icon="globe" val="14" foot="6 standing · 8 time-boxed" />
        <KpiTile label="Standing grants" icon="unlock" val="61" delta={-12} goodUp={false} foot="review target < 50" />
        <KpiTile label="Reviewed < 90d" icon="shieldCheck" val="97" unit="%" foot="attestation current" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search party, user, resource…" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Type: External</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />CSV</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Party</th><th>User</th><th>Resource</th><th>Grant type</th><th>Expiry / review</th></tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[0] + r[1]} onClick={() => toast('ok', r[0], 'Access lineage: policy, approver, evidence (demo).')}>
                  <td className="td-main">{r[0]}</td>
                  <td><div className="cell-user"><Avatar name={r[1]} cls="av-sm" /><span>{r[1]}</span></div></td>
                  <td style={{ color: 'var(--mut)' }}>{r[2]}</td>
                  <td>{r[3] === 'Standing' ? <Badge tone="warn" label="Standing" dot={false} /> : <Badge tone="ok" label="Time-boxed" dot={false} />}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
