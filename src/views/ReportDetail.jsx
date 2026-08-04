import { useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { KpiTile } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { reportById, CAT } from '../data/reports.js'
import ScheduleModal from '../components/ScheduleModal.jsx'

const IDS = ['o.aziz', 'testuser', 'h.kobayashi', 'l.dahl', 'helpdesk.t1', 'svc-idm', 'p.sharma', 'm.bennett', 'n.rahman', 'j.novak', 'v.sokolov', 'e.lindqvist', 'admin', 'f.berg', 'k.tanaka', 's.demir']
const FACTORS = ['SAML SSO', 'Password + OTP', 'RADIUS', 'SAML SSO', 'Password + OTP', 'FIDO2']
const IFACES = ['API token', 'Mobile', 'Web console', 'API token']
const IPS = [['10.6.125.33', 'AE'], ['10.15.83.183', 'CZ'], ['10.17.172.76', 'US'], ['10.21.21.39', 'US'], ['10.27.72.112', 'DE'], ['10.24.19.30', 'US'], ['203.0.113.123', 'IN'], ['10.15.4.6', 'IN'], ['10.2.68.244', 'DE'], ['198.51.100.7', 'GB'], ['10.31.9.2', 'SG']]
const pad = (n) => String(n).padStart(2, '0')
const rel = (days) => days <= 0 ? 'just now' : days === 1 ? '1 day ago' : `${days} days ago`
const ROWS = (() => {
  const now = new Date()
  return Array.from({ length: 31 }, (_, i) => {
    const ts = new Date(now.getTime() - i * 20 * 3600 * 1000)
    const days = Math.floor((now - ts) / 86400000)
    const [ip, cc] = IPS[i % IPS.length]
    return { id: i, ident: IDS[i % IDS.length], factor: FACTORS[i % FACTORS.length], iface: IFACES[i % IFACES.length], ip, cc, off: !ip.startsWith('10.'), ts, tsStr: `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())} ${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`, rel: rel(i === 0 ? 0 : days) }
  })
})()
const FACT_TONE = { 'SAML SSO': { c: '#2563EB', bg: '#E2ECFF' }, 'Password + OTP': { c: '#9A6700', bg: '#FBF0D3' }, RADIUS: { c: '#0891B2', bg: '#DDF2F7' }, FIDO2: { c: '#0E9F6E', bg: '#DAF2E2' } }
const Meta = ({ icon, label, value, color }) => (
  <div><div className="hrow" style={{ gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--faint)' }}><Icon name={icon} size={12} />{label}</div><div style={{ fontSize: '13.5px', fontWeight: 600, color: color || 'var(--ink)', marginTop: 5 }}>{value}</div></div>
)

export default function ReportDetail() {
  const { go, toast } = useApp()
  const { id } = useParams()
  const r = reportById(id)
  const [q, setQ] = useState('')
  const [range, setRange] = useState('30d')
  const [factor, setFactor] = useState('All factor')
  const [iface, setIface] = useState('All interface')
  const [sched, setSched] = useState(false)
  if (!r) return <Navigate to="/reports" replace />

  const rangeDays = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }[range]
  const rows = useMemo(() => {
    const now = new Date()
    return ROWS.filter((row) => {
      if ((now - row.ts) / 86400000 > rangeDays) return false
      if (q && !(row.ident + row.factor + row.iface + row.ip).toLowerCase().includes(q.toLowerCase())) return false
      if (factor !== 'All factor' && row.factor !== factor) return false
      if (iface !== 'All interface' && row.iface !== iface) return false
      return true
    })
  }, [q, rangeDays, factor, iface])

  const distinct = new Set(ROWS.map((x) => x.ident)).size
  const fido = Math.round((ROWS.filter((x) => x.factor === 'FIDO2').length / ROWS.length) * 100)
  const offNet = ROWS.filter((x) => x.off).length
  const reset = () => { setQ(''); setRange('30d'); setFactor('All factor'); setIface('All interface') }
  const kpiLabel = r.dataset === 'auth.login.success' ? 'Successful logins' : r.dataset === 'auth.login.failed' ? 'Failed logins' : 'Events in range'

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('reports')} style={{ marginBottom: 10 }}><Icon name="chevL" />All reports</button>
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div><div style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{r.name}</div><div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 3 }}>{r.desc}</div></div>
        <div className="hrow" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sec" onClick={() => go('mfa')}><Icon name="mfa" />MFA policy</button>
          <button className="btn btn-sec" onClick={() => setSched(true)}><Icon name="calendar" />Schedule</button>
          <button className="btn btn-sec" onClick={() => toast('ok', 'Export PDF', `${r.name} exported as PDF (demo).`)}><Icon name="reports" />Export PDF</button>
          <button className="btn btn-pri" onClick={() => toast('ok', 'Export CSV', `${rows.length} rows exported to CSV (demo).`)}><Icon name="download" />Export CSV</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>
          <Meta icon="reports" label="DATASET" value={<span className="mono" style={{ fontSize: '12.5px' }}>{r.dataset}</span>} />
          <Meta icon="folder" label="CATEGORY" value={r.cat} />
          <Meta icon="lock" label="RETENTION" value={`${r.retention} · WORM`} />
          <Meta icon="list" label="RECORDS HELD" value={r.records} />
          <Meta icon="refresh" label="MOST RECENT" value={r.gen} />
          <Meta icon="shieldCheck" label="INTEGRITY" value="Hash-verified" color="var(--ok)" />
        </div>
      </div>

      <div className="kpi-row cols-4">
        <KpiTile label={kpiLabel} icon="sso" val={ROWS.length} foot="across all interfaces" />
        <KpiTile label="Distinct identities" icon="users" val={distinct} foot="unique accounts" />
        <KpiTile label="Phishing-resistant" icon="shieldCheck" val={fido} unit="%" foot="FIDO2 of all sign-ins" />
        <KpiTile label="Off-network origins" icon="globe" val={offNet} foot="outside the corporate range" />
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 240 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search this report…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>{['24h', '7d', '30d', '90d'].map((x) => <button key={x} onClick={() => setRange(x)} style={{ padding: '6px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', background: range === x ? 'var(--accent-bg)' : 'transparent', color: range === x ? 'var(--accent)' : 'var(--ink-2)', borderRight: x !== '90d' ? '1px solid var(--line-2)' : 'none' }}>{x}</button>)}</div>
          <select className="sel" style={{ width: 150, height: 30 }} value={factor} onChange={(e) => setFactor(e.target.value)}><option>All factor</option>{['SAML SSO', 'Password + OTP', 'RADIUS', 'FIDO2'].map((x) => <option key={x}>{x}</option>)}</select>
          <select className="sel" style={{ width: 150, height: 30 }} value={iface} onChange={(e) => setIface(e.target.value)}><option>All interface</option>{['API token', 'Mobile', 'Web console'].map((x) => <option key={x}>{x}</option>)}</select>
          <button className="btn btn-sec btn-sm" onClick={reset}><Icon name="refresh" size={13} />Reset</button>
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{rows.length} of {ROWS.length} in range</span>
          <button className="icon-btn"><Icon name="list" size={15} /></button><button className="icon-btn"><Icon name="settings" size={15} /></button><button className="icon-btn"><Icon name="download" size={15} /></button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Timestamp ▾</th><th>Identity</th><th>Factor</th><th>Interface</th><th>Source IP</th><th>Result</th></tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={6}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No records in range</div><div className="e-s">Widen the range or clear filters.</div></div></td></tr> : rows.map((row) => (
                <tr key={row.id}>
                  <td><div className="mono" style={{ fontSize: '12px' }}>{row.tsStr}</div><div style={{ fontSize: '11px', color: 'var(--mut)' }}>{row.rel}</div></td>
                  <td><div className="hrow" style={{ gap: 9 }}><Avatar name={row.ident} cls="av-sm" /><span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{row.ident}</span></div></td>
                  <td><span style={{ fontSize: '11px', fontWeight: 600, color: FACT_TONE[row.factor].c, background: FACT_TONE[row.factor].bg, borderRadius: 5, padding: '3px 9px' }}>{row.factor}</span></td>
                  <td><span className="tag">{row.iface}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{row.ip}</span> <span className="tag" style={{ fontSize: '9.5px' }}>{row.cc}</span></td>
                  <td><span className="hrow" style={{ gap: 6, fontSize: '12.5px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Success</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sched && <ScheduleModal report={r.name} onClose={() => setSched(false)} />}
    </>
  )
}
