import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import AddIdpWizard from '../components/AddIdpWizard.jsx'

const IDPS = [
  { name: '10.0.0.49 SAML', issuer: 'https://10.0.0.49:8443/realms/Tanflow', binding: 'HTTP-Redirect', signins: '8,412', enabled: true },
  { name: 'demo.tanflow.com SSO Engine', issuer: 'https://demo.tanflow.com/realms/Demo_1', binding: 'HTTP-Redirect', signins: '1,196', enabled: true },
]
const SSO_CONTENT = {
  saml: {
    identitySub: 'Register these Service Provider values at your SAML identity provider',
    flowSub: 'SP-initiated SAML flow through the gateway',
    fields: [['SP entity ID', 'TANFLOW_PAM_DEMO1'], ['Assertion Consumer Service (ACS) URL', 'https://pam1.tanflow.com/apis/api/sso/assert'], ['Single Logout (SLO) callback', 'https://pam1.tanflow.com/apis/api/sso/logout/callback']],
    steps: [['User picks a provider', 'On the login page they choose an enabled IdP instead of entering a password.'], ['Redirect to the IdP', 'Tanflow issues a signed AuthnRequest and hands the browser to the IdP login URL.'], ['Assertion returns', 'The IdP posts a signed SAML assertion to the ACS URL; Tanflow verifies the signature against the IdP certificate.'], ['Session established', 'Claims map to a Tanflow identity, and the privileged session is authorized. The IdP owns MFA for SSO sign-ins.']],
  },
  oidc: {
    identitySub: 'Register these redirect URIs on the OAuth 2.0 web client at your identity provider',
    flowSub: 'Authorization-code flow with PKCE through the gateway',
    fields: [['Redirect URI (authorization callback)', 'https://pam1.tanflow.com/apis/api/sso/oidc/callback'], ['Post-logout redirect URI', 'https://pam1.tanflow.com/pam/auth/login?logged_out=true']],
    steps: [['User picks a provider', 'On the login page they choose an enabled IdP instead of entering a password.'], ['Redirect to the IdP', 'Tanflow sends an authorization request (code flow with PKCE) and hands the browser to the IdP.'], ['Authorization code returns', 'The IdP redirects a one-time code to the shared callback; Tanflow exchanges it for an ID token and verifies the signature against the IdP’s JWKS.'], ['Session established', 'The username claim maps to a Tanflow user, and the privileged session is authorized. The IdP owns MFA for SSO sign-ins.']],
  },
}

function CopyRow({ label, value, toast }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input className="inp mono" value={value} readOnly style={{ paddingRight: 36 }} />
        <button type="button" onClick={() => { try { navigator.clipboard?.writeText(value) } catch { /* ignore */ } toast('ok', 'Copied', 'Value copied to clipboard.') }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', display: 'inline-flex' }} aria-label="Copy"><Icon name="copy" size={14} /></button>
      </div>
    </div>
  )
}

