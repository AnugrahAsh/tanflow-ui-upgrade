import { useState, Fragment } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const CONSUMPTION = [
  { label: 'Connections', sub: 'Managed endpoints under PAM', note: '+6 in the last 30 days · projected to reach capacity around Oct 2029', used: 129, total: 400 },
  { label: 'Users', sub: 'Named operator seats', note: '+2 this quarter · 86 seats of headroom', used: 14, total: 100 },
  { label: 'Command policies', sub: 'Command restriction rule sets', note: 'Unchanged for 90 days', used: 1, total: 10 },
  { label: 'Machine activations', sub: 'Host fingerprints bound to this license', note: '1 activation request pending dual-control approval', used: 1, total: 3 },
]
const CAPS = [
  ['ACCESS MANAGEMENT', [
    ['Connection Management', true, true], ['Connection Group Management', true, true],
    ['Sharing Profile Management', false, true], ['Time-Based Access Policies', false, true], ['Change Management', false, true],
  ]],
  ['IDENTITY ADMINISTRATION', [['User Management', true, true], ['User Group Management', true, true]]],
  ['SESSION GOVERNANCE', [['Active Sessions', true, true], ['Session History', '30 days', '18 months']]],
  ['VAULT & COMMAND CONTROL', [['Password Vault', false, true], ['Command Restrictions', false, true]]],
  ['AUDIT & COMPLIANCE', [['Audit Logs', '90 days', 'Evidence-grade · 7 yrs']]],
]
const TIMELINE = [
  { icon: 'check', tone: 'ok', title: 'Order created', date: 'May 18, 2026', desc: 'Subscription BITC-PAM-20251201-2 provisioned by Bitchief licensing' },
  { icon: 'check', tone: 'ok', title: 'License issued & activated', date: 'May 29, 2026', desc: 'Premium_PAM entitlements applied to this tenant' },
  { icon: 'clock', tone: 'accent', title: 'Today', date: 'Jul 30, 2026', desc: '21 days of validity remaining · consumption verified 06:00 UTC' },
  { icon: 'warnTri', tone: 'warn', title: 'Validation checkpoint', date: 'Aug 20, 2026', desc: 'License file re-validation — renew or upload a refreshed license' },
  { icon: 'certs', tone: 'mut', title: 'Contract end', date: 'Dec 28, 2027', desc: 'Subscription term concludes · renewal window opens 90 days prior' },
]
const MACHINES = [
  { name: 'Prod Machine #1', role: 'Production', fp: 'aa03cc28…637235a', reg: 'May 29, 2026', hb: 'Today · 09:12 UTC', status: 'Active' },
  { name: 'DR Machine #1', role: 'Disaster recovery', fp: '—', reg: 'Requested Jul 24, 2026', hb: '—', status: 'Pending' },
]
const EVENTS = [
  ['Jul 30', '06:00', 'entitlement.sync', 'Consumption verified against the licensing service — signature valid', 'system'],
  ['Jul 24', '14:51', 'machine.requested', 'DR Machine #1 activation requested — awaiting dual-control approval', 'a.panda'],
  ['Jun 30', '06:00', 'license.validated', 'Scheduled 30-day validation completed — no entitlement drift detected', 'system'],
  ['May 29', '11:08', 'machine.registered', 'Prod Machine #1 fingerprint bound (aa03cc28…637235a)', 'a.panda'],
  ['May 29', '11:02', 'license.activated', 'BITCHIEF_LICENSE_PAM activated — Premium_PAM entitlements applied', 'a.panda'],
  ['May 18', '09:40', 'order.created', 'Subscription BITC-PAM-20251201-2 provisioned by Bitchief licensing', 'bitchief'],
]
const TONE = {
  ok: { tint: 'var(--ok-bg)', color: 'var(--ok)' }, accent: { tint: 'var(--accent-bg)', color: 'var(--accent)' },
  warn: { tint: 'var(--warn-bg)', color: 'var(--warn-core)' }, mut: { tint: 'var(--surface-2)', color: 'var(--mut)' },
}

const DonutRing = ({ value, total }) => {
  const r = 52, c = 2 * Math.PI * r, frac = value / total
  return (
    <svg width="132" height="132" viewBox="0 0 132 132">
      <circle cx="66" cy="66" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
      <circle cx="66" cy="66" r={r} fill="none" stroke="var(--warn-core)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 66 66)" />
      <text x="66" y="62" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 27, fontWeight: 750 }}>{value}</text>
      <text x="66" y="82" textAnchor="middle" fill="var(--mut)" style={{ fontSize: 10.5 }}>of {total} days left</text>
    </svg>
  )
}
const DL = ({ rows }) => (
  <div className="dl">{rows.map(([k, v]) => <Fragment key={k}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></Fragment>)}</div>
)
const capCell = (v) => v === true
  ? <Icon name="check" size={16} style={{ color: 'var(--ok)' }} />
  : v === false ? <span style={{ color: 'var(--line-2)' }}>—</span> : <span style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{v}</span>

