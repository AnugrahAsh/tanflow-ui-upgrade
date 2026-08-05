import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

// Standing time windows. `state` is the clock's verdict; `enabled` is the operator's.
const SCHEDULES = [
  { id: 'branch-hours', name: 'Business hours — Branch Ops', enabled: true, recur: 'Daily', window: '08:00 – 18:30', subjects: 'Branch Operations · 214 users', scope: 'Core Banking targets (12)', validity: 'Jan 6, 2026 → no expiry', state: 'Open' },
  { id: 'sap-weekend', name: 'Change window — SAP weekend', enabled: true, recur: 'Weekly', window: 'Sat 22:00 – Sun 06:00', subjects: 'SAP Basis · 9 users', scope: 'sap-prd-* (4 targets)', validity: 'Mar 1 → Dec 31, 2026', state: 'Closed' },
  { id: 'vendor-8841', name: 'Contractor window — Vendor 8841', enabled: true, recur: 'Daily', window: '09:00 – 17:00', subjects: 'Contractor 8841', scope: 'BTSPAMDEV01 only', validity: 'Jun 12 → Sep 30, 2026', state: 'Open' },
  { id: 'treasury-qc', name: 'Quarter-close — Treasury extension', enabled: false, recur: 'Once', window: 'Jul 28 – Aug 2', subjects: 'Treasury Front Office · 126 users', scope: 'Murex · SWIFT gateways', validity: 'Jul 28 → Aug 2, 2026', state: 'Closed' },
  { id: 'night-freeze', name: 'Night freeze — production DBs', enabled: true, recur: 'Daily', window: '00:00 – 05:00 (deny)', subjects: 'Everyone except SOC on-call', scope: 'All production databases', validity: 'Feb 2, 2026 → no expiry', state: 'Closed' },
]

const STATE_TONE = {
  Open: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  Closed: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
  Off: { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)' },
}
const StateBadge = ({ state }) => {
  const t = STATE_TONE[state]
  return <span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)', padding: '2px 9px', whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.c }} />{state}</span>
}

export default function TimeBasedAccess() {
  const { toast, go } = useApp()
  const navigate = useNavigate()
  const [rows, setRows] = useState(SCHEDULES)

  const toggleEnabled = (id) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  const openEdit = (s) => navigate('/create-time-based-policy', { state: { edit: s } })

  const enabled = rows.filter((r) => r.enabled).length
  const openNow = rows.filter((r) => r.enabled && r.state === 'Open').length

  return (
    <>
      <PageHead
        title="Access Schedules"
        sub="Standing time windows that decide when access is usable — business-hours gates, recurring change windows and one-time extensions. JIT decides how long; schedules decide when at all."
        actions={<button className="btn btn-pri" onClick={() => go('create-time-based-policy')}><Icon name="plus" />New schedule</button>}
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Schedules" icon="calendar" val={rows.length} foot={`${enabled} enabled`} />
        <KpiTile label="Windows open now" icon="unlock" val={openNow} foot={<span className="hrow" style={{ gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />next closes 18:30 CET</span>} />
        <KpiTile label="Subjects governed" icon="users" val="351" foot="users &amp; groups in scope" />
        <KpiTile label="Launches denied (7d)" icon="ban" val="23" delta={-12} goodUp={false} foot="outside-window attempts" />
      </div>

      <div className="card">
        <div className="card-h">
          <div><div className="ch-t">Schedules</div><div className="ch-s">Two different states: the enable switch is yours; the window state is the clock’s</div></div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Schedule</th><th>Enabled</th><th>Recurrence</th><th>Window</th><th>Subjects</th><th>Scope</th><th>Validity</th><th>Right now</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => openEdit(s)} style={{ cursor: 'pointer' }} title={`Edit ${s.name}`}>
                  <td className="td-main">{s.name}</td>
                  <td><span className={`toggle ${s.enabled ? 'on' : ''}`} role="switch" aria-checked={s.enabled} onClick={(e) => { e.stopPropagation(); toggleEnabled(s.id) }} /></td>
                  <td><span className="tag">{s.recur}</span></td>
                  <td style={{ color: 'var(--ink-2)' }}>{s.window}</td>
                  <td><span className="link">{s.subjects}</span></td>
                  <td style={{ color: 'var(--ink-2)' }}>{s.scope}</td>
                  <td style={{ color: 'var(--mut)' }}>{s.validity}</td>
                  <td><StateBadge state={s.enabled ? s.state : 'Off'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: the Treasury extension overlaps the night freeze on Jul 28–Aug 2 — freeze wins unless you add an exception. Simulate before quarter-close.</span>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Overlap simulation', 'Night freeze wins for 5 of 126 subjects during Jul 28–Aug 2 (demo).')}><Icon name="eye" size={13} />Simulate overlap</button>
        </div>
      </div>
    </>
  )
}
