import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const SECRETS = [
  ['SAP_RFC_SERVICE_KEY', 'API key', 'SAP Basis', 'Every 30d', '4 days ago', 'Active'],
  ['stripe-live-webhook', 'Webhook secret', 'Payments Eng', 'Every 90d', '31 days ago', 'Active'],
  ['db.oracle.fin.password', 'DB credential', 'Data Platform', 'Every 24h', '2 hrs ago', 'Rotated'],
  ['aws.ci.access_key', 'Cloud key', 'Cloud CoE', 'Every 7d', '6 days ago', 'Expired'],
  ['tls.id.meridian.pem', 'Certificate', 'Platform Ops', 'Every 365d', 'Mar 2026', 'Active'],
  ['github.app.private_key', 'App key', 'DevEx', 'Every 90d', '12 days ago', 'Active'],
]

export default function Secrets() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Secrets"
        sub="Central, encrypted store for application secrets, API keys and certificates — brokered to workloads with rotation and lease TTLs."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Rotate', 'Rotation sweep queued for all due secrets (demo).')}><Icon name="refresh" />Rotate due</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'New secret', 'Store a secret with owner, rotation and access policy (demo).')}><Icon name="plus" />New secret</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Secrets under management" icon="lock" val="1,204" delta={5} foot="12 engines" />
        <KpiTile label="Rotated (30d)" icon="refresh" val="99.2" unit="%" foot="3 pending retries" />
        <KpiTile label="Expiring < 7d" icon="clock" val="7" foot="owners notified" />
        <KpiTile label="Hardcoded leaks found" icon="warnTri" val="0" delta={-100} goodUp={false} foot="CI/CD scanner" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search secret path or owner…" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Type: All</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export policy</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Secret</th><th>Type</th><th>Owner</th><th>Rotation</th><th>Last rotated</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {SECRETS.map((s) => (
                <tr key={s[0]} onClick={() => toast('ok', s[0], 'Secret metadata, versions & access log (demo).')}>
                  <td className="td-main mono" style={{ fontSize: '11.5px' }}>{s[0]}</td>
                  <td><span className="tag">{s[1]}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{s[2]}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{s[3]}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{s[4]}</td>
                  <td>{s[5] === 'Expired' ? <Badge tone="bad" label="Expired" /> : <StatusBadge status={s[5]} />}</td>
                  <td><div className="row-actions"><button className="mini-btn" title="Rotate" onClick={(e) => { e.stopPropagation(); toast('ok', 'Rotated', 'New version issued, workloads re-leased (demo).') }}><Icon name="refresh" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