function RenewModal({ onClose }) {
  const { toast } = useApp()
  const cell = (k, v) => <div><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--faint)' }}>{k}</div><div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{v}</div></div>
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="refresh" size={18} style={{ color: 'var(--warn-core)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>Start license renewal</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>BITC-PAM-20251201-2 · Premium_PAM · Subscription</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px', padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
            {cell('VALIDITY CHECKPOINT', 'Aug 20, 2026 · 21 days')}
            {cell('CONTRACT END', 'Dec 28, 2027')}
            {cell('EDITION', 'Premium_PAM')}
            {cell('MACHINE ACTIVATIONS', '1 of 3 in use')}
          </div>
          <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '13px 15px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)', marginTop: 16 }}>
            <Icon name="shieldCheck" size={16} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Renewal requests route to your named account team under the Premier SLA. Entitlements stay enforced while the request is processed; a 14-day grace period applies after the validity checkpoint.</div>
          </div>
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Contact TAM', 'Message routed to your Technical Account Manager (demo).')}><Icon name="mail" />Contact TAM</button>
            <button className="btn btn-pri" onClick={() => { toast('ok', 'Renewal requested', 'Renewal request submitted to your account team (demo).'); onClose() }}><Icon name="check" />Submit renewal request</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function License() {
  const { toast, go } = useApp()
  const [renew, setRenew] = useState(false)
  const pct = (u, t) => Math.round((u / t) * 100)

  return (
    <>
      <PageHead
        title="License & Entitlements"
        sub="Subscription health, entitlement consumption, capability matrix and registered machines for this tenant."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Export report', 'License & entitlement report generated (demo).')}><Icon name="download" />Export report</button>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Upload license', 'Upload a refreshed signed license file (demo).')}><Icon name="upload" />Upload license</button>
            <button className="btn btn-pri" onClick={() => setRenew(true)}><Icon name="refresh" />Start renewal</button>
          </>
        }
      />

      {/* validity banner */}
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 14, padding: '14px 18px', background: 'var(--warn-bg)', border: '1px solid rgba(224,150,0,.35)', borderRadius: 'var(--r)', marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="hrow" style={{ gap: 12, alignItems: 'flex-start' }}>
          <Icon name="warnTri" size={18} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
          <div><div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>License validation due in 21 days — Aug 20, 2026</div>
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', marginTop: 2 }}>The active license file reaches its validity checkpoint soon. Renew the subscription or upload a refreshed license to avoid the 14-day compliance grace period.</div></div>
        </div>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Account team', 'Message routed to your named account team (demo).')}>Contact account team</button>
          <button className="btn btn-pri btn-sm" onClick={() => setRenew(true)}>Start renewal</button>
        </div>
      </div>

      <div className="kpi-row cols-5">
        <KpiTile label="License status" icon="shieldCheck" val="Active" foot="Signature verified · 06:00 UTC" />
        <KpiTile label="Validity remaining" icon="clock" val="21" unit="of 61 days" foot="Checkpoint Aug 20, 2026" />
        <KpiTile label="Connections" icon="link" val="129" unit="/ 400" foot="32% of entitlement" />
        <KpiTile label="User seats" icon="users" val="14" unit="/ 100" foot="14% of entitlement" />
        <KpiTile label="Machine activations" icon="server" val="1" unit="/ 3" foot="1 pending approval" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: 16, alignItems: 'start' }}>
        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* license card */}
          <div className="card card-pad">
            <div className="hrow" style={{ gap: 7, justifyContent: 'center', marginBottom: 10 }}>
              <Badge tone="ok" label="Active" /><span className="tag tag-acc">Premium_PAM</span><span className="tag">Subscription</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><DonutRing value={21} total={61} /></div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <div className="hrow" style={{ gap: 7, justifyContent: 'center' }}><span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>BITCHIEF_LICENSE_PAM</span><Icon name="copy" size={14} style={{ color: 'var(--faint)', cursor: 'pointer' }} /></div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>Signature verified · SHA-256 · today 06:00 UTC</div>
            </div>
            <div className="hrow" style={{ gap: 8, justifyContent: 'center', marginTop: 14 }}>
              <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Validate now', 'License re-validated against the licensing service (demo).')}><Icon name="shieldCheck" size={13} />Validate now</button>
              <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Usage matrix', 'Detailed usage matrix export (demo).')}><Icon name="reports" size={13} />Usage matrix</button>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--faint)', marginBottom: 6 }}>LICENSE</div>
            <DL rows={[['License ID', <span className="mono" style={{ fontSize: '11.5px' }}>BITC-PAM-20251201-2</span>], ['Product', 'Tanflow_PAM'], ['Edition', 'Premium_PAM'], ['Type', 'Subscription · auto-validating']]} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--faint)', margin: '16px 0 6px' }}>LICENSEE</div>
            <DL rows={[['Organization', 'Bitchief Technology Services Private Limited'], ['GSTIN', <span className="mono" style={{ fontSize: '11.5px' }}>06AAKCB9321N1ZA</span>], ['Registered address', 'DCG01-310, DLF Corporate Greens, Sector 74A, Gurgaon']]} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--faint)', margin: '16px 0 6px' }}>TERM</div>
            <DL rows={[['Order created', 'May 18, 2026'], ['Issued & activated', 'May 29, 2026'], ['Validation due', 'Aug 20, 2026 · 21 days'], ['Contract end', 'Dec 28, 2027']]} />
          </div>

          {/* contract timeline */}
          <div className="card card-pad">
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Contract timeline</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>Milestones across the current subscription term</div>
            {TIMELINE.map((t, i) => {
              const s = TONE[t.tone]
              return (
                <div key={t.title} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={t.icon} size={13} style={{ color: s.color }} /></span>
                    {i < TIMELINE.length - 1 && <span style={{ flex: 1, width: 2, background: 'var(--hair)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 16 : 0, flex: 1, minWidth: 0 }}>
                    <div className="hrow" style={{ justifyContent: 'space-between', gap: 10 }}><span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{t.title}</span><span className="num" style={{ fontSize: '11.5px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{t.date}</span></div>
                    <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 2, lineHeight: 1.5 }}>{t.desc}</div>
                  </div>
                </div>
              )
            })}
            <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 6, marginBottom: 4 }}><span style={{ fontSize: '12px', color: 'var(--mut)' }}>Contract elapsed</span><span className="num" style={{ fontSize: '12px', fontWeight: 650 }}>11%</span></div>
            <div className="meter"><i style={{ width: '11%' }} /></div>
            <div style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: 6 }}>62 of 578 days · May 29, 2026 → Dec 28, 2027</div>
          </div>

          {/* account team */}
          <div className="card card-pad">
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Account team &amp; support</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 14 }}>Premier plan attached to this contract</div>
            <div className="hrow" style={{ gap: 12 }}>
              <Avatar name="Tribhuwan Phulera" />
              <div><div style={{ fontSize: '13.5px', fontWeight: 650 }}>Tribhuwan Phulera</div><div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Technical Architect · Named account manager</div></div>
            </div>
            <div className="hrow" style={{ gap: 16, marginTop: 10, fontSize: '12px', color: 'var(--ink-2)', flexWrap: 'wrap' }}>
              <span className="hrow" style={{ gap: 6 }}><Icon name="mail" size={13} style={{ color: 'var(--mut)' }} />tribhuwan@bitchief.in</span>
              <span className="hrow" style={{ gap: 6 }}><Icon name="phone" size={13} style={{ color: 'var(--mut)' }} />+91 79063 64288</span>
            </div>
            <div className="divider" />
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '7px 0' }}><span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>Support plan</span><span className="tag tag-acc">PREMIER</span></div>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '7px 0' }}><span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>P1 response</span><span style={{ fontSize: '12.5px', fontWeight: 550 }}>15 min · 24×7</span></div>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '7px 0' }}><span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>Entitlement reviews</span><span style={{ fontSize: '12.5px', fontWeight: 550 }}>Quarterly · with TAM</span></div>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '7px 0' }}><span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>Renewal window</span><span style={{ fontSize: '12.5px', fontWeight: 550 }}>Opens 90 days before term end</span></div>
            <div className="hrow" style={{ gap: 8, marginTop: 14 }}>
              <button className="btn btn-sec btn-sm" style={{ flex: 1 }} onClick={() => toast('ok', 'Contact TAM', 'Message routed to your Technical Account Manager (demo).')}><Icon name="mail" size={13} />Contact TAM</button>
              <button className="btn btn-sec btn-sm" style={{ flex: 1 }} onClick={() => toast('ok', 'Support portal', 'Opening the Premier support portal (demo).')}><Icon name="external" size={13} />Support portal</button>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* consumption */}
          <div className="card card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Entitlement consumption</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Live counts, re-validated every 24 h against the licensing service</div></div>
              <div className="hrow" style={{ gap: 10 }}><span style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Synced today · 06:00 UTC</span><button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Re-sync', 'Consumption re-synced against the licensing service (demo).')}><Icon name="refresh" size={13} />Re-sync</button></div>
            </div>
            <div style={{ marginTop: 8 }}>
              {CONSUMPTION.map((c, i) => (
                <div key={c.label} style={{ padding: '14px 0', borderBottom: i < CONSUMPTION.length - 1 ? '1px solid var(--hair)' : 'none' }}>
                  <div className="hrow" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{c.label}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{c.sub}</div></div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><div className="num" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{c.used} <span style={{ color: 'var(--mut)', fontWeight: 400 }}>/ {c.total}</span></div><div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{pct(c.used, c.total)}% consumed</div></div>
                  </div>
                  <div className="meter" style={{ marginTop: 9 }}><i style={{ width: `${pct(c.used, c.total)}%` }} /></div>
                  <div style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: 7 }}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* capability matrix */}
          <div className="card card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Feature entitlements</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Capabilities enforced at runtime for this edition</div></div>
              <span className="tag tag-acc" style={{ flex: 'none' }}>Current: Premium_PAM</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <colgroup><col /><col /><col style={{ background: 'var(--accent-bg)' }} /></colgroup>
                <thead><tr><th>Capability</th><th style={{ textAlign: 'center' }}>STANDARD_PAM</th><th style={{ textAlign: 'center' }}>PREMIUM_PAM</th></tr></thead>
                <tbody>
                  {CAPS.map(([group, rows]) => (
                    <Fragment key={group}>
                      <tr><td colSpan={2} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--mut)', padding: '14px 14px 5px', borderBottom: 'none' }}>{group}</td><td style={{ borderBottom: 'none' }} /></tr>
                      {rows.map(([cap, std, prem]) => (
                        <tr key={cap}>
                          <td className="td-main">{cap}</td>
                          <td style={{ textAlign: 'center' }}>{capCell(std)}</td>
                          <td style={{ textAlign: 'center' }}>{capCell(prem)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hrow" style={{ gap: 8, marginTop: 12, fontSize: '11.75px', color: 'var(--mut)' }}><Icon name="shieldCheck" size={14} style={{ color: 'var(--ok)', flex: 'none' }} />Entitlements are enforced at runtime and re-validated every 24 h against the Tanflow licensing service.</div>
          </div>

          {/* registered machines */}
          <div className="card card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Registered machines</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Host fingerprints authorized to run this license</div></div>
              <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Register machine', 'New host fingerprint requires dual-control approval (demo).')}><Icon name="plus" size={13} />Register machine</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Machine</th><th>Fingerprint · SHA-256</th><th>Registered</th><th>Heartbeat</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
                <tbody>
                  {MACHINES.map((m) => (
                    <tr key={m.name}>
                      <td><div className="td-main">{m.name}</div><div className="td-sub">{m.role}</div></td>
                      <td className="mono" style={{ fontSize: '11.5px', color: m.fp === '—' ? 'var(--faint)' : 'var(--mut)' }}>{m.fp}</td>
                      <td style={{ color: 'var(--mut)' }}>{m.reg}</td>
                      <td className="td-num" style={{ color: 'var(--mut)' }}>{m.hb}</td>
                      <td>{m.status === 'Active' ? <Badge tone="ok" label="Active" /> : <Badge tone="warn" label="Pending" />}</td>
                      <td><div className="row-actions">
                        {m.status === 'Active'
                          ? <><button className="mini-btn"><Icon name="copy" size={14} /></button><button className="mini-btn danger"><Icon name="trash" size={14} /></button></>
                          : <button className="mini-btn"><Icon name="eye" size={14} /></button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
              <span style={{ fontSize: '11.75px', color: 'var(--mut)' }}>1 of 3 activations in use · 1 request pending dual-control approval</span>
              <div className="meter" style={{ width: 120 }}><i style={{ width: '33%' }} /></div>
            </div>
          </div>

          {/* license events */}
          <div className="card card-pad">
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>License events</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Lifecycle trail for this subscription — evidence-grade</div></div>
              <span className="link hrow" style={{ gap: 6 }} onClick={() => go('audit')}><Icon name="audit" size={14} />Open audit log</span>
            </div>
            {EVENTS.map(([date, time, code, desc, actor], i) => (
              <div key={i} className="hrow" style={{ gap: 14, padding: '11px 0', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--hair)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 66, flex: 'none', fontSize: '11.25px', color: 'var(--mut)', lineHeight: 1.45 }}>{date} ·<br />{time}</div>
                <span className="mono" style={{ fontSize: '10.75px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 7px', color: 'var(--ink-2)', flex: 'none', whiteSpace: 'nowrap' }}>{code}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: '12.5px', color: 'var(--ink-2)' }}>{desc}</span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--faint)', flex: 'none' }}>{actor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renew && <RenewModal onClose={() => setRenew(false)} />}
    </>
  )
}