export default function SsoProviders() {
  const { toast } = useApp()
  const [q, setQ] = useState('')
  const [wizard, setWizard] = useState(false)
  const [rows, setRows] = useState(IDPS)
  const [protocol, setProtocol] = useState('saml')
  const toggle = (i) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, enabled: !r.enabled } : r)))
  const shown = rows.filter((r) => !q || (r.name + r.issuer).toLowerCase().includes(q.toLowerCase()))
  const content = SSO_CONTENT[protocol]
  const protocolTabs = <div className="hrow" style={{ gap: 4, borderBottom: '1px solid var(--line)', marginBottom: 16 }}><button className="btn" style={{ borderRadius: 0, borderBottom: protocol === 'saml' ? '2px solid var(--accent)' : '2px solid transparent', color: protocol === 'saml' ? 'var(--ink)' : 'var(--mut)', fontWeight: 650 }} onClick={() => setProtocol('saml')}>SAML 2.0</button><button className="btn" style={{ borderRadius: 0, borderBottom: protocol === 'oidc' ? '2px solid var(--accent)' : '2px solid transparent', color: protocol === 'oidc' ? 'var(--ink)' : 'var(--mut)', fontWeight: 650 }} onClick={() => setProtocol('oidc')}>OpenID Connect (OAuth 2.0)</button></div>

  return (
    <>
      <PageHead
        title="SSO Providers"
        sub="Register SAML identity providers for single sign-on. Enabled providers appear as sign-in options on the login page."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'SP metadata', 'sp-metadata.xml downloaded (demo).')}><Icon name="download" />SP metadata</button>
            <button className="btn btn-pri" onClick={() => setWizard(true)}><Icon name="plus" />Add Identity Provider</button>
          </>
        }
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Identity providers" icon="sso" val="2" foot="all SAML 2.0" />
        <KpiTile label="Enabled on login" icon="shieldCheck" val="2" foot="0 draft · shown as sign-in options" />
        <KpiTile label="SSO sign-ins (24h)" icon="activity" val="1.24" unit="K" delta={8} foot="p95 issuance 210ms" spark={[52, 48, 55, 50, 44, 47, 58, 62, 54, 60]} />
        <KpiTile label="Signing certs" icon="lock" val="2" foot="0 expiring < 60 days" />
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 260 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search providers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-sec btn-sm" style={{ marginLeft: 8, color: 'var(--accent)', borderColor: 'var(--accent-line)' }}><Icon name="filter" size={13} />Protocol: SAML 2.0</button>
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shown.length} identity providers</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Type</th><th>IdP issuer / entity ID</th><th>Binding</th><th className="td-right">Sign-ins 30d</th><th style={{ width: 70 }}>Enabled</th><th style={{ width: 70 }}>Actions</th></tr></thead>
            <tbody>
              {shown.map((r) => {
                const i = rows.indexOf(r)
                return (
                  <tr key={r.name}>
                    <td>
                      <div className="hrow" style={{ gap: 11 }}>
                        <span style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="shieldCheck" size={15} style={{ color: 'var(--warn-core)' }} /></span>
                        <div><div className="td-main">{r.name}</div><div className="td-sub">Live on login page</div></div>
                      </div>
                    </td>
                    <td><span className="tag">SAML</span></td>
                    <td className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{r.issuer}</td>
                    <td><span className="tag">{r.binding}</span></td>
                    <td className="td-right td-num">{r.signins}</td>
                    <td><span className={`toggle ${r.enabled ? 'on' : ''}`} onClick={() => toggle(i)} /></td>
                    <td><div className="row-actions">
                      <button className="mini-btn" onClick={() => toast('ok', r.name, 'Edit IdP config, bindings & certificate (demo).')}><Icon name="edit" size={14} /></button>
                      <button className="mini-btn" onClick={() => toast('ok', r.name, 'Open IdP metadata endpoint (demo).')}><Icon name="external" size={14} /></button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
          <Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: TanFlow presents a single Service Provider identity to every IdP — register the SP values once and each provider reuses them.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16, alignItems: 'start' }}>
        <div className="card"><div className="card-pad">
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Application identity</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>{content.identitySub}</div>
          {protocolTabs}
          {content.fields.map(([label, value]) => <CopyRow key={label} label={label} value={value} toast={toast} />)}
          {protocol === 'saml' ? <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Download', 'sp-certificate.cer downloaded (demo).')}><Icon name="download" size={13} />Download SP certificate</button> : <div style={{ fontSize: '12px', color: 'var(--mut)', lineHeight: 1.55 }}>The same two URIs serve every OIDC provider. The client must be confidential (client authentication on) and grant the authorization-code flow.</div>}
        </div></div>

        <div className="card"><div className="card-pad">
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>How SSO sign-in works</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>{content.flowSub}</div>
          {protocolTabs}
          {content.steps.map(([t, d], i) => (
            <div key={t} className="hrow" style={{ gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < content.steps.length - 1 ? '1px solid var(--hair)' : 'none' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>
              <div><div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{t}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 2, lineHeight: 1.5 }}>{d}</div></div>
            </div>
          ))}
        </div></div>
      </div>

      {wizard && <AddIdpWizard onClose={() => setWizard(false)} />}
    </>
  )
}
