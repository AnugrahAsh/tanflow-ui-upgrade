import Icon from '../components/Icon.jsx'
import { PageHead, CardHeader } from '../components/ui.jsx'
import { StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const REPORTS = [
  ['Identity posture — executive brief', 'Monthly one-pager for the board: risk index, MFA, privilege trend', 'compliance', 'Monthly · PDF', ['CISO', 'Board pack']],
  ['Privileged activity digest', 'All sessions, blocked commands, checkouts with anomalies highlighted', 'vault', 'Weekly · PDF + CSV', ['SOC', 'Auditors']],
  ['Certification evidence pack', 'Campaign decisions with attestations — formatted for external audit', 'certs', 'On demand · ZIP', ['SOX', 'ISO 27001']],
  ['SoD violation register', 'Open, remediated and risk-accepted conflicts with aging', 'policies', 'Weekly · XLSX', ['Finance Controls']],
  ['Authentication quality', 'Failure taxonomies, MFA friction, step-up outcomes by population', 'mfa', 'Weekly · Dashboard', ['IAM Eng']],
  ['Dormant & orphan accounts', 'Unowned, unused and never-logged-in accounts across systems', 'users', 'Daily · CSV', ['IGA', 'IT Ops']],
]
const SCHEDULED = [
  ['Identity posture — executive brief', '1st of month · 07:00', 'CISO, CIO, Audit chair', 'PDF', 'Jul 1 · 07:00', 'Completed'],
  ['Privileged activity digest', 'Mondays · 06:00', 'SOC leads (4)', 'PDF + CSV', 'Jul 6 · 06:00', 'Completed'],
  ['Dormant & orphan accounts', 'Daily · 05:30', 'IGA queue', 'CSV → SFTP', 'Today · 05:30', 'Completed'],
  ['SoD violation register', 'Fridays · 17:00', 'Finance Controls', 'XLSX', 'Jul 3 · 17:00', 'Completed'],
  ['Regulator extract — RBI format', 'Quarterly', 'Compliance office', 'XML (signed)', 'Jun 30', 'Review'],
]

export default function Reports() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Reports"
        sub="Board-ready reporting across access, privilege, governance and operations — scheduled, subscribed, exportable."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'Report builder', 'Drag-and-drop builder over the identity warehouse (demo).')}><Icon name="plus" />New report</button>}
      />
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {REPORTS.map((r) => (
          <div className="card card-pad" key={r[0]} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }} onClick={() => toast('ok', r[0], 'Preview with live data (demo).')}>
            <div className="hrow" style={{ justifyContent: 'space-between' }}>
              <div className="ph-icon" style={{ width: 34, height: 34, borderRadius: 4 }}><Icon name={r[2]} size={16} /></div>
              <span style={{ fontSize: 11, color: 'var(--mut)' }} className="num">{r[3]}</span>
            </div>
            <div style={{ fontSize: '13.25px', fontWeight: 650, lineHeight: 1.35 }}>{r[0]}</div>
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.5, flex: 1 }}>{r[1]}</div>
            <div className="hrow" style={{ gap: 6, flexWrap: 'wrap' }}>{r[4].map((t) => <span className="tag" key={t}>{t}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <CardHeader title="Scheduled deliveries" sub="Subscriptions and their last run" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Report</th><th>Schedule</th><th>Recipients</th><th>Format</th><th>Last run</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {SCHEDULED.map((s) => (
                <tr key={s[0]} onClick={() => toast('ok', s[0], 'Delivery history & subscription editor (demo).')}>
                  <td className="td-main">{s[0]}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{s[1]}</td>
                  <td style={{ color: 'var(--mut)' }}>{s[2]}</td>
                  <td><span className="tag">{s[3]}</span></td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{s[4]}</td>
                  <td><StatusBadge status={s[5]} /></td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="play" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
