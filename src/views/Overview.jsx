import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar, RiskPill, SevTag, Badge, MeterRow, Legend, IntLogo } from '../components/primitives.jsx'
import { AreaChart, BarChart, RingGauge } from '../components/charts/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave, H24 } from '../lib/series.js'
import { fmt } from '../lib/format.js'
import { ALERTS, SESSIONS, CAMPAIGNS, INTEGRATIONS } from '../data/mockData.js'

// Deterministic authentication series (identical to the original prototype).
const AUTH_OK = wave(24, 4200, 2600, 7, 9, 2200).map((v, i) => (i > 6 && i < 19 ? v + 3400 : v))
const AUTH_FAIL = AUTH_OK.map((v, i) => Math.round(v * (i === 13 ? 0.055 : 0.018) + 8))
const yK = (v) => (v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'K' : v)

export default function Overview() {
  const { go, toast, openPalette } = useApp()
  const alerts = ALERTS.slice(0, 4)

  const Link = ({ to, children }) => (
    <span className="link" onClick={() => go(to)}>{children} <Icon name="chevR" size={11} /></span>
  )

  return (
    <>
      <PageHead
        title="Security Overview"
        sub="Real-time posture across identity, privileged access and governance — Meridian Global Bank production tenant."
        actions={
          <>
            <div className="seg">
              <button className="on">24h</button>
              <button onClick={() => toast('ok', 'Range updated', 'Showing last 7 days (demo).')}>7d</button>
              <button onClick={() => toast('ok', 'Range updated', 'Showing last 30 days (demo).')}>30d</button>
            </div>
            <button className="btn btn-sec"><Icon name="download" />Export</button>
            <button className="btn btn-pri" onClick={openPalette}><Icon name="plus" />Quick action</button>
          </>
        }
      />

      <div className="kpi-row cols-6">
        <KpiTile label="Total identities" icon="users" val="48,213" delta={1.2} foot="vs last 30d" spark={wave(12, 40, 14, 3)} />
        <KpiTile label="Privileged accounts" icon="vault" val="3,842" delta={-2.1} goodUp={false} foot="standing privilege ↓" spark={wave(12, 44, 10, 5).map((v, i) => 60 - i * 1.5 + v / 10)} />
        <KpiTile label="Active sessions" icon="sessions" val="217" foot={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="live-dot" />6 privileged live</span>} />
        <KpiTile label="MFA coverage" icon="mfa" val="96.4" unit="%" delta={0.8} foot="FIDO2 at 41%" spark={wave(12, 80, 8, 9).map((v, i) => v + i)} />
        <KpiTile label="Open SoD violations" icon="policies" val="10" delta={-24} goodUp={false} foot="3 critical" />
        <KpiTile label="Certification items due" icon="certs" val="347" foot="Q3 SOX · 13 days left" />
      </div>

      <div className="grid-23" style={{ marginBottom: 16 }}>
        <div className="card">
          <CardHeader
            title="Authentication activity"
            sub="All protocols — SSO, LDAP, RADIUS, TACACS+, API tokens · last 24 hours"
            right={<Legend items={[{ c: '#2a78d6', n: 'Successful', line: true }, { c: '#e34948', n: 'Denied', line: true }]} />}
          />
          <div className="card-pad" style={{ paddingTop: 12 }}>
            <AreaChart
              series={[{ name: 'Successful', color: '#2a78d6', data: AUTH_OK }, { name: 'Denied', color: '#e34948', data: AUTH_FAIL }]}
              labels={H24}
              yFmt={yK}
              xEvery={3}
            />
          </div>
          <div className="card-f">
            <div className="stat-inline"><b>128.4K</b><span>events today</span></div>
            <div className="divider" style={{ width: 1, height: 18, margin: 0 }} />
            <div className="stat-inline"><b>1.7%</b><span>denial rate</span></div>
            <div className="divider" style={{ width: 1, height: 18, margin: 0 }} />
            <div className="stat-inline"><b>84ms</b><span>median decision</span></div>
            <span className="link" style={{ marginLeft: 'auto' }} onClick={() => go('analytics')}>Open analytics <Icon name="chevR" size={11} /></span>
          </div>
        </div>

        <div className="card">
          <CardHeader title="Identity risk posture" sub="Composite score across 6 risk domains" />
          <div className="card-pad">
            <div className="ring-wrap" style={{ marginBottom: 16 }}>
              <RingGauge pct={92} label="92" cap="Strong" color="#12A159" track="#D3EEDE" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.75px', fontWeight: 600, color: 'var(--ink)' }}>Up 4 points this quarter</div>
                <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5 }}>Standing privilege reduced 18% after JIT rollout to the Oracle estate.</div>
                <div style={{ marginTop: 8 }}><Badge tone="ok" label="Exceeds board target · 85" /></div>
              </div>
            </div>
            <div className="stack" style={{ gap: 11 }}>
              <MeterRow label="MFA coverage" val="96%" pct={96} mood="m-ok" />
              <MeterRow label="Zero standing privilege" val="61%" pct={61} />
              <MeterRow label="SoD hygiene" val="88%" pct={88} mood="m-ok" />
              <MeterRow label="Vault health" val="94%" pct={94} mood="m-ok" />
              <MeterRow label="Dormant account debt" val="72%" pct={72} mood="m-warn" />
              <MeterRow label="Cert. timeliness" val="83%" pct={83} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card">
          <CardHeader title="Priority alerts" sub="4 of 23 open" right={<Link to="alerts">Alert center</Link>} />
          <div>
            {alerts.map((a) => (
              <div className="alert-row" key={a.id} onClick={() => go('alerts')}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="al-t">{a.t}</div>
                  <div className="al-s">{a.s}</div>
                  <div className="al-meta"><SevTag sev={a.sev} /><span className="al-time">{a.time} · {a.src}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <CardHeader
            title="Privileged sessions"
            sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="live-dot" />6 live now</span>}
            right={<Link to="sessions">Monitor</Link>}
          />
          <div>
            {SESSIONS.slice(0, 5).map((s) => (
              <div className="sess-mini" key={s.id} onClick={() => go('sessions')}>
                <Avatar name={s.user} cls="av-sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.25px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span className="mono" style={{ fontSize: '10.75px', color: 'var(--mut)' }}>{s.acct}@</span>{s.target}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mut)' }}>{s.user} · {s.proto} · <span className="num">{s.t}</span></div>
                </div>
                <RiskPill risk={s.risk} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <CardHeader title="Certification campaigns" sub="3 running · 347 items due" right={<Link to="certs">All campaigns</Link>} />
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {CAMPAIGNS.slice(0, 3).map((c) => (
              <div style={{ cursor: 'pointer' }} key={c.n} onClick={() => go('certs')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.n}</span>
                  <span className="num" style={{ fontSize: 12, fontWeight: 650, color: c.prog > 90 ? 'var(--ok)' : 'var(--ink)', flex: 'none' }}>{c.prog}%</span>
                </div>
                <div className={`meter ${c.prog > 90 ? 'm-ok' : c.prog < 35 ? 'm-warn' : ''}`}><i style={{ width: `${c.prog}%` }} /></div>
                <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 5 }}>{fmt(c.done)} of {fmt(c.items)} decided · due {c.due}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-32">
        <div className="card">
          <CardHeader title="Lifecycle events" sub="Joiners, movers & leavers processed this week" />
          <div className="card-pad" style={{ paddingTop: 10 }}>
            <BarChart labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} values={[112, 148, 96, 134, 168, 22, 14]} color="#2a78d6" name="Events" h={180} />
          </div>
          <div className="card-f">
            <div className="stat-inline"><b>694</b><span>processed</span></div>
            <div className="stat-inline"><b>38s</b><span>median deprovision</span></div>
            <span className="link" style={{ marginLeft: 'auto' }} onClick={() => go('provisioning')}>Provisioning <Icon name="chevR" size={11} /></span>
          </div>
        </div>

        <div className="card">
          <CardHeader title="Integration health" sub="12 enterprise connectors" right={<Link to="integrations">Manage</Link>} />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {INTEGRATIONS.slice(0, 6).map((g) => (
              <div className="int-mini" key={g.n}>
                <IntLogo item={g} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{g.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--mut)' }}>Sync {g.sync} · {g.objs.split('·')[0]}</div>
                </div>
                <div style={{ width: 120, flex: 'none' }} className="hrow">
                  <div className={`meter ${g.health >= 95 ? 'm-ok' : g.health >= 85 ? 'm-warn' : 'm-bad'}`} style={{ flex: 1 }}><i style={{ width: `${g.health}%` }} /></div>
                  <span className="num" style={{ fontSize: 11, fontWeight: 650, color: 'var(--ink-2)', width: 32, textAlign: 'right' }}>{g.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
