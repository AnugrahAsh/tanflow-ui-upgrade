import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const USAGE = [
  ['Connections', '6 / 400'],
  ['Users', '19 / 100'],
  ['Command Policies', '2 / 10'],
  ['Active Sessions', true],
  ['Session History', true],
  ['Connection Management', true],
  ['Connection Group Management', true],
  ['Sharing Profile Management', true],
  ['User Management', true],
  ['User Group Management', true],
  ['Time-Based Access Policies', true],
  ['Change Management', true],
  ['Audit Logs', true],
  ['Password Vault', true],
  ['Command Restrictions', true],
]

const Donut = ({ value, total }) => {
  const r = 58, c = 2 * Math.PI * r, frac = value / total
  return (
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r={r} fill="none" stroke="var(--line)" strokeWidth="11" />
      <circle cx="75" cy="75" r={r} fill="none" stroke="var(--ok)" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 75 75)" />
      <text x="75" y="72" textAnchor="middle" fill="var(--ink)" style={{ fontSize: 24, fontWeight: 750 }}>{value}/{total}</text>
      <text x="75" y="92" textAnchor="middle" fill="var(--mut)" style={{ fontSize: 12 }}>days left</text>
    </svg>
  )
}
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.4 2.4 4.6-5" />
  </svg>
)
const SecHead = ({ icon, title }) => (
  <div className="hrow" style={{ gap: 8, margin: '20px 0 8px', color: 'var(--mut)' }}>
    <Icon name={icon} size={14} /><span style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{title}</span>
  </div>
)
const Row = ({ k, v, pill, vColor }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 18, padding: '6px 0', alignItems: 'flex-start' }}>
    <span style={{ fontSize: '12.75px', color: 'var(--mut)', flex: 'none' }}>{k}</span>
    {pill
      ? <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: 6, padding: '2px 9px' }}>{v}</span>
      : <span style={{ fontSize: '12.75px', color: vColor || 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{v}</span>}
  </div>
)

export default function LicenseV2() {
  const { toast } = useApp()
  return (
    <>
      <div className="hrow" style={{ gap: 14, marginBottom: 20 }}>
        <span style={{ width: 46, height: 46, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="certs" size={22} style={{ color: 'var(--accent)' }} /></span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>License Information</div>
          <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 2 }}>Review your current license, limits, and renewal status.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── LEFT ── */}
        <div className="card card-pad">
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.09em', color: 'var(--ok)', background: 'var(--ok-bg)', borderRadius: 999, padding: '4px 12px' }}>ACTIVE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}><Donut value={512} total={578} /></div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.01em' }}>BITCHIEF_LICENSE_PAM</div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: '10.75px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--ink-2)', background: 'var(--accent-bg)', borderRadius: 6, padding: '4px 11px' }}>TYPE: SUBSCRIPTION</span>
          </div>

          <div className="divider" style={{ margin: '20px 0 4px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>License Details</div>

          <SecHead icon="alerts" title="General Information" />
          <Row k="License ID:" v="BITC-PAM-20251201-2" />
          <Row k="Product:" v="Tanflow_PAM" />
          <Row k="Organization:" v="Bitchief Technology Services Private Limited" />
          <Row k="GSTIN:" v="06AAKCB9321N1ZA" />
          <Row k="Address:" v="DCG01-310, DLF Corporate Greens, Sector 74A, Gurgaon" />

          <SecHead icon="user" title="Contact Information" />
          <Row k="Client:" v="Tribhuwan Phulera" />
          <Row k="Designation:" v="Technical Architect" />
          <Row k="Email:" v="tribhuwan@bitchief.in" />
          <Row k="Phone:" v="7906364288" />

          <SecHead icon="calendar" title="License Duration" />
          <Row k="Issued At:" v="29/05/2026" />
          <Row k="Created On:" v="18/05/2026" />
          <Row k="Contract End:" v="28/12/2027" />
          <Row k="Validity:" v="28/12/2027" pill />

          <SecHead icon="server" title="Registered Machines" />
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', padding: '13px 15px' }}>
            <div className="hrow" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>Prod Machine</span>
              <span className="tag">#1</span>
            </div>
            <div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 7, wordBreak: 'break-all', lineHeight: 1.55 }}>aa03cc281e3866c1499746d7b4143810a5c40074ac77216a5760cde75637235a</div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="card card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>License Usage &amp; Limits</div>
            <select className="sel" style={{ width: 260 }} onChange={() => toast('ok', 'License', 'Switched license view (demo).')}>
              <option>BITC-PAM-20251201-2 (Active)</option>
            </select>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Capability/Feature</th><th style={{ textAlign: 'right' }}>PREMIUM_PAM</th></tr></thead>
              <tbody>
                {USAGE.map(([f, v], i) => (
                  <tr key={f} style={{ background: i % 2 ? 'var(--surface-2)' : 'transparent' }}>
                    <td style={{ fontSize: '13px', color: 'var(--ink)' }}>{f}</td>
                    <td style={{ textAlign: typeof v === 'string' ? 'right' : 'center' }}>
                      {v === true ? <CheckCircle /> : <span className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>{v}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
