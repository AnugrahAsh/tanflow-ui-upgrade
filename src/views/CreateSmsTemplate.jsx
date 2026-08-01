import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field } from './formKit.jsx'

const PROVIDERS = ['Bitchief (BulkSMS Admin) (bts)', 'Twilio (twilio)', 'Infobip (infobip)', 'AWS SNS (aws-sns)', 'MSG91 (msg91)']
const METHODS = ['Inherit from provider', 'POST', 'GET', 'PUT', 'PATCH']

const GSM7 = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
const GSM7_EXT = "^{}\\[~]|€"
const detectEncoding = (t) => [...t].every((c) => GSM7.includes(c) || GSM7_EXT.includes(c)) ? 'GSM-7' : 'UCS-2'
const segments = (len, enc) => enc === 'GSM-7' ? (len <= 160 ? 1 : Math.ceil(len / 153)) : (len <= 70 ? 1 : Math.ceil(len / 67))
const render = (body, vars) => body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`))

function Section({ title, intro, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>{title}</div>
      {intro && <div style={{ fontSize: '12.25px', color: 'var(--mut)', lineHeight: 1.55, margin: '12px 0 0', maxWidth: 900 }}>{intro}</div>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  )
}
const ta = { height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.55, fontSize: '12px', whiteSpace: 'pre' }

const DEFAULT_SAMPLE = `{
  "firstname": "Jane",
  "code": "482917",
  "ttl_minutes": "5",
  "username": "jane.doe"
}`

export default function CreateSmsTemplate() {
  const { go, toast } = useApp()
  const [f, setF] = useState({
    provider: PROVIDERS[0], code: '', label: '', method: METHODS[0], apiUrl: '',
    body: 'Hi {{firstname}}, your Tanflow PAM verification code is {{code}}. It expires in {{ttl_minutes}} minute(s). Do not share. -TANFLW',
    sample: DEFAULT_SAMPLE, encoding: 'GSM-7', dltLimit: '',
    dltTemplateId: '', principalId: '', senderId: '',
    headers: '{\n  "Content-Type": "application/json"\n}',
    payload: '{\n  "to": "{{phone}}",\n  "text": "{{message_body}}"\n}',
    successCodes: '200, 201, 202',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const [mappings, setMappings] = useState([])
  const [enabled, setEnabled] = useState(true)

  let vars = {}
  try { vars = JSON.parse(f.sample) } catch { vars = {} }
  const preview = render(f.body, vars)
  const enc = detectEncoding(preview)
  const segs = segments(preview.length, enc)
  const overLimit = f.dltLimit && preview.length > Number(f.dltLimit)

  const valid = f.code.trim() && f.label.trim()
  const create = () => { toast('ok', 'Template created', `${f.label || 'SMS template'} saved${enabled ? ' and enabled' : ''} (demo).`); go('sms-management') }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('sms-management')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="Add SMS Template" sub="Configure the wire payload, the human-readable body, and the DLT compliance metadata." />

      <div className="card"><div className="card-pad">
        {/* BASICS */}
        <Section title="Basics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
            <Field label="PROVIDER" required>
              <select className="sel" value={f.provider} onChange={set('provider')}>{PROVIDERS.map((p) => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="TEMPLATE CODE" required help={<>Code referenced by backend features (e.g. <code>mfa_sms_otp</code> for the OTP send).</>}>
              <input className="inp mono" placeholder="mfa_sms_otp" value={f.code} onChange={set('code')} />
            </Field>
            <Field label="TEMPLATE LABEL" required>
              <input className="inp" placeholder="MFA SMS OTP" value={f.label} onChange={set('label')} />
            </Field>
            <Field label="HTTP METHOD OVERRIDE">
              <select className="sel" value={f.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            </Field>
            <Field label="API URL OVERRIDE" full>
              <input className="inp mono" placeholder="Leave blank to use provider's api_url" value={f.apiUrl} onChange={set('apiUrl')} />
            </Field>
          </div>
        </Section>

        {/* MESSAGE BODY + PREVIEW */}
        <Section title="Message Body + Preview">
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 20, alignItems: 'start' }}>
            <div>
              <Field label="BODY (WITH {{PLACEHOLDERS}})">
                <textarea className="inp mono" rows={4} value={f.body} onChange={set('body')} style={ta} />
              </Field>
              <div style={{ marginTop: 18 }}>
                <Field label="SAMPLE VARIABLES (JSON)" help="Substituted into the preview on the right. Not sent at runtime — these are only for the preview.">
                  <textarea className="inp mono" rows={5} value={f.sample} onChange={set('sample')} style={ta} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginTop: 18 }}>
                <Field label="ENCODING">
                  <select className="sel" value={f.encoding} onChange={set('encoding')}>{['GSM-7', 'UCS-2'].map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
                <Field label="DLT CHARACTER LIMIT" help="When set, the renderer flags messages that exceed this length.">
                  <input className="inp" placeholder="Leave blank for none" value={f.dltLimit} onChange={set('dltLimit')} />
                </Field>
              </div>
            </div>
            <div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>LIVE PREVIEW</label>
                <div style={{ minHeight: 116, padding: '12px 14px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', fontSize: '13px', lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{preview}</div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5, fontSize: '12px', color: 'var(--mut)' }}>
                <div>Length: <b style={{ color: overLimit ? 'var(--bad)' : 'var(--ink-2)' }}>{preview.length}</b>{overLimit && <span style={{ color: 'var(--bad)' }}> — exceeds DLT limit</span>}</div>
                <div>Encoding (detected): <b style={{ color: 'var(--ink-2)' }}>{enc}</b></div>
                <div>Segments: <b style={{ color: 'var(--ink-2)' }}>{segs}</b></div>
              </div>
            </div>
          </div>
        </Section>

        {/* DLT COMPLIANCE */}
        <Section title="DLT Compliance" intro="India’s TRAI-mandated DLT (Distributed Ledger) framework requires every transactional SMS to match a pre-registered template byte-for-byte. The IDs below are issued by your DLT operator (Vi, Jio, Airtel, etc.) at the time of template registration.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 20px' }}>
            <Field label="DLT TEMPLATE ID"><input className="inp mono" placeholder="1407..." value={f.dltTemplateId} onChange={set('dltTemplateId')} /></Field>
            <Field label="PRINCIPAL ENTITY ID"><input className="inp mono" placeholder="1101..." value={f.principalId} onChange={set('principalId')} /></Field>
            <Field label="SENDER ID" help="6-character header (or numeric short code)."><input className="inp mono" placeholder="TANFLW" value={f.senderId} onChange={set('senderId')} /></Field>
          </div>
        </Section>

        {/* WIRE PAYLOAD */}
        <Section title="Wire Payload" intro={<>How the request body looks on the wire. Use <code>{'{{placeholder}}'}</code> tokens — they’re substituted from the dispatch context (which always includes <code>phone</code>, <code>username</code>, <code>code</code>, and anything passed by the calling service like <code>{'{{ttl_minutes}}'}</code>). Backend’s SMSTemplateEngine handles the substitution before serialization.</>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="HEADERS (JSON)"><textarea className="inp mono" rows={4} value={f.headers} onChange={set('headers')} style={ta} /></Field>
            <Field label="PAYLOAD STRUCTURE (JSON)"><textarea className="inp mono" rows={4} value={f.payload} onChange={set('payload')} style={ta} /></Field>
          </div>
          <div style={{ marginTop: 18, maxWidth: 520 }}>
            <Field label="SUCCESS STATUS CODES (COMMA-SEPARATED)" help={<>Used as a fallback when the provider’s <code>response_success_config</code> is unset.</>}>
              <input className="inp mono" value={f.successCodes} onChange={set('successCodes')} />
            </Field>
          </div>
        </Section>

        {/* FIELD MAPPINGS */}
        <div style={{ marginTop: 30 }}>
          <div className="hrow" style={{ justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)' }}>Field Mappings</div>
            <button className="btn btn-sec btn-sm" onClick={() => setMappings((m) => [...m, { field: 'phone', transform: 'add91Prefix' }])}><Icon name="plus" size={13} />Add Mapping</button>
          </div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', lineHeight: 1.55, margin: '12px 0 0', maxWidth: 900 }}>
            Per-field transforms applied to the dispatch context BEFORE placeholder substitution. Use <code>add91Prefix</code> on a phone field to convert <code>9999999999</code> → <code>919999999999</code> for Indian gateways that don’t accept a bare 10-digit number.
          </div>
          {mappings.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--faint)', marginTop: 14 }}>No mappings — fields pass through unchanged.</div>
          ) : (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mappings.map((m, i) => (
                <div key={i} className="hrow" style={{ gap: 12 }}>
                  <input className="inp mono" style={{ maxWidth: 220 }} value={m.field} onChange={(e) => setMappings((ms) => ms.map((x, idx) => idx === i ? { ...x, field: e.target.value } : x))} placeholder="field name" />
                  <select className="sel" style={{ maxWidth: 240 }} value={m.transform} onChange={(e) => setMappings((ms) => ms.map((x, idx) => idx === i ? { ...x, transform: e.target.value } : x))}>
                    {['add91Prefix', 'stripNonDigits', 'uppercase', 'lowercase', 'trim'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <button className="mini-btn danger" onClick={() => setMappings((ms) => ms.filter((_, idx) => idx !== i))}><Icon name="trash" size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div></div>

      {/* FOOTER BAR */}
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginTop: 16, padding: '13px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-sm)' }}>
        <label className="hrow" style={{ gap: 10, cursor: 'pointer' }}>
          <span className={`toggle ${enabled ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setEnabled((v) => !v) }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Template Enabled</span>
        </label>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec" onClick={() => go('sms-management')}>Cancel</button>
          <button className="btn btn-pri" disabled={!valid} onClick={create} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="check" />Create Template</button>
        </div>
      </div>
    </>
  )
}
