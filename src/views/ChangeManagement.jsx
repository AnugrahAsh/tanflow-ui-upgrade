import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, RiskPill, SevTag } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const CHANGES = [
  ['CHG-88214', 'Kernel patch — sap-prd-app01', 'Marcus Bennett', 'Standard', 'Sat 02:00–04:00', 'Medium', 'Approved'],
  ['CHG-88221', 'Schema change — ora-fin-prd-03', 'Priya Sharma', 'Major', 'Sun 01:00–03:00', 'High', 'In CAB'],
  ['CHG-88209', 'GPO update — dc02.corp', 'Erik Lindqvist', 'Normal', 'Thu 22:00', 'Low', 'Approved'],
  ['CHG-88230', 'Firewall policy — fw-core-01', 'Omar Aziz', 'Emergency', 'Now · time-boxed', 'Critical', 'Emergency'],
  ['CHG-88240', 'Release deploy — k8s payments', 'Julia Novak', 'Standard', 'Fri 18:00', 'Medium', 'Scheduled'],
  ['CHG-88198', 'DB failover test — sql-risk-prd', 'Nadia Rahman', 'Major', 'Completed Jul 6', 'High', 'Completed'],
]
const CAB = [
  ['CHG-88221', 'Oracle schema change', 'Needs DBA lead + CISO delegate', 'High'],
  ['CHG-88235', 'SWIFT gateway config', '4-eyes — payment ops sign-off', 'Critical'],
  ['CHG-88238', 'AD trust modification', 'Security review pending', 'High'],
]

function statusBadge(s) {
  if (s === 'Approved' || s === 'Completed') return <Badge tone="ok" label={s} />
  if (s === 'In CAB' || s === 'Scheduled') return <Badge tone="info" label={s} />
  if (s === 'Emergency') return <Badge tone="bad" label="Emergency" />
  return <Badge tone="warn" label={s} />
}

export default function ChangeManagement() {
  const { toast, go } = useApp()
  return (
    <>
      <PageHead
        title="Change Management"
        sub="Change requests that gate privileged access — CAB workflow, scheduled windows and emergency changes."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="calendar" />Change calendar</button>
            <button className="btn btn-pri" onClick={() => go('create-change-request')}><Icon name="plus" />New change</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Open changes" icon="edit" val="18" foot="5 awaiting CAB" />
        <KpiTile label="Awaiting CAB approval" icon="clock" val="5" delta={-2} goodUp={false} foot="median 6h to decision" />
        <KpiTile label="Emergency changes (30d)" icon="warnTri" val="3" foot="all time-boxed & recorded" />
        <KpiTile label="Change success rate" icon="shieldCheck" val="98.4" unit="%" delta={1.1} foot="last 90 days" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Change requests" sub="Every change linked to its target, window and approval" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Change</th><th>Requester</th><th>Type</th><th>Window</th><th>Risk</th><th>Status</th></tr></thead>
              <tbody>
                {CHANGES.map((c) => (
                  <tr key={c[0]} onClick={() => toast('ok', c[0], 'Change detail: plan, rollback, approvals & linked sessions (demo).')}>
                    <td><div className="td-main">{c[1]}</div><div className="td-sub mono">{c[0]}</div></td>
                    <td>{c[2]}</td>
                    <td>{c[3] === 'Emergency' ? <Badge tone="bad" label="Emergency" dot={false} /> : <span className="tag">{c[3]}</span>}</td>
                    <td className="td-num" style={{ color: 'var(--mut)' }}>{c[4]}</td>
                    <td><RiskPill risk={c[5]} /></td>
                    <td>{statusBadge(c[6])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="CAB approval queue" sub="Awaiting change advisory board" right={<span className="tag tag-acc">5</span>} />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {CAB.map((x) => (
              <div key={x[0]} style={{ padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: '11.75px', fontWeight: 600 }}>{x[0]}</span><SevTag sev={x[3]} />
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, marginTop: 3 }}>{x[1]}</div>
                <div style={{ fontSize: '11.25px', color: 'var(--mut)', marginTop: 1 }}>{x[2]}</div>
                <div className="hrow" style={{ marginTop: 8, gap: 7 }}>
                  <button className="btn btn-sec btn-sm" onClick={() => toast('warn', 'Sent back', 'Change returned to requester (demo).')}>Return</button>
                  <button className="btn btn-pri btn-sm" onClick={() => toast('ok', 'Approved', 'Change approved & scheduled (demo).')}>Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
