import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fmt } from '../lib/format.js'

const PROVIDERS = [
  ['Microsoft Entra ID', 'OIDC', 'Primary', 14208, 'Connected'],
  ['Okta', 'SAML 2.0', 'Migration source', 6120, 'Connected'],
  ['Google Workspace', 'OIDC', 'Contractors', 1204, 'Connected'],
  ['Ping Identity', 'SAML 2.0', 'Subsidiary', 2140, 'Connected'],
  ['ADFS (on-prem)', 'WS-Fed', 'Legacy', 840, 'Degraded'],
  ['SecureAuth', 'SAML 2.0', 'Decommissioning', 0, 'Disabled'],
]

export default function SsoProviders() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="SSO Providers"
        sub="Upstream identity providers federated into Tanflow — protocols, claim mapping and certificate lifecycle."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />Export metadata</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Add provider', 'Wizard: pick protocol, upload metadata, map claims (demo).')}><Icon name="plus" />Add provider</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Providers" icon="sso" val="6" foot="1 primary" />
        <KpiTile label="Connected" icon="shieldCheck" val="5" foot="1 degraded" />
        <KpiTile label="Federated identities" icon="users" val="24,512" foot="across all IdPs" />
        <KpiTile label="Certs expiring < 60d" icon="warnTri" val="2" foot="auto-rollover set" />
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Provider</th><th>Protocol</th><th>Role</th><th className="td-right">Users</th><th>Status</th><th style={{ width: 88 }} /></tr></thead>
            <tbody>
              {PROVIDERS.map((p) => (
                <tr key={p[0]} onClick={() => toast('ok', p[0], 'Provider config, claim mapping & cert chain (demo).')}>
                  <td className="td-main">{p[0]}</td>
                  <td><span className="tag">{p[1]}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{p[2]}</td>
                  <td className="td-right td-num">{p[4] === 'Disabled' ? <span style={{ color: 'var(--faint)' }}>—</span> : fmt(p[3])}</td>
                  <td><StatusBadge status={p[4]} /></td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn"><Icon name="external" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>Primary IdP: Microsoft Entra ID · fallback routing enabled.</span><Badge tone="ok" label="Active-active" /></div>
      </div>
    </>
  )
}
