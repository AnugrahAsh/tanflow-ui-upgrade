import { useState, Fragment } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

// Service Provider identity — a single SP is presented to every IdP, so these
// values are shared between the SSO Providers page and this wizard.
export const SP = {
  entityId: 'Local-PAM-App-SP',
  acs: 'https://pamdev.tanflow.com/apis/api/sso/assert',
  slo: 'https://pamdev.tanflow.com/apis/api/sso/logout/callback',
  cert: `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIEbG9jYWwwDQYJKoZIhvcNAQELBQAwbDELMAkGA1UEBhMC
SU4xEjAQBgNVBAgTCUthcm5hdGFrYTESMBAGA1UEBxMJQmVuZ2FsdXJ1MRAwDgYD
VQQKEwdUYW5mbG93MRQwEgYDVQQLEwtQQU0gQXBwMREwDwYDVQQDEwhTZWN1cml0
-----END CERTIFICATE-----`,
}

const STEPS = ['Service Provider Details', 'Identity Provider Details', 'SAML Properties']
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
  const [idp, setIdp] = useState({ name: '', entityId: '', loginUrl: '', logoutUrl: '', cert: '', nameId: NAMEID[0], ssoBinding: 'HTTP-Redirect', sloBinding: 'HTTP-Redirect' })
  const [flags, setFlags] = useState({ sign: true, force: false, requireSigned: true, enable: true })
  const set = (k) => (e) => setIdp((p) => ({ ...p, [k]: e.target.value }))
  const flag = (k) => (e) => setFlags((p) => ({ ...p, [k]: e.target.checked }))

  const step2Valid = idp.name.trim() && idp.entityId.trim() && idp.loginUrl.trim() && idp.cert.trim()
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
                <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Register a new SAML identity provider.</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          {/* step indicator */}
          <div className="hrow" style={{ marginBottom: 22 }}>
            {STEPS.map((s, i) => (
              <Fragment key={s}>
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

          {/* STEP 1 — SP details */}
          {step === 0 && (
            <>
              <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)', marginBottom: 18 }}>
                <Icon name="sparkle" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
                <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Register these Service Provider (SP) values at your identity provider — most IdPs accept the downloadable SP metadata file directly. TanFlow PAM presents a single SP identity, so these values are the same for every identity provider you add.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <CopyField label="SP entity ID" value={SP.entityId} toast={toast} />
                <CopyField label="Assertion Consumer Service (ACS) URL" value={SP.acs} toast={toast} />
                <CopyField label="Single Logout (SLO) callback URL" value={SP.slo} toast={toast} />
                <div className="field">
                  <label>SP certificate</label>
                  <textarea className="inp mono" value={SP.cert} readOnly rows={5} style={{ height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, fontSize: '11px', whiteSpace: 'pre' }} />
                  <div className="hrow" style={{ gap: 8, marginTop: 10 }}>
                    <button className="btn btn-sec btn-sm" onClick={() => { try { navigator.clipboard?.writeText(SP.cert) } catch { /* ignore */ } toast('ok', 'Copied', 'SP certificate copied.') }}><Icon name="copy" size={13} />Copy</button>
                    <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Download', 'sp-certificate.cer downloaded (demo).')}><Icon name="download" size={13} />Download .cer</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 — IdP details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Name<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp" placeholder="e.g. Corporate Okta" value={idp.name} onChange={set('name')} />
                <div className="f-help">Shown to users on the login page.</div>
              </div>
              <div className="field">
                <label>IdP metadata (optional)</label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', border: '1px dashed var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: '12.5px', color: 'var(--mut)' }}>
                  <Icon name="upload" size={15} />Optional: upload the IdP metadata XML to prefill the fields below.
                  <span className="btn btn-sec btn-sm" style={{ pointerEvents: 'none' }}>Browse…</span>
                  <input type="file" accept=".xml" style={{ display: 'none' }} onChange={() => toast('ok', 'Metadata parsed', 'Fields prefilled from IdP metadata (demo).')} />
                </label>
              </div>
              <div className="field">
                <label>IdP entity ID / issuer<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp mono" placeholder="https://idp.example.com/realms/…" value={idp.entityId} onChange={set('entityId')} />
                <div className="f-help">The <code>entityID</code> from the IdP metadata — it identifies which provider an incoming SAML response belongs to.</div>
              </div>
              <div className="field">
                <label>IdP login URL<span style={{ color: 'var(--bad)' }}> *</span></label>
                <input className="inp mono" placeholder="https://idp.example.com/…/protocol/saml" value={idp.loginUrl} onChange={set('loginUrl')} />
              </div>
              <div className="field">
                <label>IdP logout URL</label>
                <input className="inp mono" placeholder="https://idp.example.com/…/protocol/saml" value={idp.logoutUrl} onChange={set('logoutUrl')} />
              </div>
              <div className="field">
                <label>IdP certificate<span style={{ color: 'var(--bad)' }}> *</span></label>
                <textarea className="inp mono" placeholder="-----BEGIN CERTIFICATE-----" value={idp.cert} onChange={set('cert')} rows={4} style={{ height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, fontSize: '11px', whiteSpace: 'pre' }} />
              </div>
            </div>
          )}

          {/* STEP 3 — SAML properties */}
          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div className="field"><label>NameID format</label>
                  <select className="sel" value={idp.nameId} onChange={set('nameId')}>{NAMEID.map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="field"><label>SSO binding</label>
                  <select className="sel" value={idp.ssoBinding} onChange={set('ssoBinding')}>{BINDINGS.map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="field"><label>SLO binding</label>
                  <select className="sel" value={idp.sloBinding} onChange={set('sloBinding')}>{BINDINGS.map((x) => <option key={x}>{x}</option>)}</select></div>
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Check label="Sign AuthnRequests" checked={flags.sign} onChange={flag('sign')} />
                <Check label="Force re-authentication at the IdP on every sign-in" checked={flags.force} onChange={flag('force')} />
                <Check label="Require signed assertions from the IdP" checked={flags.requireSigned} onChange={flag('requireSigned')} />
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
            : <button className="btn btn-pri" onClick={save}><Icon name="check" />Save Changes</button>}
        </div>
      </div>
    </div>
  )
}
