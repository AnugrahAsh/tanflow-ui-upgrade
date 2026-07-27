import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { SevTag } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const ERRORS = [
  ['auth.mfa.timeout', 'j.weber', 'Push not answered in 60s — retried, succeeded', 'Low', '3 min ago'],
  ['auth.password.wrong', 'external / 3 ASNs', '2,140 failures — credential stuffing, IPs quarantined', 'High', '11 min ago'],
  ['auth.geo.blocked', 'svc-backup-legacy', 'Login from embargoed region — denied + SOC alert', 'Critical', '22 min ago'],
  ['auth.cert.expired', 'branch-114-ap07', 'EAP-TLS client cert expired', 'Medium', '1 hr ago'],
  ['auth.device.untrusted', 'k.tanaka', 'Unmanaged device — stepped up to FIDO2, passed', 'Low', '2 hrs ago'],
  ['auth.token.replay', 'unknown', 'Replayed session token blocked', 'High', '3 hrs ago'],
]

export default function SignInErrors() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Sign-in & Errors"
        sub="Authentication failures and anomalies across every sign-in surface — with reason codes and remediation."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="calendar" />Last 24 hours</button>
            <button className="btn btn-pri"><Icon name="download" />Export</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Failed sign-ins (24h)" icon="ban" val="76.4" unit="K" delta={-8} goodUp={false} foot="1.9% of attempts" />
        <KpiTile label="Blocked as malicious" icon="shieldCheck" val="2,140" foot="credential stuffing" />
        <KpiTile label="Step-up recoveries" icon="mfa" val="84%" foot="failed then succeeded" />
        <KpiTile label="Critical anomalies" icon="warnTri" val="1" foot="impossible travel" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Query — e.g. code:auth.geo.* severity:high" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Severity: All</button>
          <div className="tb-spacer" />
          <span className="hrow" style={{ gap: 6, fontSize: '11.75px', color: 'var(--mut)' }}><span className="live-dot" />Live tail</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Reason code</th><th>Subject</th><th>Detail</th><th>Severity</th><th>When</th></tr></thead>
            <tbody>
              {ERRORS.map((e) => (
                <tr key={e[0] + e[4]} onClick={() => toast('ok', e[0], 'Raw sign-in event & remediation guidance (demo).')}>
                  <td><span className="code-chip">{e[0]}</span></td>
                  <td className="td-mono" style={{ color: 'var(--mut)' }}>{e[1]}</td>
                  <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink-2)' }}>{e[2]}</td>
                  <td><SevTag sev={e[3]} /></td>
                  <td className="td-num" style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{e[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>6 of 76,412 events · query took 44ms</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
      </div>
    </>
  )
}
