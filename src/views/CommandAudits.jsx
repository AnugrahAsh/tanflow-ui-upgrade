import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const CMDS = [
  ['p.sharma', 'SYS@ora-fin-prd-03', 'DROP TABLE FIN.TMP_RECON_0708', 'Blocked', '2 min ago'],
  ['m.bennett', 'root@sap-prd-app01', 'sudo su -', 'Allowed', '9 min ago'],
  ['n.rahman', 'sa@sql-risk-prd-07', "xp_cmdshell 'whoami'", 'Blocked', '14 min ago'],
  ['o.aziz', 'netadmin@fw-core-01', 'config firewall policy edit 42', 'Approved', '2 hrs ago'],
  ['j.novak', 'svc-deploy@k8s-prod', 'kubectl delete ns payments', 'Blocked', '3 hrs ago'],
  ['e.lindqvist', 'Administrator@dc02', 'Add-ADGroupMember "Domain Admins"', 'Approval', '4 hrs ago'],
]

function verdict(v) {
  if (v === 'Blocked') return <Badge tone="bad" label="Blocked" dot={false} />
  if (v === 'Allowed' || v === 'Approved') return <Badge tone="ok" label={v} dot={false} />
  return <Badge tone="warn" label="Approval" dot={false} />
}

export default function CommandAudits() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="Command Audits"
        sub="Every privileged command evaluated inline — keystroke-level record of what was run, where, and how policy responded."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => go('commands')}><Icon name="commands" />Command policies</button>
            <button className="btn btn-pri"><Icon name="download" />Export</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Commands (24h)" icon="activity" val="41.2" unit="K" foot="3ms median eval" />
        <KpiTile label="Blocked" icon="ban" val="12" foot="0 false positives" />
        <KpiTile label="Sent to approval" icon="clock" val="5" foot="4-eyes gating" />
        <KpiTile label="Retention" icon="lock" val="7" unit="yrs" foot="WORM · tamper-evident" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Query — e.g. verdict:blocked user:p.sharma" /></div>
          <button className="fchip on"><Icon name="filter" size={12} />Blocked + Approval</button>
          <div className="tb-spacer" />
          <span className="hrow" style={{ gap: 6, fontSize: '11.75px', color: 'var(--mut)' }}><span className="live-dot" />Live tail</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>User</th><th>Target</th><th>Command</th><th>Verdict</th><th>When</th></tr></thead>
            <tbody>
              {CMDS.map((c) => (
                <tr key={c[2] + c[4]} onClick={() => toast('ok', 'Command detail', 'Full session context & policy trace (demo).')}>
                  <td><div className="cell-user"><Avatar name={c[0]} cls="av-sm" /><span className="mono" style={{ fontSize: '11.75px' }}>{c[0]}</span></div></td>
                  <td className="td-mono" style={{ color: 'var(--mut)' }}>{c[1]}</td>
                  <td className="mono" style={{ fontSize: '11.25px', color: 'var(--ink-2)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c[2]}</td>
                  <td>{verdict(c[3])}</td>
                  <td className="td-num" style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{c[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>6 of 41,204 commands · query took 38ms</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
      </div>
    </>
  )
}
