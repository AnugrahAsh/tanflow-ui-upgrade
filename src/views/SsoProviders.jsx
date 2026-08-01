import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import AddIdpWizard, { SP } from '../components/AddIdpWizard.jsx'

const IDPS = [
  { name: '10.0.0.49 SAML', issuer: 'https://10.0.0.49:8443/realms/Tanflow', binding: 'HTTP-Redirect', signins: '8,412', enabled: true },
  { name: 'demo.tanflow.com SSO Engine', issuer: 'https://demo.tanflow.com/realms/Demo_1', binding: 'HTTP-Redirect', signins: '1,196', enabled: true },
]
const HOW = [
  ['User picks a provider', 'On the login page they choose an enabled IdP instead of entering a password.'],
  ['Redirect to the IdP', 'TanFlow issues a signed AuthnRequest and hands the browser to the IdP login URL.'],
  ['Assertion returns', 'The IdP posts a signed SAML assertion to the ACS URL; TanFlow verifies the signature against the IdP certificate.'],
  ['Session established', 'Claims map to a TanFlow identity, MFA policy applies, and the privileged session is authorized.'],
]

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
  const toggle = (i) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, enabled: !r.enabled } : r)))
  const shown = rows.filter((r) => !q || (r.name + r.issuer).toLowerCase().includes(q.toLowerCase()))

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
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Service Provider identity</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>Register these values at every identity provider</div>
          <CopyRow label="SP entity ID" value={SP.entityId} toast={toast} />
          <CopyRow label="Assertion Consumer Service (ACS) URL" value={SP.acs} toast={toast} />
          <CopyRow label="Single Logout (SLO) callback" value={SP.slo} toast={toast} />
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Download', 'sp-certificate.cer downloaded (demo).')}><Icon name="download" size={13} />Download SP certificate</button>
        </div></div>

        <div className="card"><div className="card-pad">
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>How SSO sign-in works</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>SP-initiated SAML flow through the gateway</div>
          {HOW.map(([t, d], i) => (
            <div key={t} className="hrow" style={{ gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < HOW.length - 1 ? '1px solid var(--hair)' : 'none' }}>
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
