import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const ELEVATIONS = [
  ['Priya Sharma', 'Oracle SYSDBA', 'ora-fin-prd-03 only', 'DBA-Incident', 12, 45],
  ['Marcus Bennett', 'root (sudo)', 'sap-prd-app01', 'Change-Window', 78, 120],
  ['Julia Novak', 'k8s cluster-admin', 'prod / payments ns', 'Deploy-Std', 9, 15],
  ['Omar Aziz', 'Firewall write', 'fw-core-01 · fw-core-02', 'NetChange', 31, 60],
  ['SOC on-call', 'EDR isolate rights', 'all endpoints', 'IR-Playbook', 214, 240],
]
const POLICIES = [
  ['DBA-Incident', 'Oracle/SQL SYSDBA · max 45 min', 'Ticket required · auto-approve P1/P2'],
  ['Change-Window', 'root/Administrator · max 2 hrs', 'Only inside approved CAB windows'],
  ['Deploy-Std', 'k8s + cloud deploy roles · 15 min', 'Auto-approve for release team'],
  ['IR-Playbook', 'EDR + SIEM admin · 4 hrs', 'SOC leads · auto-extend during incident'],
  ['Break-Glass', 'Domain Admin · 1 hr', 'Dual control + CISO page-out'],
]

export default function Jit() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Just-in-Time Access"
        sub="Zero standing privilege — elevation is granted for minutes, not months, and evaporates on expiry."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="settings" />Elevation policies</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Request elevation', 'Target picker with policy-computed max window (demo).')}><Icon name="plus" />Request elevation</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Standing privilege reduction" icon="jit" val="61" unit="%" delta={18} foot="since JIT rollout" spark={[20, 24, 29, 33, 38, 41, 47, 50, 54, 57, 59, 61]} />
        <KpiTile label="Active elevations" icon="unlock" val="9" foot="avg 32 min remaining" />
        <KpiTile label="Elevations (30d)" icon="zap" val="1,412" foot="96% auto-approved by policy" />
        <KpiTile label="Expired without renewal" icon="shieldCheck" val="100" unit="%" foot="no orphaned grants" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Active elevations" sub="Time-boxed grants counting down" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>User</th><th>Elevated to</th><th>Scope</th><th>Policy</th><th style={{ width: 190 }}>Time remaining</th><th style={{ width: 96 }} /></tr></thead>
              <tbody>
                {ELEVATIONS.map((j) => {
                  const pct = Math.round(j[4] / j[5] * 100)
                  return (
                    <tr key={j[0] + j[1]}>
                      <td><div className="cell-user"><Avatar name={j[0]} cls="av-sm" /><span className="td-main">{j[0]}</span></div></td>
                      <td><span className="tag tag-acc">{j[1]}</span></td>
                      <td style={{ color: 'var(--mut)' }}>{j[2]}</td>
                      <td><span className="tag">{j[3]}</span></td>
                      <td><div className="hrow"><div className={`meter ${pct < 20 ? 'm-bad' : pct < 50 ? 'm-warn' : ''}`} style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div><span className="num" style={{ fontSize: '11.5px', width: 52, textAlign: 'right' }}>{j[4]} min</span></div></td>
                      <td><div className="row-actions">
                        <button className="mini-btn" title="Extend" onClick={() => toast('ok', 'Extension', 'Extension request routed to policy owner (demo).')}><Icon name="clock" size={14} /></button>
                        <button className="mini-btn danger" title="Revoke now" onClick={() => toast('warn', 'Revoked', 'Elevation revoked, sessions closed (demo).')}><Icon name="ban" size={14} /></button>
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Elevation policies" sub="What can be borrowed, for how long" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
            {POLICIES.map((p) => (
              <div key={p[0]} style={{ padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.75px', fontWeight: 650 }}>{p[0]}</span>
                  <span className="link" onClick={() => toast('ok', p[0], 'Policy editor (demo).')}>Edit</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-2)', marginTop: 2 }}>{p[1]}</div>
                <div style={{ fontSize: '11.25px', color: 'var(--mut)', marginTop: 1 }}>{p[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
