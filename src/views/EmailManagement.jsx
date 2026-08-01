import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, MeterRow } from '../components/primitives.jsx'
import EmailTemplateModal from '../components/EmailTemplateModal.jsx'
import { useApp } from '../context/AppContext.jsx'

// Branded email skeleton — every template renders through the same header/footer.
const wrap = (tag, heading, body) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${heading} - Tanflow PAM</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f4f5f7;padding:22px;margin:0;color:#1f2430}
  .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:10px;padding:26px}
  .brand{font-weight:800;font-size:20px;color:#1f2430;margin-bottom:14px}
  .tag{display:inline-block;background:#EDF4FF;color:#2563EB;font-size:11px;font-weight:700;letter-spacing:.05em;padding:4px 9px;border-radius:5px;margin-bottom:14px}
  h1{font-size:20px;margin:0 0 10px}
  p{font-size:14px;line-height:1.6;color:#3b4453;margin:0 0 12px}
  .btn{display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:11px 20px;border-radius:7px;font-size:14px;font-weight:600;margin-top:4px}
  .code{font-family:'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:6px;color:#1f2430;background:#f4f5f7;padding:14px;border-radius:8px;text-align:center;margin:6px 0}
  table{width:100%;border-collapse:collapse;margin-top:6px}
  td{padding:9px 0;font-size:13px;border-bottom:1px solid #eef0f3}
  .k{color:#6b7280}.v{text-align:right;color:#1f2430;font-weight:600}
  .muted{font-size:12px;color:#9aa1ad;margin-top:14px}
</style></head>
<body><div class="wrap"><div class="brand">tanflow</div><span class="tag">${tag}</span>${heading ? `<h1>${heading}</h1>` : ''}${body}</div></body></html>`

const TEMPLATES = [
  { event: 'Password Reset', code: 'password_reset', subject: 'Password Reset Request', locales: ['EN', 'DE', 'PT', 'HI'], edited: '2d ago', active: true,
    placeholders: ['{{logoSrc}}', '{{firstName}}', '{{lastName}}', '{{username}}', '{{organization}}', '{{resetPasswordLink}}'],
    html: wrap('PASSWORD RESET', 'Reset Your Password', `<p>Hello {{firstName}} {{lastName}},</p><p>A request was received to reset the password for your Tanflow PAM account.</p><table><tr><td class="k">Account Holder</td><td class="v">{{firstName}} {{lastName}}</td></tr><tr><td class="k">Username</td><td class="v">{{username}}</td></tr><tr><td class="k">Organization</td><td class="v">{{organization}}</td></tr></table><a class="btn" href="{{resetPasswordLink}}">Reset Password</a><p class="muted">If you didn't request this, you can safely ignore this email.</p>`) },
  { event: 'Command Policy Violation Alert', code: 'command_violation_alert', subject: '[Security Alert] Command Policy Violation: {{action}}', locales: ['EN', 'DE', 'PT', 'HI'], edited: '5d ago', active: true,
    placeholders: ['{{logoSrc}}', '{{username}}', '{{action}}', '{{connection}}', '{{timestamp}}'],
    html: wrap('SECURITY ALERT', 'Command Policy Violation', `<p>A blocked command was attempted on a monitored connection.</p><table><tr><td class="k">User</td><td class="v">{{username}}</td></tr><tr><td class="k">Command</td><td class="v">{{action}}</td></tr><tr><td class="k">Connection</td><td class="v">{{connection}}</td></tr><tr><td class="k">When</td><td class="v">{{timestamp}}</td></tr></table><p class="muted">This event has been recorded in the audit log.</p>`) },
  { event: 'Test Email (Config Verification)', code: 'test_email', subject: 'PAM Email Configuration Test', locales: ['EN', 'DE', 'PT', 'HI'], edited: '1mo ago', active: true,
    placeholders: ['{{logoSrc}}', '{{organization}}', '{{timestamp}}'],
    html: wrap('CONFIG TEST', 'Your SMTP is working', `<p>This is a test message from Tanflow PAM for <b>{{organization}}</b>.</p><p>If you can read this, your outgoing email relay is configured correctly.</p><table><tr><td class="k">Sent at</td><td class="v">{{timestamp}}</td></tr></table>`) },
  { event: 'Sharing Profile Invitation', code: 'sharing_profile_invite', subject: '{{hostUsername}} invited you to view a live session', locales: ['EN', 'DE', 'PT', 'HI'], edited: '3d ago', active: true,
    placeholders: ['{{logoSrc}}', '{{hostUsername}}', '{{sessionLink}}', '{{expiresAt}}'],
    html: wrap('SESSION INVITE', 'You’ve been invited', `<p><b>{{hostUsername}}</b> invited you to observe a live privileged session.</p><a class="btn" href="{{sessionLink}}">Join Session</a><p class="muted">This invitation expires at {{expiresAt}}.</p>`) },
  { event: 'MFA Email OTP', code: 'mfa_email_otp', subject: 'Your Tanflow PAM verification code', locales: ['EN', 'DE', 'PT', 'HI'], edited: '6h ago', active: true,
    placeholders: ['{{logoSrc}}', '{{firstName}}', '{{otpCode}}', '{{expiryMinutes}}'],
    html: wrap('VERIFICATION CODE', 'Your verification code', `<p>Hello {{firstName}}, use this code to finish signing in:</p><div class="code">{{otpCode}}</div><p class="muted">This code expires in {{expiryMinutes}} minutes. Never share it with anyone.</p>`) },
  { event: 'Change Management Notification', code: 'change_request_notification', subject: '{{subject}}', locales: ['EN', 'DE', 'PT', 'HI'], edited: '1w ago', active: true,
    placeholders: ['{{logoSrc}}', '{{subject}}', '{{changeId}}', '{{requester}}', '{{status}}'],
    html: wrap('CHANGE MANAGEMENT', '{{subject}}', `<table><tr><td class="k">Change</td><td class="v">{{changeId}}</td></tr><tr><td class="k">Requester</td><td class="v">{{requester}}</td></tr><tr><td class="k">Status</td><td class="v">{{status}}</td></tr></table><p class="muted">Review this change in the Change Management console.</p>`) },
  { event: 'Admin Password Reset', code: 'admin_password_reset', subject: 'Password Reset Requested by Administrator', locales: ['EN', 'DE', 'PT', 'HI'], edited: '2mo ago', active: true,
    placeholders: ['{{logoSrc}}', '{{firstName}}', '{{adminName}}', '{{resetPasswordLink}}'],
    html: wrap('PASSWORD RESET', 'Reset Your Password', `<p>Hello {{firstName}},</p><p><b>{{adminName}}</b> requested a password reset for your account.</p><a class="btn" href="{{resetPasswordLink}}">Set New Password</a><p class="muted">Contact your administrator if you have questions.</p>`) },
  { event: 'Vault Credential Reveal OTP', code: 'vault_reveal_otp', subject: '[Security] Vault Credential Access Code', locales: ['EN', 'DE', 'PT', 'HI'], edited: '12d ago', active: true,
    placeholders: ['{{logoSrc}}', '{{username}}', '{{otpCode}}', '{{credentialName}}'],
    html: wrap('VAULT ACCESS', 'Credential access code', `<p>{{username}}, you requested to reveal <b>{{credentialName}}</b>.</p><div class="code">{{otpCode}}</div><p class="muted">This step-up code confirms a privileged credential reveal and is recorded.</p>`) },
]

const EMAILS_ATTENTION = [
  ['2 hrs ago', 'j.weber', 'j.weber@meridianbank.com', 'MFA enrollment reminder', 'mfa-reminder', 'Failed', 'SMTP 550 — mailbox full'],
  ['5 hrs ago', 'ext-auditco', 'ops@auditco.example', 'Access request approved', 'access-approved', 'Dropped', 'Domain on suppression list'],
  ['Yesterday', 't.costa', 't.costa@meridianbank.com', 'Password reset', 'password-reset', 'Failed', 'DNS — no MX record'],
]
const RECENT_SENDS = [
  ['MFA Email OTP', 'a.panda@meridianbank.com', '2 min ago'],
  ['Vault Reveal OTP', 't.dahl@meridianbank.com', '18 min ago'],
  ['Change notification', 'ops@meridianbank.com', '41 min ago'],
]
const TABS = [['emails', 'mail', 'Emails'], ['templates', 'edit', 'Templates'], ['config', 'settings', 'Configuration']]

const SectionHead = ({ title, sub, actions }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
    <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>{sub}</div></div>
    {actions && <div className="hrow" style={{ gap: 8 }}>{actions}</div>}
  </div>
)
const Field = ({ label, req, help, children, full }) => (
  <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>
    <label>{label}{req && <span style={{ color: 'var(--bad)' }}> *</span>}</label>
    {children}
    {help && <div className="f-help">{help}</div>}
  </div>
)

export default function EmailManagement() {
  const { toast } = useApp()
  const [tab, setTab] = useState('emails')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState(TEMPLATES)
  const [editing, setEditing] = useState(null)
  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: '587', user: 'official.aaditya.work@gmail.com', pass: 'app-password-secret', fromName: 'Tanflow PAM', fromAddr: '' })
  const [online, setOnline] = useState(true)
  const [ssl, setSsl] = useState(false)
  const setS = (k) => (e) => setSmtp((p) => ({ ...p, [k]: e.target.value }))
  const toggleActive = (i) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, active: !r.active } : r)))

  const emailRows = EMAILS_ATTENTION.filter((r) => !q || r.join(' ').toLowerCase().includes(q.toLowerCase()))
  const tplRows = rows.filter((t) => !q || (t.event + t.code + t.subject).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHead title="Email Management" sub="HTML templates and the outgoing SMTP server used by PAM to send notifications and alerts." />

      <div className="kpi-row cols-4">
        <KpiTile label="Templates" icon="mail" val="8" foot="8 active · localized EN/DE/PT/HI" />
        <KpiTile label="Delivered (30d)" icon="check" val="4.7" unit="K" delta={6} foot="99.4% delivery rate" spark={[38, 44, 41, 48, 53, 50, 58, 61, 56, 63]} />
        <KpiTile label="Bounces (30d)" icon="warnTri" val="28" delta={-14} goodUp={false} foot="0.6% — all soft bounces" />
        <KpiTile label="SMTP relay" icon="server" val="Healthy" foot="TLS enforced · DKIM aligned" />
      </div>

      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      {/* ── EMAILS (unchanged) ── */}
      {tab === 'emails' && (
        <div className="card"><div className="card-pad">
          <SectionHead title="Emails Requiring Attention" sub="Failed and dropped emails. Successfully sent emails are available under All Reports."
            actions={<>
              <button className="btn btn-sec" onClick={() => toast('ok', 'Resend queued', 'Selected emails re-queued for delivery (demo).')}><Icon name="refresh" />Resend</button>
              <button className="btn btn-danger" onClick={() => toast('warn', 'Removed', 'Selected email log entries removed (demo).')}><Icon name="trash" />Remove</button>
            </>} />
          <div className="toolbar">
            <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>Show <b style={{ color: 'var(--ink-2)' }}>10</b> entries</span>
            <div className="tb-spacer" />
            <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          {emailRows.length === 0 ? (
            <div className="empty" style={{ padding: '56px 20px' }}>
              <div className="e-ic"><Icon name="mail" size={22} /></div>
              <div className="e-t">No email issues</div>
              <div className="e-s">Failed or dropped emails will appear here.</div>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th style={{ width: 30 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></th><th>Sent at</th><th>Username</th><th>Recipient</th><th>Subject</th><th>Template</th><th>Status</th><th>Error</th></tr></thead>
                <tbody>
                  {emailRows.map((r, i) => (
                    <tr key={i}>
                      <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }} onClick={(e) => e.stopPropagation()} /></td>
                      <td className="td-num" style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{r[0]}</td>
                      <td className="td-mono">{r[1]}</td>
                      <td className="td-mono" style={{ color: 'var(--mut)' }}>{r[2]}</td>
                      <td className="td-main">{r[3]}</td>
                      <td><span className="tag">{r[4]}</span></td>
                      <td>{r[5] === 'Failed' ? <Badge tone="bad" label="Failed" /> : <Badge tone="warn" label="Dropped" />}</td>
                      <td style={{ color: 'var(--bad)', fontSize: '12px' }}>{r[6]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div></div>
      )}

      {/* ── TEMPLATES ── */}
      {tab === 'templates' && (
        <div className="card"><div className="card-pad">
          <SectionHead title="Email templates" sub="Manage HTML templates for all email events triggered by PAM. Changes take effect immediately." />
          <div className="toolbar">
            <div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <button className="btn btn-sec btn-sm" style={{ marginLeft: 8, color: 'var(--accent)', borderColor: 'var(--accent-line)' }}><Icon name="filter" size={13} />All events</button>
            <div className="tb-spacer" />
            <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Export pack', 'All 8 templates exported as an HTML pack (demo).')}><Icon name="download" size={13} />Export pack</button>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Event</th><th>Subject</th><th>Locales</th><th>Last edited</th><th style={{ width: 70 }}>Active</th><th style={{ width: 60 }}>Actions</th></tr></thead>
              <tbody>
                {tplRows.map((t) => {
                  const i = rows.indexOf(t)
                  return (
                    <tr key={t.code} onClick={() => setEditing(t)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="hrow" style={{ gap: 11 }}>
                          <span style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="mail" size={15} style={{ color: 'var(--accent)' }} /></span>
                          <div><div className="td-main">{t.event}</div><div className="td-sub mono">{t.code}</div></div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--accent)', fontSize: '12.5px' }}>{t.subject}</td>
                      <td><span className="hrow" style={{ gap: 5 }}><span className="tag">{t.locales[0]}</span>{t.locales.length > 1 && <span className="tag">+{t.locales.length - 1}</span>}</span></td>
                      <td style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{t.edited}</td>
                      <td><span className={`toggle ${t.active ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleActive(i) }} /></td>
                      <td><div className="row-actions"><button className="mini-btn" onClick={(e) => { e.stopPropagation(); setEditing(t) }}><Icon name="edit" size={14} /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="hrow" style={{ gap: 8, marginTop: 14, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)' }} />Every template renders through the same header/footer partial — edit branding once in Settings › Branding and all 8 inherit it.</div>
        </div></div>
      )}

      {/* ── CONFIGURATION ── */}
      {tab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20, alignItems: 'start' }}>
          <div className="card"><div className="card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>SMTP Server Settings</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Configure the outgoing email server used by PAM to send notifications and alerts.</div></div>
              <label className="hrow" style={{ gap: 9, cursor: 'pointer', flex: 'none' }}>
                <Badge tone={online ? 'ok' : 'mut'} label={online ? 'Online' : 'Offline'} />
                <span className={`toggle ${online ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setOnline((v) => !v) }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 18px' }}>
              <Field label="SMTP host" req><input className="inp" value={smtp.host} onChange={setS('host')} /></Field>
              <Field label="SMTP port" req help="587 (TLS) · 465 (SSL) · 25 (plain)"><input className="inp" value={smtp.port} onChange={setS('port')} /></Field>
              <Field label="Username" req><input className="inp" value={smtp.user} onChange={setS('user')} /></Field>
              <Field label="Password" req><input className="inp" type="password" value={smtp.pass} onChange={setS('pass')} /></Field>
              <Field label="From name" help="Display name shown in recipients’ inbox. Defaults to ‘PAM’ if not set."><input className="inp" value={smtp.fromName} onChange={setS('fromName')} /></Field>
              <Field label="From address" help="Defaults to username if not set."><input className="inp" placeholder="noreply@yourcompany.com" value={smtp.fromAddr} onChange={setS('fromAddr')} /></Field>
            </div>
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '16px 0 4px', marginTop: 8, borderTop: '1px solid var(--hair)' }}>
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Use SSL/TLS (port 465)</div>
                <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Leave off for STARTTLS (port 587).</div></div>
              <span className={`toggle ${ssl ? 'on' : ''}`} onClick={() => setSsl((v) => !v)} />
            </div>
            <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
              <button className="btn btn-sec" onClick={() => toast('ok', 'Test email', 'Test message sent to your inbox (demo).')}><Icon name="mail" />Test Email</button>
              <button className="btn btn-pri" onClick={() => toast('ok', 'Saved', 'SMTP server settings saved (demo).')}><Icon name="check" />Save</button>
            </div>
          </div></div>

          <div className="card"><div className="card-pad">
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Delivery health</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 14 }}>Last 7 days</div>
            <MeterRow label="Delivered" val="99.4%" pct={99.4} mood="m-ok" />
            <MeterRow label="DKIM aligned" val="100%" pct={100} mood="m-ok" />
            <MeterRow label="TLS enforced" val="100%" pct={100} mood="m-ok" />
            <MeterRow label="Soft bounces" val="0.6%" pct={4} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', margin: '18px 0 6px' }}>Recent sends</div>
            {RECENT_SENDS.map(([name, to, time]) => (
              <div key={name} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div style={{ minWidth: 0 }}><div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{to}</div></div>
                <span style={{ fontSize: '11.25px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{time}</span>
              </div>
            ))}
          </div></div>
        </div>
      )}

      {editing && <EmailTemplateModal template={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
