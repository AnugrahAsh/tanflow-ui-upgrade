import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, SevTag, Legend } from '../components/primitives.jsx'
import { Heatmap, SegBar, SEQ } from '../components/charts/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave, H24 } from '../lib/series.js'
import { fmt } from '../lib/format.js'
import { HEAT, HEAT_ROWS, FAIL_REASONS, TOP_APPS, GEO, ANOMALIES } from '../data/mockData.js'

export default function Analytics() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="Access Analytics"
        sub="Who is accessing what, from where, and how it deviates from baseline — across every connected system."
        actions={
          <>
            <div className="seg">
              <button onClick={() => toast('ok', 'Range', '24h (demo)')}>24h</button>
              <button className="on">7d</button>
              <button onClick={() => toast('ok', 'Range', '30d (demo)')}>30d</button>
              <button onClick={() => toast('ok', 'Range', '90d (demo)')}>90d</button>
            </div>
            <button className="btn btn-sec"><Icon name="filter" />All applications</button>
            <button className="btn btn-sec"><Icon name="download" />Export</button>
          </>
        }
      />
      <div className="kpi-row cols-5">
        <KpiTile label="Auth events (7d)" icon="activity" val="3.98" unit="M" delta={4.2} foot="vs prior week" spark={wave(12, 50, 20, 11)} />
        <KpiTile label="Unique active identities" icon="users" val="31,204" delta={1.8} foot="64.7% of directory" />
        <KpiTile label="Failure rate" icon="ban" val="1.9" unit="%" delta={-0.3} goodUp={false} foot="baseline 2.4%" />
        <KpiTile label="Step-up challenges" icon="mfa" val="84,210" delta={12} foot="risk-triggered" spark={wave(12, 40, 22, 13)} sparkColor="#1baf7a" />
        <KpiTile label="Anomalies detected" icon="adaptive" val="29" delta={-18} goodUp={false} foot="5 need review" />
      </div>

      <div className="grid-23" style={{ marginBottom: 16 }}>
        <div className="card">
          <CardHeader title="Authentication density" sub="Volume by hour × weekday (UTC) — hover any cell" />
          <div className="card-pad" style={{ paddingTop: 12 }}>
            <Heatmap rows={HEAT_ROWS} cols={H24.map((h) => h.slice(0, 2))} data={HEAT} fmtV={(v) => fmt(v)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: '10.75px', color: 'var(--mut)' }}>
              <span>Quiet</span>
              {[0, 2, 4, 6, 8].map((i) => <span key={i} style={{ width: 14, height: 9, borderRadius: 3, background: SEQ[i] }} />)}
              <span>Peak</span>
              <span style={{ marginLeft: 'auto' }}>Peak: Fri 11:00 · 9,412 events</span>
            </div>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Failure breakdown" sub="Share of 76.4K denials (7d)" />
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAIL_REASONS.map((f) => (
              <div className="geo-row" key={f[0]}>
                <span className="g-name" style={{ width: 150 }}>{f[0]}</span>
                <div className="g-bar"><i style={{ width: `${f[1] * 2}%`, background: '#2a78d6' }} /></div>
                <span className="g-val">{f[1]}%</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.55 }}>
              <Icon name="sparkle" size={12} /> <b style={{ color: 'var(--ink-2)' }}>Copilot:</b> Expired-credential denials fell 31% after vault-enforced rotation went live on the Windows estate.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <CardHeader title="Top applications by sign-ins" sub="7 days · all protocols" />
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TOP_APPS.map((a) => (
              <div className="geo-row" key={a[0]}>
                <span className="g-name" style={{ width: 150 }}>{a[0]}</span>
                <div className="g-bar"><i style={{ width: `${(a[1] / TOP_APPS[0][1] * 100).toFixed(1)}%`, background: '#2a78d6' }} /></div>
                <span className="g-val">{a[1] >= 1000 ? (a[1] / 1000).toFixed(0) + 'K' : a[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <CardHeader title="Sign-in geography" sub="By source country · 7 days" />
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {GEO.map((g) => (
              <div className="geo-row" key={g[1]}>
                <span className="g-flag">{g[0]}</span>
                <span className="g-name">{g[1]}</span>
                <div className="g-bar"><i style={{ width: `${(g[2] / GEO[0][2] * 100).toFixed(1)}%`, background: '#1baf7a' }} /></div>
                <span className="g-val">{(g[2] / 1000).toFixed(0)}K</span>
              </div>
            ))}
            <div className="divider" />
            <div className="hrow" style={{ justifyContent: 'space-between', fontSize: '11.75px', color: 'var(--mut)' }}>
              <span>2 first-time countries this week</span><Badge tone="warn" label="Review geo policy" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-32">
        <div className="card">
          <CardHeader title="MFA method mix" sub="Primary second factor across 46,480 enrolled identities" />
          <div className="card-pad">
            <SegBar h={12} segs={[{ n: 'FIDO2 / Passkeys', v: 19057, c: '#2a78d6' }, { n: 'Push (Tanflow Verify)', v: 16268, c: '#1baf7a' }, { n: 'TOTP authenticator', v: 7437, c: '#eda100' }, { n: 'SMS / Voice (legacy)', v: 3718, c: '#e34948' }]} />
            <div style={{ marginTop: 12 }}>
              <Legend items={[{ c: '#2a78d6', n: 'FIDO2 / Passkeys · 41%' }, { c: '#1baf7a', n: 'Push · 35%' }, { c: '#eda100', n: 'TOTP · 16%' }, { c: '#e34948', n: 'SMS / Voice · 8%' }]} />
            </div>
            <div className="divider" />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.55 }}>
              SMS fallback is scheduled for retirement <b style={{ color: 'var(--ink-2)' }}>Oct 2026</b>. 3,718 identities need migration — <span className="link" onClick={() => go('mfa')}>create migration campaign</span>.
            </div>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Detected anomalies" sub="Risk engine · UEBA baseline deviations" right={<span className="link" onClick={() => go('alerts')}>Investigate all <Icon name="chevR" size={11} /></span>} />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Pattern</th><th>Subject</th><th>Detail</th><th>Severity</th><th className="td-right">Count</th></tr></thead>
              <tbody>
                {ANOMALIES.map((a) => (
                  <tr key={a.t} onClick={() => go('alerts')}>
                    <td className="td-main">{a.t}</td>
                    <td style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.u}</td>
                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--mut)' }}>{a.d}</td>
                    <td><SevTag sev={a.sev} /></td>
                    <td className="td-right td-num">{a.n}</td>
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
