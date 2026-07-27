import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fmt } from '../lib/format.js'

const RULES = [
  [1, 'Block destructive DDL', 'DROP TABLE|TRUNCATE|DROP DATABASE', 'All production DBs', 'Deny', 9],
  [2, 'Gate user admin on Tier-0', 'net user|dsadd|Add-ADGroupMember', 'Domain controllers', 'Approve', 5],
  [3, 'Block shell history wipe', 'history -c|rm .bash_history', 'All Linux', 'Deny', 2],
  [4, 'Allow read-only diagnostics', 'SELECT|SHOW|EXPLAIN|df|top', 'All targets', 'Allow', 38204],
  [5, 'Gate firewall rule changes', 'config firewall policy', 'fw-core-*', 'Approve', 11],
  [6, 'Block xp_cmdshell', 'xp_cmdshell', 'SQL Server estate', 'Deny', 1],
]
const ENFORCEMENT = [
  ['Blocked', 'DROP TABLE FIN.TMP_RECON_0708', 'PS-88409 · SYS@ora-fin-prd', 'bad', '2 min'],
  ['Approval', 'Add-ADGroupMember "Domain Admins"', 'Pending — E. Lindqvist', 'warn', '18 min'],
  ['Blocked', "xp_cmdshell 'whoami'", 'PS-88401 · sa@sql-risk', 'bad', '1 hr'],
  ['Approved', 'config firewall policy edit 42', 'O. Aziz · approved by NetOps lead', 'ok', '2 hrs'],
  ['Blocked', 'rm -rf /var/log/audit', 'PS-88395 · svc-deploy', 'bad', '3 hrs'],
]

function actionBadge(a) {
  if (a === 'Deny') return <Badge tone="bad" label="Deny" dot={false} />
  if (a === 'Allow') return <Badge tone="ok" label="Allow" dot={false} />
  return <Badge tone="warn" label="Approval" dot={false} />
}

export default function Commands() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Command Policies"
        sub="Allow, deny, or require-approval rules evaluated inline on every privileged command — SSH, SQL, PowerShell and API."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Test bench', 'Paste a command, pick a target — see the policy verdict before rollout (demo).')}><Icon name="eye" />Test a command</button>
            <button className="btn btn-pri"><Icon name="plus" />New policy</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Active policies" icon="commands" val="38" foot="SSH · SQL · PS · REST" />
        <KpiTile label="Commands evaluated (24h)" icon="activity" val="41.2" unit="K" foot="inline, 3ms median" />
        <KpiTile label="Blocked (24h)" icon="ban" val="12" foot="0 false positives reported" />
        <KpiTile label="Sent to approval" icon="clock" val="5" foot="4-eyes command gating" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Policy rules" sub="Ordered evaluation — first match wins" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th style={{ width: 44 }}>#</th><th>Rule</th><th>Pattern</th><th>Targets</th><th>Action</th><th className="td-right">Hits 7d</th><th style={{ width: 70 }} /></tr></thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r[0]} onClick={() => toast('ok', `Rule ${r[0]}`, 'Rule editor with regex tester & dry-run (demo).')}>
                    <td className="td-num" style={{ color: 'var(--faint)' }}>{r[0]}</td>
                    <td className="td-main">{r[1]}</td>
                    <td><span className="code-chip" style={{ maxWidth: 210, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>{r[2]}</span></td>
                    <td style={{ color: 'var(--mut)' }}>{r[3]}</td>
                    <td>{actionBadge(r[4])}</td>
                    <td className="td-right td-num">{fmt(r[5])}</td>
                    <td><div className="row-actions"><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn danger"><Icon name="trash" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Recent enforcement" sub="Live feed from session proxies" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {ENFORCEMENT.map((e) => (
              <div key={e[1]} style={{ padding: '8.5px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ justifyContent: 'space-between' }}>
                  <Badge tone={e[3]} label={e[0]} dot={false} /><span style={{ fontSize: '10.75px', color: 'var(--faint)' }}>{e[4]} ago</span>
                </div>
                <div className="mono" style={{ fontSize: '11.25px', color: 'var(--ink)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e[1]}</div>
                <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 1 }}>{e[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
