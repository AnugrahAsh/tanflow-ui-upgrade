import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, SevTag } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ALERTS } from '../data/mockData.js'

const SEV_BG = { Critical: 'var(--bad-bg)', High: '#FDEEE5', Medium: 'var(--warn-bg)' }
const SEV_FG = { Critical: 'var(--bad)', High: '#B3541E', Medium: 'var(--warn)' }

function stateBadge(state) {
  if (state === 'Auto-remediated') return <Badge tone="ok" label="Auto-remediated" />
  if (state === 'Investigating') return <Badge tone="info" label="Investigating" />
  if (state === 'Acknowledged') return <Badge tone="mut" label="Acknowledged" />
  return <Badge tone="warn" label="Open" />
}

export default function Alerts() {
  const { toast } = useApp()
  const alertAction = (id, act) => toast(act === 'resolve' ? 'ok' : 'warn', act === 'resolve' ? 'Alert resolved' : 'Alert assigned', `${id} ${act === 'resolve' ? 'closed with disposition note.' : 'assigned to SOC Tier-2 queue.'} (demo)`)

  return (
    <>
      <PageHead
        title="Alert Center"
        sub="Identity threat detection & response — correlated alerts from the risk engine, PAM proxies, governance and AAA plane."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="settings" />Detection rules</button>
            <button className="btn btn-sec"><Icon name="external" />Send to SIEM</button>
          </>
        }
      />
      <div className="kpi-row cols-5">
        <KpiTile label="Open alerts" icon="alerts" val="23" delta={-18} goodUp={false} foot="vs last week" />
        <KpiTile label="Critical" icon="warnTri" val="3" foot="2 under investigation" />
        <KpiTile label="MTTA" icon="clock" val="4.2" unit="min" delta={-31} goodUp={false} foot="median time to acknowledge" />
        <KpiTile label="Auto-remediated (7d)" icon="zap" val="41" unit="%" delta={12} foot="by playbooks" />
        <KpiTile label="False-positive rate" icon="check" val="2.1" unit="%" delta={-0.8} goodUp={false} foot="model precision 97.9%" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="seg"><button className="on">Open (23)</button><button onClick={() => toast('ok', 'View', 'Investigating (demo)')}>Investigating</button><button onClick={() => toast('ok', 'View', 'Resolved (demo)')}>Resolved 7d</button></div>
          <button className="fchip on"><Icon name="filter" size={12} />Severity ≥ Medium</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export</button>
        </div>
        <div>
          {ALERTS.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--hair)', alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 4, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SEV_BG[a.sev] || 'var(--surface-3)', color: SEV_FG[a.sev] || 'var(--mut)' }}>
                <Icon name="alerts" size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hrow" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 650 }}>{a.t}</span>
                  <SevTag sev={a.sev} />
                  <span className="tag">{a.src}</span>
                  {stateBadge(a.state)}
                </div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 4, maxWidth: '90ch' }}>{a.s}</div>
                <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 5 }}>{a.id} · {a.time}</div>
              </div>
              <div className="hrow" style={{ flex: 'none', paddingTop: 3 }}>
                <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Investigation', 'Timeline, related sessions & identities, response actions (demo).')}><Icon name="eye" />Investigate</button>
                <button className="btn btn-sec btn-sm" onClick={() => alertAction(a.id, 'assign')}><Icon name="users" />Assign</button>
                <button className="btn btn-pri btn-sm" onClick={() => alertAction(a.id, 'resolve')}><Icon name="check" />Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
