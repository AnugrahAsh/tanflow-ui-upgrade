import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field } from './formKit.jsx'

const AUTH_HELP = {
  NONE: 'No authentication. The gateway accepts unauthenticated requests.',
  BASIC: 'HTTP Basic auth — a username & password are sent with every request.',
  BEARER: 'A static bearer token is sent in the Authorization header.',
  API_KEY: 'An API key is sent as a header or query parameter.',
  OAUTH2: 'A short-lived token is fetched from the OAuth endpoint below before each send.',
}

// Section wrapper: bold title, hairline rule, optional intro paragraph, then content.
function Section({ title, intro, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>{title}</div>
      {intro && <div style={{ fontSize: '12.25px', color: 'var(--mut)', lineHeight: 1.55, margin: '12px 0 0', maxWidth: 860 }}>{intro}</div>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  )
}
const Grid = ({ cols, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '18px 20px', alignItems: 'start' }}>{children}</div>
)
const ToggleField = ({ label, on, setOn, text }) => (
  <Field label={label}>
    <label className="hrow" style={{ gap: 10, cursor: 'pointer', alignItems: 'center', height: 30 }}>
      <span className={`toggle ${on ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setOn((v) => !v) }} />
      <span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>{text}</span>
    </label>
  </Field>
)

export default function CreateSmsProvider() {
  const { go, toast } = useApp()
  const [f, setF] = useState({
    code: '', name: '', apiUrl: '', method: 'POST', timeout: '30000', retry: '0', serializer: 'json',
    authType: 'NONE', ruleType: 'HTTP_STATUS', codes: '200, 201, 202',
    algorithm: '', keyRef: '', tokenEndpoint: '', tokenPayload: '', expiry: '60',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const [encEnabled, setEncEnabled] = useState(false)
  const [reqToken, setReqToken] = useState(false)
  const [enabled, setEnabled] = useState(true)

  const valid = f.code.trim() && f.name.trim() && f.apiUrl.trim()
  const create = () => {
    toast('ok', 'Provider created', `${f.name || 'SMS provider'} saved${enabled ? ' and enabled' : ''} (demo).`)
    go('sms-management')
  }
  const dim = (off) => (off ? { opacity: 0.5 } : undefined)

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('sms-management')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="Add SMS Provider" sub="Configure how PAM talks to your SMS gateway. Sensitive fields like API keys are encrypted at rest." />

      <div className="card">
        <div className="card-pad">
          {/* BASICS */}
          <Section title="Basics">
            <Grid cols="1fr 1fr">
              <Field label="PROVIDER CODE" required help="Unique slug — used as a stable identifier in logs.">
                <input className="inp" placeholder="e.g. msg91-primary" value={f.code} onChange={set('code')} />
              </Field>
              <Field label="PROVIDER NAME" required>
                <input className="inp" placeholder="e.g. MSG91 (Primary)" value={f.name} onChange={set('name')} />
              </Field>
            </Grid>
            <div style={{ marginTop: 18 }}>
              <Grid cols="2fr 1fr">
                <Field label="API URL" required>
                  <input className="inp" placeholder="https://api.example.com/v5/sms" value={f.apiUrl} onChange={set('apiUrl')} />
                </Field>
                <Field label="HTTP METHOD">
                  <select className="sel" value={f.method} onChange={set('method')}>{['POST', 'GET', 'PUT', 'PATCH', 'DELETE'].map((m) => <option key={m}>{m}</option>)}</select>
                </Field>
              </Grid>
            </div>
            <div style={{ marginTop: 18 }}>
              <Grid cols="1fr 1fr 1fr">
                <Field label="TIMEOUT (MS)"><input className="inp" value={f.timeout} onChange={set('timeout')} /></Field>
                <Field label="RETRY COUNT" help="Retries on transport failure only (not HTTP errors).">
                  <input className="inp" value={f.retry} onChange={set('retry')} />
                </Field>
                <Field label="SERIALIZER">
                  <select className="sel" value={f.serializer} onChange={set('serializer')}>{['json', 'form', 'xml', 'multipart'].map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
              </Grid>
            </div>
          </Section>

          {/* AUTHENTICATION */}
          <Section title="Authentication">
            <Grid cols="1fr 1fr">
              <Field label="AUTH TYPE">
                <select className="sel" value={f.authType} onChange={set('authType')}>{Object.keys(AUTH_HELP).map((a) => <option key={a}>{a}</option>)}</select>
              </Field>
              <div />
            </Grid>
            <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 12 }}>{AUTH_HELP[f.authType]}</div>
          </Section>

          {/* RESPONSE SUCCESS RULE */}
          <Section title="Response Success Rule" intro="How to tell whether the gateway accepted the message. PAM applies this rule to the gateway’s HTTP response to decide whether the row in sms_logs gets marked Sent or Failed.">
            <Grid cols="1fr 1fr">
              <Field label="RULE TYPE">
                <select className="sel" value={f.ruleType} onChange={set('ruleType')}>{['HTTP_STATUS', 'BODY_CONTAINS', 'JSON_PATH', 'REGEX'].map((r) => <option key={r}>{r}</option>)}</select>
              </Field>
              <Field label="SUCCESS STATUS CODES (COMMA-SEPARATED)">
                <input className="inp" value={f.codes} onChange={set('codes')} placeholder="200, 201, 202" />
              </Field>
            </Grid>
          </Section>

          {/* PAYLOAD ENCRYPTION */}
          <Section title="Payload Encryption">
            <Grid cols="1fr 1fr 1fr">
              <ToggleField label="ENABLED" on={encEnabled} setOn={setEncEnabled} text="Encrypt payload before send" />
              <Field label="ALGORITHM">
                <select className="sel" value={f.algorithm} onChange={set('algorithm')} disabled={!encEnabled} style={dim(!encEnabled)}>
                  <option value="">—</option>{['AES-256-GCM', 'AES-256-CBC', 'RSA-OAEP'].map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="KEY REFERENCE" help="Env-var name (prefix with env:) or an encrypted blob.">
                <input className="inp" placeholder="env:SMS_AES_KEY or enc_v1:…" value={f.keyRef} onChange={set('keyRef')} disabled={!encEnabled} style={dim(!encEnabled)} />
              </Field>
            </Grid>
            <div style={{ fontSize: '11px', color: 'var(--mut)', marginTop: 8 }}>Required for some govt-style gateways (BESCOM, etc.).</div>
          </Section>

          {/* OAUTH TOKEN */}
          <Section title="OAuth Token (optional)">
            <Grid cols="1fr 1fr">
              <ToggleField label="REQUIRES TOKEN" on={reqToken} setOn={setReqToken} text="Acquire token before each send" />
              <Field label="TOKEN ENDPOINT">
                <input className="inp" placeholder="https://api.example.com/oauth/token" value={f.tokenEndpoint} onChange={set('tokenEndpoint')} disabled={!reqToken} style={dim(!reqToken)} />
              </Field>
            </Grid>
            <div style={{ marginTop: 18 }}>
              <Grid cols="2fr 1fr">
                <Field label="TOKEN PAYLOAD (JSON)" help="Body sent to the token endpoint (e.g. client_id + client_secret).">
                  <textarea className="inp" rows={4} placeholder="{}" value={f.tokenPayload} onChange={set('tokenPayload')} disabled={!reqToken}
                    style={{ height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5, fontFamily: 'var(--mono)', ...dim(!reqToken) }} />
                </Field>
                <Field label="EXPIRY BUFFER (S)" help="Refresh this many seconds before the token actually expires.">
                  <input className="inp" value={f.expiry} onChange={set('expiry')} disabled={!reqToken} style={dim(!reqToken)} />
                </Field>
              </Grid>
            </div>
          </Section>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginTop: 16, padding: '13px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-sm)' }}>
        <label className="hrow" style={{ gap: 10, cursor: 'pointer' }}>
          <span className={`toggle ${enabled ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setEnabled((v) => !v) }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Provider Enabled</span>
        </label>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec" onClick={() => go('sms-management')}>Cancel</button>
          <button className="btn btn-pri" disabled={!valid} onClick={create} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="check" />Create Provider</button>
        </div>
      </div>
    </>
  )
}
