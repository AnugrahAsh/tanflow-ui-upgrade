import { useState, Fragment } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

// Service Provider identity — a single SP is presented to every IdP, so these
// values are shared between the SSO Providers page and this wizard.
export const SP = {
  entityId: 'TANFLOW_PAM_DEMO1',
  acs: 'https://pam1.tanflow.com/apis/api/sso/assert',
  slo: 'https://pam1.tanflow.com/apis/api/sso/logout/callback',
  cert: `-----BEGIN CERTIFICATE-----
MIlCnzCCAycCBgS/89ngjANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhCaXRj
aGIzJAeFwOyNDExMDYwNDQ4NTVaFw0zNDExMDYwNDUwMzVaMBMxETAPBgNVBAMM
CEJpdGNoNGaWDdbnYvMBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIlBgKCAQEA2y3q3Mrn5
CRhHnb0WuJb0rvcG8XPVkhG4C5xLE+TLNwVGrQS+HoJPKrK6IbGg8g7oB7
TYV17qf31ClXZDqI AQJEyFls6vHBIRVnS9kS3wbDq4G/FT+3b657lIteN6wk+kUh
-----END CERTIFICATE-----`,
  oidcRedirect: 'https://pam1.tanflow.com/apis/api/sso/oidc/callback',
  oidcPostLogout: 'https://pam1.tanflow.com/pam/auth/login?logged_out=true',
}

const NAMEID = ['Unspecified (SAML 1.1)', 'Email address', 'Persistent', 'Transient', 'X.509 Subject Name']
const BINDINGS = ['HTTP-Redirect', 'HTTP-POST']

function CopyField({ label, value, toast }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input className="inp mono" value={value} readOnly style={{ paddingRight: 36 }} />
        <button type="button" onClick={() => { try { navigator.clipboard?.writeText(value) } catch { /* ignore */ } toast('ok', 'Copied', 'Value copied to clipboard.') }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', display: 'inline-flex' }} aria-label="Copy"><Icon name="copy" size={14} /></button>
      </div>
    </div>
  )
}
const Check = ({ label, checked, onChange, sub }) => (
  <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer', padding: '4px 0' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--accent)', width: 16, height: 16, marginTop: 1, flex: 'none' }} />
    <span><span style={{ fontSize: '13px', fontWeight: 550, color: 'var(--ink)' }}>{label}</span>
      {sub && <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{sub}</span>}</span>
  </label>
)

