import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar, RiskPill, SevTag } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const EXTERNAL = [
  ['Temenos Managed Services', 'e.ferreira', 'core-banking-t24', '00:22:14', 'Medium'],
  ['AuditCo LLP', 'j.callahan', 'evidence-workspace', '01:04:52', 'Low'],
  ['Meridian Insurance', 's.demir', 'shared-claims-api', '00:08:31', 'Low'],
]
const EVENTS = [
  ['Vendor session started', 'Temenos engineer connected to core-banking-t24', 'Low', '4 min ago'],
  ['Out-of-hours access', 'AuditCo login at 23:14 local — allowed by policy', 'Medium', '38 min ago'],
  ['New device (unmanaged)', 'Insurance partner used a new laptop — stepped up to FIDO2', 'Medium', '2 hrs ago'],
]

export default function Monitor() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="Monitor"
        sub="Real-time visibility into third-party and external access — every vendor, partner and contractor session, watched and recorded."
        actions={
          <>
            <span className="hrow" style={{ gap: 7, fontSize: '12.25px', color: 'var(--mut)', marginRight: 6 }}><span className="live-dot" />3 external live</span>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Export CSV', 'External-access monitor exported as CSV (demo).')}><Icon name="download" />Export CSV</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="External sessions live" icon="eye" val="3" foot="all recorded" />
        <KpiTile label="Active vendors" icon="globe" val="14" foot="6 with standing access" />
        <KpiTile label="Open alerts" icon="alerts" val="3" delta={-25} goodUp={false} foot="1 medium" />
        <KpiTile label="p95 broker latency" icon="zap" val="88" unit="ms" foot="3 regions" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="External sessions" sub="Third-party access proxied through Tanflow" right={<span className="link" onClick={() => go('sessions')}>All sessions <Icon name="chevR" size={11} /></span>} />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Partner</th><th>User</th><th>Resource</th><th className="td-right">Duration</th><th>Risk</th><th style={{ width: 88 }} /></tr></thead>
              <tbody>
                {EXTERNAL.map((e) => (
                  <tr key={e[0] + e[1]} onClick={() => go('sessions')}>
                    <td className="td-main">{e[0]}</td>
                    <td><div className="cell-user"><Avatar name={e[1]} cls="av-sm" /><span>{e[1]}</span></div></td>
                    <td className="td-mono" style={{ color: 'var(--mut)' }}>{e[2]}</td>
                    <td className="td-right td-num">{e[3]}</td>
                    <td><RiskPill risk={e[4]} /></td>
                    <td><div className="row-actions"><button className="mini-btn" title="Shadow" onClick={(ev) => { ev.stopPropagation(); toast('ok', 'Shadowing', 'Read-only live view opened (demo).') }}><Icon name="eye" size={14} /></button><button className="mini-btn danger" title="Terminate" onClick={(ev) => { ev.stopPropagation(); toast('err', 'Terminated', 'External session killed & access revoked (demo).') }}><Icon name="ban" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Monitor events" sub="Live triggers from external access" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {EVENTS.map((e) => (
              <div key={e[0] + e[3]} style={{ padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{e[0]}</span><SevTag sev={e[2]} />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 3 }}>{e[1]}</div>
                <div style={{ fontSize: '10.75px', color: 'var(--faint)', marginTop: 3 }}>{e[3]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
