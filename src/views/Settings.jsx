import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { Badge, Toggle } from '../components/primitives.jsx'

const EditBtn = ({ label = 'Edit' }) => <button className="btn btn-sec btn-sm">{label}</button>

const SECTIONS = {
  org: {
    t: 'Organization',
    rows: [
      ['Organization name', 'Meridian Global Bank — production tenant', <EditBtn key="a" />],
      ['Data residency', 'EU (Frankfurt) primary · Dublin DR — in-region processing guaranteed', <span className="tag" key="a">Contract-pinned</span>],
      ['Custom domain', 'id.meridianbank.com · TLS via managed cert', <Badge tone="ok" label="Verified" key="a" />],
      ['Environments', 'Production · Staging · Sandbox (masked data)', <EditBtn label="Manage" key="a" />],
    ],
  },
  security: {
    t: 'Security defaults',
    rows: [
      ['Admin session timeout', '15 minutes idle · re-auth with FIDO2 for sensitive actions', <Toggle defaultOn key="a" />],
      ['Dual control for destructive ops', 'Delete, suspend, break-glass require a second admin', <Toggle defaultOn key="a" />],
      ['IP allow-list for admin plane', 'Admin console reachable from corp + SOC ranges only', <Toggle defaultOn key="a" />],
      ['Emergency access accounts', '2 sealed break-glass identities · quarterly ceremony', <EditBtn label="Review" key="a" />],
    ],
  },
  brand: {
    t: 'Branding',
    rows: [
      ['Sign-in experience', 'Meridian logo, palette and legal footer on all auth pages', <EditBtn label="Customize" key="a" />],
      ['Email templates', '14 lifecycle & security templates · localized (EN, DE, PT, HI)', <EditBtn label="Open editor" key="a" />],
      ['SMS sender ID', 'MERIDIAN — registered in 12 countries', <span className="tag" key="a">Managed</span>],
    ],
  },
  notif: {
    t: 'Notifications',
    rows: [
      ['SMTP relay', 'smtp.meridianbank.com:587 · TLS enforced · DKIM aligned', <Badge tone="ok" label="Healthy" key="a" />],
      ['SMS provider', 'Primary: Twilio · Fallback: Infobip — auto-failover', <Badge tone="ok" label="Healthy" key="a" />],
      ['Webhook endpoints', '7 subscribed — SOC bot, ITSM, data lake', <EditBtn label="Manage" key="a" />],
      ['Quiet hours', 'Non-critical digests suppressed 22:00–06:00 local', <Toggle defaultOn key="a" />],
    ],
  },
  api: {
    t: 'API & automation',
    rows: [
      ['API clients', '14 OAuth2 clients · least-privilege scopes · 90-day secret rotation', <EditBtn label="Manage" key="a" />],
      ['Terraform provider', 'Policy-as-code — 84% of config under version control', <span className="tag tag-acc" key="a">Connected</span>],
      ['Event streaming', 'Kafka topic tanflow.events — 2.4M events/day', <Badge tone="ok" label="Streaming" key="a" />],
    ],
  },
  license: {
    t: 'Licensing',
    rows: [
      ['Subscription', 'Tanflow Enterprise — Unlimited IAM + 5,000 PAM seats', <span className="tag" key="a">Renews Mar 2027</span>],
      ['PAM seat usage', '3,842 of 5,000 privileged identities', <div style={{ width: 160 }} className="hrow" key="a"><div className="meter" style={{ flex: 1 }}><i style={{ width: '77%' }} /></div><span className="num" style={{ fontSize: 11 }}>77%</span></div>],
      ['Support plan', 'Premier — 15-min P1 SLA, named TAM, quarterly posture review', <EditBtn label="Contact TAM" key="a" />],
    ],
  },
}
const NAV = [
  ['org', 'building', 'Organization'],
  ['security', 'shieldCheck', 'Security defaults'],
  ['brand', 'edit', 'Branding'],
  ['notif', 'mail', 'Notifications'],
  ['api', 'zap', 'API & automation'],
  ['license', 'roles', 'Licensing'],
]

export default function Settings() {
  const [section, setSection] = useState('org')
  const s = SECTIONS[section]
  return (
    <>
      <PageHead title="Platform Settings" sub="Tenant configuration, security defaults, branding, automation and licensing." />
      <div className="set-grid">
        <div className="set-nav">
          {NAV.map((n) => (
            <div key={n[0]} className={`sn-it ${n[0] === section ? 'on' : ''}`} onClick={() => setSection(n[0])}><Icon name={n[1]} size={14} />{n[2]}</div>
          ))}
        </div>
        <div id="set-panel">
          <div className="card">
            <div className="card-h"><div className="ch-t">{s.t}</div></div>
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 6 }}>
              {s.rows.map((r) => (
                <div className="set-row" key={r[0]}>
                  <div className="sr-meta"><div className="sr-t">{r[0]}</div><div className="sr-s">{r[1]}</div></div>
                  <div style={{ flex: 'none' }}>{r[2]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
