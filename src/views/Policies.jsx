import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, SevTag, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SOD_RULES } from '../data/mockData.js'

const VIOLATIONS = [
  ['D. Patel — Create vendor + Approve payment', 'SAP ECC · detected 2h ago', 'Critical'],
  ['J. Weber — DBA + Release manager', 'Oracle · CI/CD · 4 days', 'High'],
  ['Batch svc-recon — Refund + Reconcile', 'T24 · compensating control active', 'Medium'],
]
const PACKS = [
  ['SAP GRC Baseline', '96 rules · SAP ECC / S4', 'v2026.2'],
  ['Banking Core (T24)', '18 rules · teller & back-office', 'v2026.1'],
  ['SWIFT CSP', '6 rules · payment ops', 'v2026.2'],
  ['Custom — Meridian', '4 rules · treasury desk', 'draft'],
]

export default function Policies() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Policies & Segregation of Duties"
        sub="Preventive and detective controls — SoD rulesets, toxic combinations and policy simulation before anything goes live."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Simulation', 'What-if: evaluate rule against 48,213 identities without enforcement (demo).')}><Icon name="eye" />Simulate</button>
            <button className="btn btn-pri"><Icon name="plus" />New rule</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Active SoD rules" icon="policies" val="124" foot="6 rulesets · SAP, Oracle, T24" />
        <KpiTile label="Open violations" icon="warnTri" val="10" delta={-24} goodUp={false} foot="3 critical" />
        <KpiTile label="Risk-accepted (active)" icon="clock" val="22" foot="all expire ≤ 90 days" />
        <KpiTile label="Prevented at request time" icon="shieldCheck" val="118" delta={14} foot="this quarter" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="SoD ruleset" sub="Toxic combinations across business systems" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Rule</th><th>Systems</th><th>Severity</th><th className="td-right">Violations</th><th>State</th><th style={{ width: 70 }} /></tr></thead>
              <tbody>
                {SOD_RULES.map((r) => (
                  <tr key={r.n} onClick={() => toast('ok', r.n, 'Rule logic, exceptions & violation drill-down (demo).')}>
                    <td className="td-main">{r.n}</td>
                    <td style={{ color: 'var(--mut)' }}>{r.sys}</td>
                    <td><SevTag sev={r.sev} /></td>
                    <td className="td-right">{r.viol ? <span className="bdg bdg-bad">{r.viol}</span> : <span style={{ color: 'var(--faint)' }}>0</span>}</td>
                    <td><StatusBadge status={r.state} /></td>
                    <td><div className="row-actions"><button className="mini-btn"><Icon name="eye" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tbl-foot"><span>6 of 124 rules</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Open violations" sub="Requires remediation or risk acceptance" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {VIOLATIONS.map((v) => (
                <div key={v[0]} style={{ padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div className="hrow" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v[0]}</span><SevTag sev={v[2]} />
                  </div>
                  <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{v[1]}</span>
                    <span className="hrow" style={{ gap: 10 }}>
                      <span className="link" onClick={() => toast('ok', 'Remediate', 'Guided remediation: pick entitlement to remove (demo).')}>Remediate</span>
                      <span className="link" onClick={() => toast('warn', 'Risk acceptance', 'Requires control owner + expiry date (demo).')}>Accept risk</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <CardHeader title="Policy packs" sub="Content-managed rule libraries" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
              {PACKS.map((p) => (
                <div className="hrow" key={p[0]} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p[0]}</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{p[1]}</div></div>
                  <span className="tag">{p[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
