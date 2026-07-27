import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const WINDOWS = [
  ['Priya Sharma', 'Oracle SYSDBA — ora-fin-prd', 'Mon–Fri · 09:00–18:00 UTC', 'Weekly', 'Active'],
  ['Contractor batch (8)', 'VPN — Standard profile', 'Until Sep 30, 2026', 'One-off', 'Active'],
  ['Marcus Bennett', 'root — sap-prd-app01', 'CAB window · Sat 02:00–04:00', 'Scheduled', 'Pending'],
  ['SOC on-call', 'EDR isolate — all endpoints', '24×7 rotation', 'Recurring', 'Active'],
  ['Freya Berg', 'SWIFT Operators', 'Jul 12 · 4h window', 'One-off', 'Expired'],
  ['HR Data Stewards', 'Workday — Payroll view', 'Payroll run · 25th–28th', 'Monthly', 'Active'],
]

export default function TimeBasedAccess() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Time-Based Access"
        sub="Grant access only when it's needed — scheduled windows, recurring rotations and one-off approvals that expire automatically."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'New window', 'Define resource, schedule and auto-expiry (demo).')}><Icon name="plus" />New window</button>}
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Active windows" icon="calendar" val="9" foot="avg 32 min remaining" />
        <KpiTile label="Scheduled" icon="clock" val="22" foot="next opens in 2h" />
        <KpiTile label="Expired today" icon="ban" val="14" foot="access auto-revoked" />
        <KpiTile label="Recurring rules" icon="refresh" val="31" foot="policy-managed" />
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Grantee</th><th>Resource</th><th>Window</th><th>Cadence</th><th>Status</th><th style={{ width: 88 }} /></tr></thead>
            <tbody>
              {WINDOWS.map((w) => (
                <tr key={w[0] + w[1]} onClick={() => toast('ok', 'Access window', 'Schedule, approvals & audit trail (demo).')}>
                  <td><div className="cell-user"><Avatar name={w[0]} cls="av-sm" /><span className="td-main">{w[0]}</span></div></td>
                  <td className="mono" style={{ fontSize: '11.75px', color: 'var(--ink-2)' }}>{w[1]}</td>
                  <td style={{ color: 'var(--mut)' }}>{w[2]}</td>
                  <td><span className="tag">{w[3]}</span></td>
                  <td><StatusBadge status={w[4]} /></td>
                  <td><div className="row-actions"><button className="mini-btn" title="Edit"><Icon name="edit" size={14} /></button><button className="mini-btn danger" title="Revoke" onClick={(e) => { e.stopPropagation(); toast('warn', 'Revoked', 'Access window closed early (demo).') }}><Icon name="ban" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>Windows expire automatically — no manual clean-up, no orphaned access.</span><Badge tone="ok" label="Auto-expiry enforced" /></div>
      </div>
    </>
  )
}
