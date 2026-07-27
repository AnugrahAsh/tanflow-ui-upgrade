import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, StatusBadge, IntLogo, Legend } from '../components/primitives.jsx'
import { SegBar } from '../components/charts/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import { fmt } from '../lib/format.js'
import { APPS_SSO } from '../data/mockData.js'

const PARTNERS = [
  ['Meridian Insurance (subsidiary)', 'SAML · inbound · 2,140 identities', 'Healthy'],
  ['AuditCo LLP', 'OIDC · outbound · scoped auditor access', 'Healthy'],
  ['Temenos Managed Services', 'SAML · inbound · 48 engineers', 'Healthy'],
  ['Gov Regulator Portal', 'eIDAS bridge · outbound', 'Degraded'],
]

export default function Sso() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Single Sign-On"
        sub="One identity plane for every application — SAML 2.0, OIDC, WS-Fed and header-based legacy apps behind the same policy engine."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />IdP metadata</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Register application', 'Wizard: pick protocol, upload SP metadata, map claims (demo).')}><Icon name="plus" />Register app</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Federated applications" icon="sso" val="142" delta={6} foot="8 added this quarter" />
        <KpiTile label="SSO sign-ins (24h)" icon="activity" val="96.4" unit="K" foot="p95 issuance 210ms" spark={wave(12, 40, 18, 29)} />
        <KpiTile label="IdP availability (30d)" icon="shieldCheck" val="99.99" unit="%" foot="multi-region active-active" />
        <KpiTile label="Signing certs expiring < 60d" icon="warnTri" val="2" foot="auto-rollover scheduled" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search applications…" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Protocol: All</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Application</th><th>Protocol</th><th className="td-right">Assigned users</th><th>MFA policy</th><th>30d availability</th><th>Status</th><th style={{ width: 88 }} /></tr></thead>
            <tbody>
              {APPS_SSO.map((a) => (
                <tr key={a.n} onClick={() => toast('ok', a.n, 'SP config, claims mapping, cert chain (demo).')}>
                  <td><div className="cell-user"><IntLogo item={a} size={28} /><span className="td-main">{a.n}</span></div></td>
                  <td><span className="tag">{a.proto}</span></td>
                  <td className="td-right td-num">{fmt(a.users)}</td>
                  <td>{a.mfa === 'Required' ? <Badge tone="acc" label="Always" dot={false} /> : <Badge tone="mut" label="Risk-based" dot={false} />}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{a.last}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="eye" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn"><Icon name="external" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>8 of 142 applications</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">…</button><button className="pg-btn">18</button></div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <CardHeader title="Token issuance by protocol" sub="Last 24 hours" />
          <div className="card-pad">
            <SegBar h={12} segs={[{ n: 'SAML 2.0', v: 52400, c: '#2a78d6' }, { n: 'OIDC / OAuth2', v: 31800, c: '#1baf7a' }, { n: 'WS-Fed', v: 8400, c: '#eda100' }, { n: 'Header / legacy', v: 3800, c: '#4a3aa7' }]} />
            <div style={{ marginTop: 12 }}><Legend items={[{ c: '#2a78d6', n: 'SAML 54%' }, { c: '#1baf7a', n: 'OIDC 33%' }, { c: '#eda100', n: 'WS-Fed 9%' }, { c: '#4a3aa7', n: 'Legacy 4%' }]} /></div>
            <div className="divider" />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.55 }}>Legacy header-based apps down from 11% → 4% this year. Two remaining apps are scheduled for OIDC migration in Q4.</div>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Federation partners" sub="External IdPs & B2B trust" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
            {PARTNERS.map((p) => (
              <div className="hrow" key={p[0]} style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p[0]}</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{p[1]}</div></div>
                <StatusBadge status={p[2]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
