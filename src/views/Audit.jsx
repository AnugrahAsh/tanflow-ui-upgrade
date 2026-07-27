import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { SevTag, Toggle } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AUDIT_ROWS } from '../data/mockData.js'

export default function Audit() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Audit Log"
        sub="Immutable, hash-chained event ledger — every authentication, authorization, admin action and policy decision."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Integrity check', 'Hash chain verified — 2.41M events, no gaps (demo).')}><Icon name="shieldCheck" />Verify integrity</button>
            <button className="btn btn-pri"><Icon name="download" />Export</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Events (24h)" icon="audit" val="2.41" unit="M" foot="streamed to Splunk & Sentinel" />
        <KpiTile label="Admin actions" icon="settings" val="312" foot="all dual-logged" />
        <KpiTile label="Retention" icon="lock" val="7" unit="yrs" foot="WORM storage · regulatory" />
        <KpiTile label="Chain integrity" icon="shieldCheck" val="Valid" foot="last verified 04:00 UTC" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Query — e.g. event:pam.* actor:m.bennett" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Severity: All</button>
          <button className="fchip"><Icon name="filter" size={12} />Source: All</button>
          <button className="fchip"><Icon name="calendar" size={12} />Last 24 hours</button>
          <div className="tb-spacer" />
          <span className="hrow" style={{ gap: 6, fontSize: '11.75px', color: 'var(--mut)' }}><span className="live-dot" />Live tail</span>
          <Toggle defaultOn />
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Event</th><th>Detail</th><th>Actor</th><th>Source IP</th><th>Severity</th></tr></thead>
            <tbody>
              {AUDIT_ROWS.map((a, i) => (
                <tr key={i} onClick={() => toast('ok', a.ev, 'Raw event JSON with hash-chain proof (demo).')}>
                  <td className="td-num" style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{a.time}</td>
                  <td><span className="code-chip">{a.ev}</span></td>
                  <td style={{ maxWidth: 430, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink-2)' }}>{a.detail}</td>
                  <td className="td-mono">{a.actor}</td>
                  <td className="td-mono" style={{ color: 'var(--mut)' }}>{a.ip}</td>
                  <td><SevTag sev={a.sev} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>26 of 2,412,048 events · query took 42ms</span>
          <div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><span style={{ color: 'var(--faint)' }}>…</span><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
      </div>
    </>
  )
}
