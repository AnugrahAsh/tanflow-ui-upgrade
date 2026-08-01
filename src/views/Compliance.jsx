import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { SegBar } from '../components/charts/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { FRAMEWORKS } from '../data/mockData.js'

const EXCEPTIONS = [
  ['AC-02 · Account lifecycle', 'SOX / NIST', '2 leavers exceeded 15-min deprovision SLA in June', 'IGA Team', 'Jul 15', 'In Progress'],
  ['PR.AC-4 · Least privilege', 'NIST 800-53', 'Standing privilege on 3 legacy SQL instances', 'Data Platform', 'Jul 22', 'In Progress'],
  ['Req 8.3 · MFA for CDE', 'PCI DSS', '1 shared kiosk exempted — compensating control review', 'Retail IT', 'Jul 12', 'Review'],
  ['A.9.2.5 · Access review', 'ISO 27001', 'Treasury Dealer certification 9 days overdue', 'Treasury', 'Overdue', 'Overdue'],
]

export default function Compliance() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Compliance Posture"
        sub="Continuous control monitoring mapped to regulatory frameworks — audit-ready evidence on demand."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />Evidence package</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Auditor workspace', 'Time-boxed, read-only auditor access with scoped evidence (demo).')}><Icon name="plus" />Invite auditor</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Overall control pass rate" icon="compliance" val="96.2" unit="%" delta={1.4} foot="392 controls monitored" />
        <KpiTile label="Failing controls" icon="warnTri" val="4" delta={-2} goodUp={false} foot="remediation owners assigned" />
        <KpiTile label="Evidence freshness" icon="clock" val="< 24" unit="hrs" foot="continuous collection" />
        <KpiTile label="Next external audit" icon="calendar" val="Aug" unit="2026" foot="SOX ICFR — 34 days" />
      </div>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {FRAMEWORKS.map((f) => {
          const segs = [{ n: 'Passing', v: f.pass, c: '#0ca30c' }]
          if (f.warn) segs.push({ n: 'At risk', v: f.warn, c: '#fab219' })
          if (f.fail) segs.push({ n: 'Failing', v: f.fail, c: '#d03b3b' })
          return (
            <div className="card card-pad" key={f.n} style={{ cursor: 'pointer' }} onClick={() => toast('ok', f.n, 'Control-by-control drill-down with evidence (demo).')}>
              <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '13.5px', fontWeight: 650 }}>{f.n}</span>
                {f.fail ? <Badge tone="bad" label={`${f.fail} failing`} /> : f.warn ? <Badge tone="warn" label={`${f.warn} at risk`} /> : <Badge tone="ok" label="All passing" />}
              </div>
              <SegBar h={8} segs={segs} />
              <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 10, fontSize: '11.5px', color: 'var(--mut)' }}>
                <span className="num">{f.pass}/{f.ctrl} controls passing</span><span>Audit: {f.audit}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Control exceptions" sub="Failing or at-risk controls across frameworks" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Control</th><th>Framework</th><th>Finding</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {EXCEPTIONS.map((c) => (
                  <tr key={c[0]} onClick={() => toast('ok', c[0], 'Control detail, test history & evidence chain (demo).')}>
                    <td className="td-main">{c[0]}</td>
                    <td><span className="tag">{c[1]}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--mut)' }}>{c[2]}</td>
                    <td style={{ color: 'var(--mut)' }}>{c[3]}</td>
                    <td className="td-num" style={{ color: 'var(--mut)' }}>{c[4]}</td>
                    <td><StatusBadge status={c[5]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Audit readiness timeline" sub="SOX ICFR — Aug 2026" />
          <div className="card-pad tline" style={{ marginLeft: 6 }}>
            <div className="tline-it tl-ok"><span className="tl-dot" /><div className="tl-t">Q3 privileged access campaign</div><div className="tl-s">72% complete — on track</div><div className="tl-time">Due Jul 21</div></div>
            <div className="tline-it tl-ok"><span className="tl-dot" /><div className="tl-t">Evidence package — access reviews</div><div className="tl-s">Auto-generated, 1,240 attestations</div><div className="tl-time">Ready</div></div>
            <div className="tline-it tl-warn"><span className="tl-dot" /><div className="tl-t">Remediate AC-02 exceptions</div><div className="tl-s">2 findings — owner: IGA Team</div><div className="tl-time">Due Jul 15</div></div>
            <div className="tline-it tl-acc"><span className="tl-dot" /><div className="tl-t">Auditor workspace provisioning</div><div className="tl-s">Read-only scoped access for external firm</div><div className="tl-time">Jul 28</div></div>
            <div className="tline-it"><span className="tl-dot" /><div className="tl-t">Fieldwork begins</div><div className="tl-s">ICFR walkthroughs — identity controls</div><div className="tl-time">Aug 11</div></div>
          </div>
        </div>
      </div>
    </>
  )
}
