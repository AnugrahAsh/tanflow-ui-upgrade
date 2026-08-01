import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const FINDINGS = [
  ['sap-hr-prd-02', 'Linux host', 'root, oracle, svc-batch', 'Network scan', 'Unmanaged'],
  ['win-br-114.corp', 'Windows Server', 'Administrator (local)', 'AD sweep', 'Unmanaged'],
  ['ora-fin-prd-05', 'Oracle DB', 'SYS, SYSTEM', 'DB probe', 'Onboarding'],
  ['aws:iam/deploy-ci', 'Cloud IAM', 'Access key (90d old)', 'CIEM scan', 'Unmanaged'],
  ['core-sw-09.dmz', 'Network device', 'enable, netadmin', 'SNMP discovery', 'Onboarded'],
  ['k8s-prod-cluster', 'Service account', 'svc-deploy, tiller', 'Kube scan', 'Onboarding'],
]

export default function Discovery() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Discovery"
        sub="Continuously scan the estate for unmanaged privileged accounts, hosts and services — then onboard them into the vault."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="settings" />Scan policies</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Discovery scan', 'On-demand sweep queued across 4 networks (demo).')}><Icon name="search" />Run scan</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Assets discovered" icon="db" val="4,812" delta={3} foot="across 4 networks" />
        <KpiTile label="Unmanaged accounts" icon="warnTri" val="214" delta={-11} goodUp={false} foot="onboarding candidates" />
        <KpiTile label="Scans running" icon="refresh" val="3" foot="network · AD · cloud" />
        <KpiTile label="Onboarded this week" icon="shieldCheck" val="148" delta={22} foot="auto-vaulted" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search hosts, accounts, sources…" /></div>
          <button className="fchip on"><Icon name="filter" size={12} />Unmanaged</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Asset</th><th>Type</th><th>Accounts found</th><th>Source</th><th>Status</th><th style={{ width: 88 }} /></tr></thead>
            <tbody>
              {FINDINGS.map((f) => (
                <tr key={f[0]} onClick={() => toast('ok', f[0], 'Discovered-asset detail & onboarding wizard (demo).')}>
                  <td className="td-main mono" style={{ fontSize: '11.75px' }}>{f[0]}</td>
                  <td><span className="tag">{f[1]}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{f[2]}</td>
                  <td style={{ color: 'var(--mut)' }}>{f[3]}</td>
                  <td>{f[4] === 'Unmanaged' ? <Badge tone="bad" label="Unmanaged" /> : f[4] === 'Onboarding' ? <StatusBadge status="In Progress" /> : <Badge tone="ok" label="Onboarded" />}</td>
                  <td><div className="row-actions"><button className="mini-btn" title="Onboard" onClick={(e) => { e.stopPropagation(); toast('ok', 'Onboard', 'Credentials vaulted & rotation scheduled (demo).') }}><Icon name="download" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
