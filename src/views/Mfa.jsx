import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, RiskPill, StatusBadge, MeterRow, Toggle } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'

const FACTORS = [
  ['FIDO2 security keys & passkeys', 'Phishing-resistant', '19,057', 'Tier 0–3 (all)', 'Enabled', true],
  ['Tanflow Verify push + number match', 'Strong', '16,268', 'Tier 1–3', 'Enabled', true],
  ['TOTP authenticator apps', 'Strong', '7,437', 'Tier 2–3', 'Enabled', true],
  ['Windows Hello for Business', 'Phishing-resistant', '11,204', 'Workstation unlock', 'Enabled', true],
  ['SMS one-time code', 'Legacy', '3,214', 'Tier 3 fallback only', 'Suspended', false],
  ['Voice call', 'Legacy', '504', 'Retiring Oct 2026', 'Suspended', false],
]
const STEPUP = [
  ['Low risk', 'SSO session token honored', 'ok'],
  ['Medium risk', 'Any strong factor', 'warn'],
  ['High risk', 'Phishing-resistant only', 'high'],
  ['Critical risk', 'Deny + identity verification', 'bad'],
]

function classBadge(cls) {
  if (cls === 'Phishing-resistant') return <Badge tone="ok" label={cls} dot={false} />
  if (cls === 'Strong') return <Badge tone="acc" label={cls} dot={false} />
  return <Badge tone="warn" label={cls} dot={false} />
}

export default function Mfa() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="Multi-Factor Authentication"
        sub="Phishing-resistant by default — FIDO2 first, with policy-controlled fallbacks and automatic fatigue protection."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Enrollment campaign', 'Targets the 1,736 unenrolled identities with staged deadlines (demo).')}><Icon name="users" />Enrollment campaign</button>
            <button className="btn btn-pri"><Icon name="plus" />New MFA policy</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="MFA coverage" icon="mfa" val="96.4" unit="%" delta={0.8} foot="46,480 enrolled" spark={wave(12, 80, 6, 31).map((v, i) => v + i * 1.2)} />
        <KpiTile label="Phishing-resistant share" icon="shieldCheck" val="41" unit="%" delta={9} foot="FIDO2 / passkeys" />
        <KpiTile label="Challenges (24h)" icon="activity" val="38.2" unit="K" foot="92% approved < 8s" />
        <KpiTile label="Fatigue attacks blocked" icon="ban" val="3" foot="this week · auto step-up" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Authentication factors" sub="Availability and enrollment by method" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Factor</th><th>Class</th><th className="td-right">Enrolled</th><th>Policy tier</th><th>State</th><th style={{ width: 60 }} /></tr></thead>
              <tbody>
                {FACTORS.map((f) => (
                  <tr key={f[0]}>
                    <td className="td-main">{f[0]}</td>
                    <td>{classBadge(f[1])}</td>
                    <td className="td-right td-num">{f[2]}</td>
                    <td style={{ color: 'var(--mut)' }}>{f[3]}</td>
                    <td><StatusBadge status={f[4]} /></td>
                    <td><Toggle defaultOn={f[5]} onToggle={() => toast('ok', 'Factor updated', 'Change staged — publish to apply tenant-wide (demo).')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tbl-foot"><span><Icon name="sparkle" size={12} /> Copilot: enabling number-match reduced accidental approvals 88% since March.</span></div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Step-up policy matrix" sub="When risk rises, assurance rises" />
            <div className="card-pad" style={{ paddingTop: 10 }}>
              {STEPUP.map((r) => (
                <div className="hrow" key={r[0]} style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                  {r[2] === 'high' ? <span className="risk-pill rp-high"><i />High risk</span> : <RiskPill risk={r[0].split(' ')[0]} />}
                  <span style={{ fontSize: '12.25px', color: 'var(--ink-2)', fontWeight: 550 }}>{r[1]}</span>
                </div>
              ))}
              <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 10, lineHeight: 1.5 }}>Risk is computed per request by the <span className="link" onClick={() => go('adaptive')}>adaptive engine</span> — device, location, behavior, session heritage.</div>
            </div>
          </div>
          <div className="card">
            <CardHeader title="Enrollment gaps" sub="1,736 identities without MFA" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <MeterRow label="Branch tellers" val="812" pct={47} mood="m-warn" />
              <MeterRow label="Contractors" val="420" pct={24} mood="m-warn" />
              <MeterRow label="Service desk" val="221" pct={13} />
              <MeterRow label="Executives" val="8" pct={1} mood="m-bad" />
              <MeterRow label="Other" val="275" pct={15} />
              <div className="divider" />
              <button className="btn btn-sec" style={{ width: '100%' }} onClick={() => toast('ok', 'Reminder sent', 'Staged enrollment reminders issued; grace expires Aug 1 (demo).')}><Icon name="mail" />Send enrollment reminders</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