export default function AddIdpWizard({ onClose }) {
  const { toast } = useApp()
  const [step, setStep] = useState(0)
  const [protocol, setProtocol] = useState('saml')
  const [idp, setIdp] = useState({ name: '', entityId: '', loginUrl: '', logoutUrl: '', cert: '', nameId: NAMEID[0], ssoBinding: 'HTTP-Redirect', issuerUrl: '', clientId: '', clientSecret: '', scopes: 'openid profile email', usernameClaim: 'preferred_username' })
  const [flags, setFlags] = useState({ sign: true, force: false, requireSigned: true, enable: false })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const set = (k) => (e) => setIdp((p) => ({ ...p, [k]: e.target.value }))
  const flag = (k) => (e) => setFlags((p) => ({ ...p, [k]: e.target.checked }))

  const isSaml = protocol === 'saml'
  const steps = ['Application Details', 'Identity Provider Details', isSaml ? 'SAML Properties' : 'OIDC Properties']

  const step2Valid = isSaml
    ? idp.name.trim() && idp.entityId.trim() && idp.loginUrl.trim() && idp.cert.trim()
    : idp.name.trim() && idp.issuerUrl.trim() && idp.clientId.trim() && idp.clientSecret.trim()
  const next = () => setStep((s) => Math.min(2, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const save = () => { toast('ok', 'Identity provider added', `${idp.name || 'New IdP'} registered${flags.enable ? ' and enabled on login' : ''} (demo).`); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(760px, 97vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad" style={{ overflowY: 'auto' }}>
          {/* header */}
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sso" size={18} style={{ color: 'var(--warn-core)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Add Identity Provider</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Register a new SAML or OpenID Connect identity provider.</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          {/* step indicator */}
          <div className="hrow" style={{ marginBottom: 22 }}>
            {steps.map((s, i) => (
              <Fragment key={i}>
                <div className="hrow" style={{ gap: 9, flex: 'none' }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 700, flex: 'none', background: i < step ? 'var(--ok)' : i === step ? 'var(--accent)' : 'var(--surface-2)', color: i <= step ? '#fff' : 'var(--mut)', border: i > step ? '1px solid var(--line-2)' : 'none' }}>
                    {i < step ? <Icon name="check" size={14} /> : i + 1}
                  </span>
                  <span style={{ fontSize: '12.75px', fontWeight: 600, color: i === step ? 'var(--accent)' : i < step ? 'var(--ink)' : 'var(--mut)' }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--line)', margin: '0 12px' }} />}
              </Fragment>
            ))}
          </div>

          {/* STEP 1 — Application Details */}
          {step === 0 && (
            <>
              {/* Protocol selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <label style={{ display: 'flex', gap: 10, padding: '14px 16px', border: `1.5px solid ${protocol === 'saml' ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', background: protocol === 'saml' ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="radio" name="proto" checked={protocol === 'saml'} onChange={() => setProtocol('saml')} style={{ accentColor: 'var(--accent)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)' }}>SAML 2.0</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.45 }}>Metadata exchange with signed assertions. Register the SP values below at your IdP.</div>
                  </div>
                </label>
                <label style={{ display: 'flex', gap: 10, padding: '14px 16px', border: `1.5px solid ${protocol === 'oidc' ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', background: protocol === 'oidc' ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="radio" name="proto" checked={protocol === 'oidc'} onChange={() => setProtocol('oidc')} style={{ accentColor: 'var(--accent)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)' }}>OpenID Connect (OAuth 2.0)</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.45 }}>Authorization-code flow with PKCE. Register a web client at your IdP and paste its credentials here.</div>
                  </div>
                </label>
              </div>

              <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginBottom: 16, lineHeight: 1.5 }}>Pick how this identity provider signs users in. Both kinds appear side by side on the login page.</div>

              {/* SAML SP values */}
              {isSaml && (
                <>
                  <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 18 }}>
                    <input type="radio" checked readOnly style={{ accentColor: 'var(--accent)', width: 14, height: 14, marginTop: 2, flex: 'none' }} />
                    <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Register these Service Provider (SP) values at your identity provider — most IdPs accept the downloadable SP metadata file directly. Tanflow PAM presents a single SP identity, so these values are the same for every identity provider you add.</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <CopyField label="SP Entity ID" value={SP.entityId} toast={toast} />
                    <CopyField label="Assertion Consumer Service (ACS) URL" value={SP.acs} toast={toast} />
                    <CopyField label="Single Logout (SLO) Callback URL" value={SP.slo} toast={toast} />
                    <div className="field">
                      <label>SP CERTIFICATE</label>
                      <textarea className="inp mono" value={SP.cert} readOnly rows={5} style={{ height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, fontSize: '11px', whiteSpace: 'pre' }} />
                      <div className="hrow" style={{ gap: 8, marginTop: 10 }}>
                        <button className="btn btn-sec btn-sm" onClick={() => { try { navigator.clipboard?.writeText(SP.cert) } catch { /* ignore */ } toast('ok', 'Copied', 'SP certificate copied.') }}><Icon name="copy" size={13} />Copy</button>
                        <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Download', 'sp-certificate.cer downloaded (demo).')}><Icon name="download" size={13} />Download .cer</button>
                      </div>
                    </div>
                    <button className="btn btn-sec btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => toast('ok', 'Download', 'sp-metadata.xml downloaded (demo).')}><Icon name="download" size={13} />Download SP Metadata (XML)</button>
                  </div>
                </>
              )}

              {/* OIDC redirect URIs */}
              {!isSaml && (
                <>
                  <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 18 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                    <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Create an <strong>OpenID Connect / OAuth 2.0 web client</strong> at your identity provider and register these URLs on it. They are the same for every OIDC provider you add here.</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <CopyField label="Redirect URI (authorization callback)" value={SP.oidcRedirect} toast={toast} />
                    <CopyField label="Post-logout Redirect URI" value={SP.oidcPostLogout} toast={toast} />
                    <div style={{ fontSize: '12px', color: 'var(--mut)', lineHeight: 1.55 }}>Most IdP consoles call these the web client's redirect URI and post-logout redirect URI. The client must be <strong style={{ color: 'var(--ink-2)' }}>confidential</strong> (client authentication on) and grant the <code style={{ fontSize: '11px', padding: '1px 5px', background: 'var(--surface-2)', borderRadius: 3, color: 'var(--accent)' }}>authorization_code</code> flow.</div>
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 2 — Identity Provider Details (SAML) */}
          {step === 1 && isSaml && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>NAME<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp" placeholder="e.g. Corporate Okta" value={idp.name} onChange={set('name')} />
                <div className="f-help">Shown to users on the login page.</div>
              </div>
              <div className="field">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', border: '1px dashed var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: '12.5px', color: 'var(--mut)' }}>
                  <Icon name="upload" size={15} /><span className="btn btn-sec btn-sm" style={{ pointerEvents: 'none' }}>Browse...</span><span>Optional: upload the IdP metadata XML to prefill the fields below.</span>
                  <input type="file" accept=".xml" style={{ display: 'none' }} onChange={() => toast('ok', 'Metadata parsed', 'Fields prefilled from IdP metadata (demo).')} />
                </label>
              </div>
              <div className="field">
                <label>IDP ENTITY ID / ISSUER<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp mono" placeholder="e.g. https://idp.example.com/realms/corp" value={idp.entityId} onChange={set('entityId')} />
                <div className="f-help">The <code>entityID</code> from the IdP metadata — it identifies which provider an incoming SAML response belongs to.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label>IDP LOGIN URL<span style={{ color: 'var(--bad)' }}> *</span></label>
                  <input className="inp mono" placeholder="https://idp.example.com/sso/saml" value={idp.loginUrl} onChange={set('loginUrl')} />
                </div>
                <div className="field">
                  <label>IDP LOGOUT URL</label>
                  <input className="inp mono" placeholder="https://idp.example.com/slo/saml" value={idp.logoutUrl} onChange={set('logoutUrl')} />
                </div>
              </div>
              <div className="field">
                <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ margin: 0 }}>IDP CERTIFICATE<span style={{ color: 'var(--bad)' }}> *</span></label>
                  <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Upload', 'Certificate file uploaded (demo).')}><Icon name="upload" size={13} />Upload certificate file...</button>
                </div>
                <textarea className="inp mono" placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"} value={idp.cert} onChange={set('cert')} rows={6} style={{ height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, fontSize: '11px', whiteSpace: 'pre' }} />
              </div>
            </div>
          )}

          {/* STEP 2 — Identity Provider Details (OIDC) */}
          {step === 1 && !isSaml && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>NAME<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp" placeholder="e.g. Corporate SSO" value={idp.name} onChange={set('name')} />
                <div className="f-help">Shown to users on the login page.</div>
              </div>
              <div className="field">
                <label>ISSUER URL<span style={{ color: 'var(--bad)' }}> *</span></label>
                <div className="hrow" style={{ gap: 10 }}>
                  <input className="inp mono" placeholder="e.g. https://idp.example.com" value={idp.issuerUrl} onChange={set('issuerUrl')} style={{ flex: 1 }} />
                  <button className="btn btn-sec btn-sm" style={{ flex: 'none', whiteSpace: 'nowrap' }} onClick={() => toast('ok', 'Discovery', 'Fetched .well-known/openid-configuration (demo).')}><Icon name="download" size={13} />Fetch discovery</button>
                </div>
                <div className="f-help">The issuer from your IdP's well-known configuration — the base URL before <code style={{ fontSize: '11px', padding: '1px 5px', background: 'var(--surface-2)', borderRadius: 3, color: 'var(--accent)' }}>/.well-known/openid-configuration</code>.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label>CLIENT ID<span style={{ color: 'var(--bad)' }}> *</span></label>
                  <input className="inp" placeholder="e.g. tanflow-pam" value={idp.clientId} onChange={set('clientId')} />
                </div>
                <div className="field">
                  <label>CLIENT SECRET<span style={{ color: 'var(--bad)' }}> *</span></label>
                  <input className="inp" type="password" placeholder="Paste the client secret" value={idp.clientSecret} onChange={set('clientSecret')} />
                  <div className="f-help">Stored encrypted; never shown again after saving.</div>
                </div>
              </div>
              <div>
                <button type="button" className="hrow" onClick={() => setAdvancedOpen(!advancedOpen)} style={{ gap: 8, background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', borderTop: '1px solid var(--line)', width: '100%' }}>
                  <span style={{ fontSize: '10px', transition: 'transform .15s', transform: advancedOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                  Advanced: endpoint overrides
                </button>
                {advancedOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 0 0' }}>
                    <div className="field">
                      <label>AUTHORIZATION ENDPOINT</label>
                      <input className="inp mono" placeholder="Auto-discovered from issuer" />
                      <div className="f-help">Override only if your IdP does not publish a standard discovery document.</div>
                    </div>
                    <div className="field">
                      <label>TOKEN ENDPOINT</label>
                      <input className="inp mono" placeholder="Auto-discovered from issuer" />
                    </div>
                    <div className="field">
                      <label>USERINFO ENDPOINT</label>
                      <input className="inp mono" placeholder="Auto-discovered from issuer" />
                    </div>
                    <div className="field">
                      <label>JWKS URI</label>
                      <input className="inp mono" placeholder="Auto-discovered from issuer" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — SAML Properties */}
          {step === 2 && isSaml && (
            <>
              <div className="field"><label>NAMEID FORMAT</label>
                <select className="sel" value={idp.nameId} onChange={set('nameId')}>{NAMEID.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="field" style={{ marginTop: 16 }}><label>SSO BINDING</label>
                <select className="sel" value={idp.ssoBinding} onChange={set('ssoBinding')}>{BINDINGS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Check label="Sign AuthnRequests" checked={flags.sign} onChange={flag('sign')} />
                <Check label="Force re-authentication at the IdP on every sign-in" checked={flags.force} onChange={flag('force')} />
                <Check label="Require signed assertions from the IdP" checked={flags.requireSigned} onChange={flag('requireSigned')} />
              </div>
              <div style={{ marginTop: 16 }}>
                <Check label="Enable this identity provider" checked={flags.enable} onChange={flag('enable')} sub="When enabled, this provider appears as a sign-in option on the login page." />
              </div>
            </>
          )}

          {/* STEP 3 — OIDC Properties */}
          {step === 2 && !isSaml && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label>SCOPES</label>
                  <input className="inp" value={idp.scopes} onChange={set('scopes')} />
                  <div className="f-help">Space-separated. <code style={{ fontSize: '11px', padding: '1px 5px', background: 'var(--surface-2)', borderRadius: 3, color: 'var(--accent)' }}>openid</code> is always requested.</div>
                </div>
                <div className="field">
                  <label>USERNAME CLAIM</label>
                  <input className="inp" value={idp.usernameClaim} onChange={set('usernameClaim')} />
                  <div className="f-help">The ID-token claim matched against the PAM username. The user must already exist here — there is no auto-provisioning.</div>
                </div>
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Check label="Force re-authentication at the IdP on every sign-in (prompt=login)" checked={flags.force} onChange={flag('force')} />
              </div>
              <div style={{ marginTop: 16 }}>
                <Check label="Enable this identity provider" checked={flags.enable} onChange={flag('enable')} sub="When enabled, this provider appears as a sign-in option on the login page." />
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          {step > 0 && <button className="btn btn-sec" onClick={back}><Icon name="chevL" />Back</button>}
          {step < 2
            ? <button className="btn btn-pri" onClick={next} disabled={step === 1 && !step2Valid} style={step === 1 && !step2Valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}>Next<Icon name="chevR" /></button>
            : <button className="btn btn-pri" onClick={save}><Icon name="check" />Save Provider</button>}
        </div>
      </div>
    </div>
  )
}
