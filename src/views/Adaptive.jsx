import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, MeterRow, Toggle } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'

const SIGNALS = [
  ['Impossible travel / geo-velocity', 92],
  ['Device health & attestation', 84],
  ['Anonymizer / TOR / bad ASN', 80],
  ['Behavioral biometrics deviation', 66],
  ['Session heritage & token age', 58],
  ['Time-of-day vs baseline', 41],
  ['Threat intel — credential leaks', 88],
]
const DECISIONS = [
  ['SYS (service)', 'Oracle ora-fin-prd-03', 'Geo-velocity · new ASN', '94', 'Denied', '6 min ago'],
  ['j.weber', 'VPN — remote', 'MFA fatigue pattern', '78', 'Step-up → FIDO2', '2 hrs ago'],
  ['k.tanaka', 'Salesforce', 'New device (managed)', '32', 'Step-up → push', '3 hrs ago'],
  ['a.mensah', 'M365 mail', 'Baseline match', '4', 'Allowed', '3 hrs ago'],
  ['contractor-8841', 'sql-dev-04', 'Off-hours + new geo', '61', 'Step-up → FIDO2', '5 hrs ago'],
  ['p.sharma', 'SAP S/4HANA', 'Baseline match', '7', 'Allowed', '6 hrs ago'],
]
const LADDER = [
  [1, 'Block anonymizers', 'All identities', 'TOR / known-bad ASN', 'Deny', 'Enforced', true],
  [2, 'Privileged step-up', '3,842 privileged', 'Any privileged resource', 'FIDO2 always', 'Enforced', true],
  [3, 'Payment 4-eyes', 'SWIFT & payment ops', 'Payment release console', 'FIDO2 + dual approval', 'Enforced', true],
  [4, 'Unmanaged device quarantine', 'All identities', 'Device not attested', 'Browser-only, no download', 'Enforced', true],
  [5, 'Geo fence — sanctioned regions', 'All identities', 'Embargoed country list', 'Deny + SOC alert', 'Enforced', true],
  [6, 'Behavioral anomaly step-up', 'All identities', 'UEBA score ≥ 60', 'Strong factor challenge', 'Shadow', false],
]

function scoreClass(sc) {
  return sc >= 80 ? 'rp-crit' : sc >= 60 ? 'rp-high' : sc >= 30 ? 'rp-med' : 'rp-low'
}
function decisionBadge(d) {
  if (d === 'Denied') return <Badge tone="bad" label={d} dot={false} />
  if (d === 'Allowed') return <Badge tone="ok" label={d} dot={false} />
  return <Badge tone="warn" label={d} dot={false} />
}

export default function Adaptive() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Adaptive & Risk-Based Access"
        sub="Every request is scored in real time against device, network, behavior and threat signals — policy responds in milliseconds."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Shadow mode', 'New policies run in report-only mode before enforcement (demo).')}><Icon name="eye" />Shadow mode</button>
            <button className="btn btn-pri"><Icon name="plus" />New policy</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Decisions (24h)" icon="adaptive" val="128" unit="K" foot="median 84ms" spark={wave(12, 44, 18, 43)} />
        <KpiTile label="Step-up triggered" icon="mfa" val="6.2" unit="%" delta={-1.1} goodUp={false} foot="friction trending down" />
        <KpiTile label="Sessions denied" icon="ban" val="0.4" unit="%" foot="512 blocked, 3 appealed" />
        <KpiTile label="Model drift check" icon="shieldCheck" val="Pass" foot="UEBA baseline recalibrated 02:00" />
      </div>
      <div className="grid-32" style={{ marginBottom: 16 }}>
        <div className="card">
          <CardHeader title="Risk signals" sub="Weighted inputs to the scoring model" />
          <div className="card-pad" style={{ paddingTop: 6 }}>
            {SIGNALS.map((s) => (
              <MeterRow key={s[0]} label={s[0].length > 26 ? s[0].slice(0, 26) + '…' : s[0]} val={s[1]} pct={s[1]} />
            ))}
            <div style={{ fontSize: '11.25px', color: 'var(--mut)', marginTop: 10 }}>Weights tuned per population — stricter for privileged & payment roles.</div>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Recent adaptive decisions" sub="Live decision log with full reasoning" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Identity</th><th>App / resource</th><th>Signals fired</th><th className="td-right">Score</th><th>Decision</th><th>When</th></tr></thead>
              <tbody>
                {DECISIONS.map((d) => (
                  <tr key={d[0] + d[5]} onClick={() => toast('ok', 'Decision detail', 'Full signal breakdown & policy trace (demo).')}>
                    <td className="td-mono">{d[0]}</td>
                    <td>{d[1]}</td>
                    <td style={{ color: 'var(--mut)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d[2]}</td>
                    <td className="td-right"><span className={`risk-pill ${scoreClass(+d[3])}`}><i />{d[3]}</span></td>
                    <td>{decisionBadge(d[4])}</td>
                    <td className="td-num" style={{ color: 'var(--mut)' }}>{d[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card">
        <CardHeader title="Policy ladder" sub="Ordered conditional-access policies — first match wins" right={<span className="tag tag-acc">4 in shadow mode</span>} />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: 44 }}>#</th><th>Policy</th><th>Population</th><th>Condition</th><th>Action</th><th>Mode</th><th style={{ width: 60 }} /></tr></thead>
            <tbody>
              {LADDER.map((p) => (
                <tr key={p[0]} onClick={() => toast('ok', p[1], 'Policy editor with impact simulation (demo).')}>
                  <td className="td-num" style={{ color: 'var(--faint)' }}>{p[0]}</td>
                  <td className="td-main">{p[1]}</td>
                  <td style={{ color: 'var(--mut)' }}>{p[2]}</td>
                  <td style={{ color: 'var(--mut)' }}>{p[3]}</td>
                  <td style={{ fontWeight: 600 }}>{p[4]}</td>
                  <td>{p[5] === 'Enforced' ? <Badge tone="ok" label="Enforced" dot={false} /> : <Badge tone="info" label="Shadow" dot={false} />}</td>
                  <td><Toggle defaultOn={p[6]} onToggle={() => toast('warn', 'Mode change staged', 'Review impact report before publishing (demo).')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
