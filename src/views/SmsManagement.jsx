import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, StatusBadge, MeterRow } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const PROVIDERS = [
  ['Twilio', 'Primary', '99.1%', '1.2s', 'Online'],
  ['Infobip', 'Failover', '98.7%', '1.6s', 'Online'],
  ['AWS SNS', 'Regional (APAC)', '99.4%', '0.9s', 'Online'],
  ['Vonage', 'Standby', '—', '—', 'Disabled'],
]
const TEMPLATES = [
  ['OTP login code', 'Authentication', 'EN, DE, HI', 'Published'],
  ['MFA step-up code', 'Security', 'EN', 'Published'],
  ['Access approved alert', 'Governance', 'EN, PT', 'Published'],
  ['Break-glass used', 'Security', 'EN', 'Published'],
  ['Vault checkout OTP', 'Privileged', 'EN', 'Draft'],
]
const SMS_ATTENTION = [
  ['1 hr ago', 'a.mensah', '+44 7700 900xxx', 'otp-login', 'Twilio', 'Failed', 'Invalid number format'],
  ['3 hrs ago', 'contractor-8841', '+1 415 555 0xxx', 'otp-login', 'AWS SNS', 'Dropped', 'Carrier rejected — flagged spam'],
  ['Yesterday', 'k.tanaka', '+81 90 1234 xxxx', 'mfa-code', 'Infobip', 'Failed', 'Gateway timeout (30s)'],
]
const TABS = [['sms', 'phone', 'SMS'], ['templates', 'edit', 'Templates'], ['config', 'settings', 'Configuration']]

const SectionHead = ({ title, sub, actions }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
    <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>{sub}</div></div>
    {actions && <div className="hrow" style={{ gap: 8 }}>{actions}</div>}
  </div>
)
const Toolbar = ({ q, setQ }) => (
  <div className="toolbar">
    <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>Show <b style={{ color: 'var(--ink-2)' }}>10</b> entries</span>
    <div className="tb-spacer" />
    <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
  </div>
)

export default function SmsManagement() {
  const { toast, go } = useApp()
  const [tab, setTab] = useState('sms')
  const [q, setQ] = useState('')
  const rows = SMS_ATTENTION.filter((r) => !q || r.join(' ').toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHead title="SMS Management" sub="One-time-code and alert delivery over SMS — multi-provider routing with automatic failover and per-country compliance." />

      <div className="kpi-row cols-4">
        <KpiTile label="Messages (24h)" icon="phone" val="9,412" delta={2} foot="OTP + alerts" />
        <KpiTile label="Delivery rate" icon="shieldCheck" val="99.0" unit="%" foot="auto-failover" />
        <KpiTile label="Avg latency" icon="zap" val="1.2" unit="s" foot="to handset" />
        <KpiTile label="Countries" icon="globe" val="12" foot="sender IDs registered" />
      </div>

      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-pad">
          {tab === 'sms' && (
            <>
              <SectionHead title="SMS Requiring Attention" sub="Failed and dropped SMS dispatches. Successfully sent messages are available under All Reports."
                actions={<>
                  <button className="btn btn-sec" onClick={() => toast('ok', 'Resend queued', 'Selected messages re-queued for delivery (demo).')}><Icon name="refresh" />Resend</button>
                  <button className="btn btn-danger" onClick={() => toast('warn', 'Removed', 'Selected SMS log entries removed (demo).')}><Icon name="trash" />Remove</button>
                </>} />
              <Toolbar q={q} setQ={setQ} />
              {rows.length === 0 ? (
                <div className="empty" style={{ padding: '56px 20px' }}>
                  <div className="e-ic"><Icon name="phone" size={22} /></div>
                  <div className="e-t">No SMS issues</div>
                  <div className="e-s">Failed or dropped SMS messages will appear here.</div>
                </div>
              ) : (
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th style={{ width: 30 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></th><th>Sent at</th><th>Username</th><th>Recipient</th><th>Template</th><th>Provider</th><th>Status</th><th>Error</th></tr></thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }} onClick={(e) => e.stopPropagation()} /></td>
                          <td className="td-num" style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{r[0]}</td>
                          <td className="td-mono">{r[1]}</td>
                          <td className="td-mono" style={{ color: 'var(--mut)' }}>{r[2]}</td>
                          <td><span className="tag">{r[3]}</span></td>
                          <td>{r[4]}</td>
                          <td>{r[5] === 'Failed' ? <Badge tone="bad" label="Failed" /> : <Badge tone="warn" label="Dropped" />}</td>
                          <td style={{ color: 'var(--bad)', fontSize: '12px' }}>{r[6]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === 'templates' && (
            <>
              <SectionHead title="Templates" sub="One-time-code and alert message templates — localized and versioned."
                actions={<button className="btn btn-pri" onClick={() => go('create-sms-template')}><Icon name="plus" />New template</button>} />
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Template</th><th>Category</th><th>Locales</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
                  <tbody>
                    {TEMPLATES.map((t) => (
                      <tr key={t[0]} onClick={() => toast('ok', t[0], 'SMS template editor with variables & preview (demo).')}>
                        <td className="td-main">{t[0]}</td>
                        <td><span className="tag">{t[1]}</span></td>
                        <td style={{ color: 'var(--mut)' }}>{t[2]}</td>
                        <td>{t[3] === 'Published' ? <Badge tone="ok" label="Published" /> : <Badge tone="warn" label="Draft" />}</td>
                        <td><div className="row-actions"><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'config' && (
            <>
              <SectionHead title="Configuration" sub="SMS gateway providers with routing and automatic failover."
                actions={<button className="btn btn-pri" onClick={() => go('create-sms-provider')}><Icon name="plus" />Add provider</button>} />
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Provider</th><th>Role</th><th className="td-right">Delivery</th><th className="td-right">Latency</th><th>Status</th></tr></thead>
                  <tbody>
                    {PROVIDERS.map((p) => (
                      <tr key={p[0]} onClick={() => toast('ok', p[0], 'Provider credentials, routing & usage (demo).')}>
                        <td className="td-main">{p[0]}</td>
                        <td><span className="tag">{p[1]}</span></td>
                        <td className="td-right td-num">{p[2]}</td>
                        <td className="td-right td-num">{p[3]}</td>
                        <td><StatusBadge status={p[4]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divider" style={{ margin: '20px 0 4px' }} />
              <SectionHead title="Traffic by region" sub="Last 24 hours" />
              <div style={{ maxWidth: 520 }}>
                <MeterRow label="United Kingdom" val="41%" pct={41} mood="m-ok" />
                <MeterRow label="India" val="28%" pct={28} mood="m-ok" />
                <MeterRow label="Germany" val="14%" pct={14} />
                <MeterRow label="Singapore" val="9%" pct={9} />
                <MeterRow label="Other" val="8%" pct={8} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
